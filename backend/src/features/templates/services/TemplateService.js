/**
 * Template Service
 * Business logic for email template management
 */

const Template = require('../models/Template');
const { NotFoundError, ValidationError } = require('../../../common/errors/AppError');
const { extractPlaceholders } = require('../../../common/utils/emailUtils');

class TemplateService {
  /**
   * Get all templates for a user
   * @param {number} userId - User ID
   * @param {boolean} activeOnly - Whether to get only active templates
   * @returns {Array} Array of templates
   */
  async getUserTemplates(userId, activeOnly = true) {
    const whereClause = { userId };
    
    if (activeOnly) {
      whereClause.isActive = true;
    }

    return await Template.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get template by ID
   * @param {number} templateId - Template ID
   * @param {number} userId - User ID (for authorization)
   * @returns {object} Template instance
   */
  async getTemplateById(templateId, userId) {
    const template = await Template.findOne({
      where: {
        id: templateId,
        userId,
        isActive: true,
      },
    });

    if (!template) {
      throw new NotFoundError('Template');
    }

    return template;
  }

  /**
   * Create new template
   * @param {object} templateData - Template data
   * @param {number} userId - User ID
   * @returns {object} Created template
   */
  async createTemplate(templateData, userId) {
    const { name, subject, body } = templateData;

    // Validate required fields
    if (!name || !subject || !body) {
      throw new ValidationError('Name, subject, and body are required');
    }

    // Extract placeholders from subject and body
    const subjectPlaceholders = extractPlaceholders(subject);
    const bodyPlaceholders = extractPlaceholders(body);
    const allPlaceholders = [...new Set([...subjectPlaceholders, ...bodyPlaceholders])];

    // Check if template name already exists for this user
    const existingTemplate = await Template.findOne({
      where: {
        name,
        userId,
        isActive: true,
      },
    });

    if (existingTemplate) {
      throw new ValidationError('Template name already exists');
    }

    return await Template.create({
      name,
      subject,
      body,
      placeholders: allPlaceholders,
      userId,
    });
  }

  /**
   * Update template
   * @param {number} templateId - Template ID
   * @param {object} updateData - Data to update
   * @param {number} userId - User ID (for authorization)
   * @returns {object} Updated template
   */
  async updateTemplate(templateId, updateData, userId) {
    const template = await this.getTemplateById(templateId, userId);
    
    const { name, subject, body } = updateData;

    // If name is being updated, check for duplicates
    if (name && name !== template.name) {
      const existingTemplate = await Template.findOne({
        where: {
          name,
          userId,
          isActive: true,
          id: { [require('sequelize').Op.ne]: templateId }, // Exclude current template
        },
      });

      if (existingTemplate) {
        throw new ValidationError('Template name already exists');
      }
    }

    // Update placeholders if subject or body changed
    let placeholders = template.placeholders;
    if (subject || body) {
      const newSubject = subject || template.subject;
      const newBody = body || template.body;
      
      const subjectPlaceholders = extractPlaceholders(newSubject);
      const bodyPlaceholders = extractPlaceholders(newBody);
      placeholders = [...new Set([...subjectPlaceholders, ...bodyPlaceholders])];
    }

    return await template.update({
      ...updateData,
      placeholders,
    });
  }

  /**
   * Delete template (soft delete)
   * @param {number} templateId - Template ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if deleted
   */
  async deleteTemplate(templateId, userId) {
    const template = await this.getTemplateById(templateId, userId);
    
    await template.update({ isActive: false });
    return true;
  }

  /**
   * Search templates by name or content
   * @param {string} query - Search query
   * @param {number} userId - User ID
   * @returns {Array} Array of matching templates
   */
  async searchTemplates(query, userId) {
    const { Op } = require('sequelize');
    
    return await Template.findAll({
      where: {
        userId,
        isActive: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { subject: { [Op.iLike]: `%${query}%` } },
          { body: { [Op.iLike]: `%${query}%` } },
        ],
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get template statistics for a user
   * @param {number} userId - User ID
   * @returns {object} Template statistics
   */
  async getTemplateStats(userId) {
    const totalTemplates = await Template.count({
      where: { userId, isActive: true },
    });

    const templatesWithPlaceholders = await Template.count({
      where: {
        userId,
        isActive: true,
        placeholders: { [require('sequelize').Op.ne]: [] },
      },
    });

    return {
      total: totalTemplates,
      withPlaceholders: templatesWithPlaceholders,
      withoutPlaceholders: totalTemplates - templatesWithPlaceholders,
    };
  }

  /**
   * Duplicate template
   * @param {number} templateId - Template ID to duplicate
   * @param {number} userId - User ID
   * @param {string} newName - New template name (optional)
   * @returns {object} Duplicated template
   */
  async duplicateTemplate(templateId, userId, newName = null) {
    const originalTemplate = await this.getTemplateById(templateId, userId);
    
    const duplicateName = newName || `${originalTemplate.name} (Copy)`;
    
    // Ensure the new name is unique
    let finalName = duplicateName;
    let counter = 1;
    
    while (await Template.findOne({ where: { name: finalName, userId, isActive: true } })) {
      finalName = `${duplicateName} ${counter}`;
      counter++;
    }

    return await Template.create({
      name: finalName,
      subject: originalTemplate.subject,
      body: originalTemplate.body,
      placeholders: originalTemplate.placeholders,
      userId,
    });
  }
}

module.exports = TemplateService;

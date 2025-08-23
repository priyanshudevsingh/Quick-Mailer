/**
 * Email Service
 * Business logic for email operations
 */

const xlsx = require('xlsx');
const GmailService = require('../../../shared/gmail/GmailService');
const Template = require('../../templates/models/Template');
const User = require('../../auth/models/User');
const Attachment = require('../../attachments/models/Attachment');
const AuthService = require('../../auth/services/AuthService');
const { replacePlaceholders, isValidEmail } = require('../../../common/utils/emailUtils');
const { AppError, ValidationError, NotFoundError } = require('../../../common/errors/AppError');
const { EMAIL_TYPES } = require('../../../common/constants');

class EmailService {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Send a single email
   * @param {object} emailData - Email data
   * @param {number} userId - User ID
   * @returns {object} Send result
   */
  async sendEmail(emailData, userId) {
    const { 
      to, 
      templateId, 
      subject, 
      body, 
      placeholders = {}, 
      attachmentIds = [], 
      scheduledAt, 
      type = EMAIL_TYPES.IMMEDIATE 
    } = emailData;

    // Validate recipient
    if (!to || !isValidEmail(to)) {
      throw new ValidationError('Valid recipient email is required');
    }

    // Get user and check Gmail access
    let user = await User.findByPk(userId);
    if (!user.accessToken) {
      throw new AppError('Gmail access token not available. Please re-authenticate.', 400);
    }

    // Check if token is expired and refresh if needed
    if (user.tokenExpiry && new Date() >= user.tokenExpiry) {
      try {
        const newAccessToken = await this.authService.refreshGoogleToken(user);
        user.accessToken = newAccessToken;
      } catch (error) {
        throw new AppError('Gmail access token expired and refresh failed. Please re-authenticate.', 401);
      }
    }

    // Get final subject and body
    const { finalSubject, finalBody } = await this.prepareEmailContent(
      templateId, 
      subject, 
      body, 
      placeholders, 
      userId
    );

    // Get attachments
    const attachments = await this.getEmailAttachments(attachmentIds, userId);

    // Initialize Gmail service
    const gmailService = new GmailService(user.accessToken);

    let result;

    // Handle different email types
    if (type === EMAIL_TYPES.DRAFT) {
      result = await gmailService.saveDraft(to, finalSubject, finalBody, attachments);
      await this.authService.incrementUserStats(userId, 0, 1);
    } else if (type === EMAIL_TYPES.SCHEDULED && scheduledAt) {
      const scheduledTime = new Date(scheduledAt);
      if (isNaN(scheduledTime.getTime()) || scheduledTime <= new Date()) {
        throw new ValidationError('Invalid or past scheduled time');
      }
      result = await gmailService.scheduleEmail(to, finalSubject, finalBody, scheduledTime, attachments);
      await this.authService.incrementUserStats(userId, 1, 0);
    } else {
      // Immediate send
      result = await gmailService.sendEmail(to, finalSubject, finalBody, attachments);
      await this.authService.incrementUserStats(userId, 1, 0);
    }

    return {
      success: true,
      messageId: result.id,
      type,
      to,
      subject: finalSubject
    };
  }

  /**
   * Save email as draft
   * @param {object} emailData - Email data
   * @param {number} userId - User ID
   * @returns {object} Draft result
   */
  async saveDraft(emailData, userId) {
    return await this.sendEmail({ ...emailData, type: EMAIL_TYPES.DRAFT }, userId);
  }

  /**
   * Send mass emails from Excel file
   * @param {object} massEmailData - Mass email data
   * @param {number} userId - User ID
   * @returns {object} Mass email result
   */
  async sendMassEmail(massEmailData, userId) {
    const { templateId, attachmentIds = [], excelFile } = massEmailData;

    if (!templateId) {
      throw new ValidationError('Template ID is required');
    }

    if (!excelFile) {
      throw new ValidationError('Excel file is required');
    }

    // Get template
    const template = await Template.findOne({
      where: { id: templateId, userId, isActive: true }
    });

    if (!template) {
      throw new NotFoundError('Template');
    }

    // Parse Excel file
    const recipients = await this.parseExcelFile(excelFile, template.placeholders);

    // Get attachments
    const attachments = await this.getEmailAttachments(attachmentIds, userId);

    // Get user for Gmail access
    const user = await User.findByPk(userId);
    if (!user.accessToken) {
      throw new AppError('Gmail access token not available. Please re-authenticate.', 400);
    }

    const gmailService = new GmailService(user.accessToken);

    // Send emails with delay
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const recipient of recipients) {
      try {
        const finalSubject = replacePlaceholders(template.subject, recipient.placeholders);
        const finalBody = replacePlaceholders(template.body, recipient.placeholders);

        const result = await gmailService.sendEmail(
          recipient.email, 
          finalSubject, 
          finalBody, 
          attachments
        );

        results.push({
          email: recipient.email,
          success: true,
          messageId: result.id
        });
        successCount++;

        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.push({
          email: recipient.email,
          success: false,
          error: error.message
        });
        failureCount++;
      }
    }

    // Update user stats
    if (successCount > 0) {
      await this.authService.incrementUserStats(userId, successCount, 0);
    }

    return {
      success: true,
      totalRecipients: recipients.length,
      successCount,
      failureCount,
      results
    };
  }

  /**
   * Save mass emails as drafts
   * @param {object} massEmailData - Mass email data
   * @param {number} userId - User ID
   * @returns {object} Mass draft result
   */
  async saveMassEmailAsDrafts(massEmailData, userId) {
    const { templateId, attachmentIds = [], excelFile } = massEmailData;

    if (!templateId) {
      throw new ValidationError('Template ID is required');
    }

    if (!excelFile) {
      throw new ValidationError('Excel file is required');
    }

    // Get template
    const template = await Template.findOne({
      where: { id: templateId, userId, isActive: true }
    });

    if (!template) {
      throw new NotFoundError('Template');
    }

    // Parse Excel file
    const recipients = await this.parseExcelFile(excelFile, template.placeholders);

    // Get attachments
    const attachments = await this.getEmailAttachments(attachmentIds, userId);

    // Get user for Gmail access
    const user = await User.findByPk(userId);
    if (!user.accessToken) {
      throw new AppError('Gmail access token not available. Please re-authenticate.', 400);
    }

    const gmailService = new GmailService(user.accessToken);

    // Save drafts with delay
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const recipient of recipients) {
      try {
        const finalSubject = replacePlaceholders(template.subject, recipient.placeholders);
        const finalBody = replacePlaceholders(template.body, recipient.placeholders);

        const result = await gmailService.saveDraft(
          recipient.email, 
          finalSubject, 
          finalBody, 
          attachments
        );

        results.push({
          email: recipient.email,
          success: true,
          draftId: result.id
        });
        successCount++;

        // Add delay between drafts
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        results.push({
          email: recipient.email,
          success: false,
          error: error.message
        });
        failureCount++;
      }
    }

    // Update user stats
    if (successCount > 0) {
      await this.authService.incrementUserStats(userId, 0, successCount);
    }

    return {
      success: true,
      totalRecipients: recipients.length,
      successCount,
      failureCount,
      results
    };
  }

  /**
   * Generate Excel template for mass email
   * @param {number} templateId - Template ID
   * @param {number} userId - User ID
   * @returns {Buffer} Excel file buffer
   */
  async generateExcelTemplate(templateId, userId) {
    const template = await Template.findOne({
      where: { id: templateId, userId, isActive: true }
    });

    if (!template) {
      throw new NotFoundError('Template');
    }

    // Create Excel workbook
    const workbook = xlsx.utils.book_new();
    
    // Create headers: email + placeholders
    const headers = ['email', ...template.placeholders];
    
    // Create sample data
    const sampleData = [
      headers, // Header row
      ['example@email.com', ...template.placeholders.map(() => 'Sample Value')]
    ];

    const worksheet = xlsx.utils.aoa_to_sheet(sampleData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Recipients');

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Prepare email content from template or direct input
   * @private
   */
  async prepareEmailContent(templateId, subject, body, placeholders, userId) {
    if (templateId) {
      // Use template
      const template = await Template.findOne({
        where: { id: templateId, userId, isActive: true }
      });

      if (!template) {
        throw new NotFoundError('Template');
      }

      return {
        finalSubject: replacePlaceholders(template.subject, placeholders),
        finalBody: replacePlaceholders(template.body, placeholders)
      };
    } else if (subject && body) {
      // Direct subject and body
      return {
        finalSubject: subject,
        finalBody: body
      };
    } else {
      throw new ValidationError('Either templateId with placeholders OR subject and body are required');
    }
  }

  /**
   * Get email attachments
   * @private
   */
  async getEmailAttachments(attachmentIds, userId) {
    if (!attachmentIds || attachmentIds.length === 0) {
      return [];
    }

    return await Attachment.findAll({
      where: {
        id: attachmentIds,
        userId,
        isActive: true
      }
    });
  }

  /**
   * Parse Excel file for mass email
   * @private
   */
  async parseExcelFile(excelFile, requiredPlaceholders) {
    try {
      const workbook = xlsx.read(excelFile.buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new ValidationError('Excel file is empty');
      }

      const recipients = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        if (!row.email || !isValidEmail(row.email)) {
          throw new ValidationError(`Invalid email in row ${i + 2}: ${row.email || 'missing'}`);
        }

        const placeholders = {};
        for (const placeholder of requiredPlaceholders) {
          if (!(placeholder in row)) {
            throw new ValidationError(`Missing placeholder "${placeholder}" in row ${i + 2}`);
          }
          placeholders[placeholder] = row[placeholder];
        }

        recipients.push({
          email: row.email,
          placeholders
        });
      }

      return recipients;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Failed to parse Excel file: ${error.message}`);
    }
  }
}

module.exports = EmailService;

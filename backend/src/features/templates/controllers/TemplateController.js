/**
 * Template Controller
 * Handles HTTP requests for template endpoints
 */

const TemplateService = require('../services/TemplateService');
const ResponseUtils = require('../../../common/utils/responseUtils');
const asyncHandler = require('../../../common/utils/asyncHandler');
const { SUCCESS_MESSAGES } = require('../../../common/constants');

class TemplateController {
  constructor() {
    this.templateService = new TemplateService();
  }

  /**
   * Get all templates for current user
   * GET /templates
   */
  getTemplates = asyncHandler(async (req, res) => {
    const { search } = req.query;
    
    let templates;
    if (search) {
      templates = await this.templateService.searchTemplates(search, req.user.id);
    } else {
      templates = await this.templateService.getUserTemplates(req.user.id);
    }

    ResponseUtils.success(res, { templates }, 'Templates retrieved successfully');
  });

  /**
   * Get template by ID
   * GET /templates/:id
   */
  getTemplate = asyncHandler(async (req, res) => {
    const templateId = parseInt(req.params.id);
    const template = await this.templateService.getTemplateById(templateId, req.user.id);

    ResponseUtils.success(res, { template }, 'Template retrieved successfully');
  });

  /**
   * Create new template
   * POST /templates
   */
  createTemplate = asyncHandler(async (req, res) => {
    const template = await this.templateService.createTemplate(req.body, req.user.id);

    ResponseUtils.created(res, { template }, SUCCESS_MESSAGES.TEMPLATE_CREATED);
  });

  /**
   * Update template
   * PUT /templates/:id
   */
  updateTemplate = asyncHandler(async (req, res) => {
    const templateId = parseInt(req.params.id);
    const template = await this.templateService.updateTemplate(templateId, req.body, req.user.id);

    ResponseUtils.success(res, { template }, SUCCESS_MESSAGES.TEMPLATE_UPDATED);
  });

  /**
   * Delete template
   * DELETE /templates/:id
   */
  deleteTemplate = asyncHandler(async (req, res) => {
    const templateId = parseInt(req.params.id);
    
    await this.templateService.deleteTemplate(templateId, req.user.id);

    ResponseUtils.success(res, null, SUCCESS_MESSAGES.TEMPLATE_DELETED);
  });

  /**
   * Duplicate template
   * POST /templates/:id/duplicate
   */
  duplicateTemplate = asyncHandler(async (req, res) => {
    const templateId = parseInt(req.params.id);
    const { name } = req.body;

    const template = await this.templateService.duplicateTemplate(templateId, req.user.id, name);

    ResponseUtils.created(res, { template }, 'Template duplicated successfully');
  });

  /**
   * Get template statistics
   * GET /templates/stats
   */
  getTemplateStats = asyncHandler(async (req, res) => {
    const stats = await this.templateService.getTemplateStats(req.user.id);

    ResponseUtils.success(res, { stats }, 'Template statistics retrieved');
  });
}

module.exports = TemplateController;

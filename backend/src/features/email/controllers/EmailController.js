/**
 * Email Controller
 * Handles HTTP requests for email endpoints
 */

const EmailService = require('../services/EmailService');
const ResponseUtils = require('../../../common/utils/responseUtils');
const asyncHandler = require('../../../common/utils/asyncHandler');
const { SUCCESS_MESSAGES } = require('../../../common/constants');

class EmailController {
  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Send email
   * POST /email/send
   */
  sendEmail = asyncHandler(async (req, res) => {
    const result = await this.emailService.sendEmail(req.body, req.user.id);
    
    ResponseUtils.success(res, result, SUCCESS_MESSAGES.EMAIL_SENT);
  });

  /**
   * Save email as draft
   * POST /email/draft
   */
  saveDraft = asyncHandler(async (req, res) => {
    const result = await this.emailService.saveDraft(req.body, req.user.id);
    
    ResponseUtils.success(res, result, SUCCESS_MESSAGES.DRAFT_SAVED);
  });

  /**
   * Send mass emails
   * POST /email/mass-email
   */
  sendMassEmail = asyncHandler(async (req, res) => {
    let attachmentIds = [];
    try {
      if (req.body.attachmentIds) {
        attachmentIds = JSON.parse(req.body.attachmentIds);
      }
    } catch (error) {
      throw new Error('Invalid attachmentIds format. Expected JSON array.');
    }

    const massEmailData = {
      templateId: req.body.templateId,
      attachmentIds,
      excelFile: req.file
    };

    const result = await this.emailService.sendMassEmail(massEmailData, req.user.id);
    
    ResponseUtils.success(res, result, 'Mass emails sent successfully');
  });

  /**
   * Save mass emails as drafts
   * POST /email/mass-email/drafts
   */
  saveMassEmailAsDrafts = asyncHandler(async (req, res) => {
    let attachmentIds = [];
    try {
      if (req.body.attachmentIds) {
        attachmentIds = JSON.parse(req.body.attachmentIds);
      }
    } catch (error) {
      throw new Error('Invalid attachmentIds format. Expected JSON array.');
    }

    const massEmailData = {
      templateId: req.body.templateId,
      attachmentIds,
      excelFile: req.file
    };

    const result = await this.emailService.saveMassEmailAsDrafts(massEmailData, req.user.id);
    
    ResponseUtils.success(res, result, 'Mass emails saved as drafts successfully');
  });

  /**
   * Download Excel template for mass email
   * GET /email/mass-email/template/:templateId
   */
  downloadExcelTemplate = asyncHandler(async (req, res) => {
    const templateId = parseInt(req.params.templateId);
    
    const excelBuffer = await this.emailService.generateExcelTemplate(templateId, req.user.id);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="mass-email-template-${templateId}.xlsx"`);
    
    // Send buffer directly instead of using sendFile
    res.send(excelBuffer);
  });

  /**
   * Get email history (placeholder)
   * GET /email/history
   */
  getEmailHistory = asyncHandler(async (req, res) => {
    // This would typically get email history from database
    // For now, return empty array
    ResponseUtils.success(res, { history: [] }, 'Email history retrieved');
  });
}

module.exports = EmailController;

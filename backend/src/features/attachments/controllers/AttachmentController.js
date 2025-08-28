/**
 * Attachment Controller
 * Handles HTTP requests for attachment endpoints
 */

const path = require('path');
const AttachmentService = require('../services/AttachmentService');
const ResponseUtils = require('../../../common/utils/responseUtils');
const asyncHandler = require('../../../common/utils/asyncHandler');
const { SUCCESS_MESSAGES } = require('../../../common/constants');

class AttachmentController {
  constructor() {
    this.attachmentService = new AttachmentService();
  }

  /**
   * Get all attachments for current user
   * GET /attachments
   */
  getAttachments = asyncHandler(async (req, res) => {
    const attachments = await this.attachmentService.getUserAttachments(req.user.id);

    ResponseUtils.success(res, { attachments }, 'Attachments retrieved successfully');
  });

  /**
   * Get attachment by ID
   * GET /attachments/:id
   */
  getAttachment = asyncHandler(async (req, res) => {
    const attachmentId = parseInt(req.params.id);
    const attachment = await this.attachmentService.getAttachmentById(attachmentId, req.user.id);

    ResponseUtils.success(res, { attachment }, 'Attachment retrieved successfully');
  });

  /**
   * Upload new file
   * POST /attachments
   */
  uploadFile = asyncHandler(async (req, res) => {
    const attachment = await this.attachmentService.uploadFile(req.file, req.user.id);

    ResponseUtils.created(res, { attachment }, SUCCESS_MESSAGES.FILE_UPLOADED);
  });

  /**
   * Update attachment metadata
   * PUT /attachments/:id
   */
  updateAttachment = asyncHandler(async (req, res) => {
    const attachmentId = parseInt(req.params.id);
    const attachment = await this.attachmentService.updateAttachment(
      attachmentId, 
      req.body, 
      req.user.id
    );

    ResponseUtils.success(res, { attachment }, 'Attachment updated successfully');
  });

  /**
   * Delete attachment
   * DELETE /attachments/:id
   */
  deleteAttachment = asyncHandler(async (req, res) => {
    const attachmentId = parseInt(req.params.id);
    
    await this.attachmentService.deleteAttachment(attachmentId, req.user.id);

    ResponseUtils.success(res, null, SUCCESS_MESSAGES.FILE_DELETED);
  });

  /**
   * Download attachment file
   * GET /attachments/:id/download
   */
  downloadAttachment = asyncHandler(async (req, res) => {
    const attachmentId = parseInt(req.params.id);
    
    const { attachment, filePath } = await this.attachmentService.getAttachmentForDownload(
      attachmentId, 
      req.user.id
    );
  
    try {
      const { createStorageService } = require('../../../shared/storage/StorageService');
      const storageService = createStorageService();
      
      // For both S3 and local storage, stream the file through our API
      // This avoids CORS issues with S3
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      res.setHeader('Content-Type', attachment.mimetype);
      
      // Get file content and stream it
      const fileContent = await storageService.getFile(filePath);
      res.send(fileContent);
      
    } catch (error) {
      console.error('Failed to download file:', error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  });

  /**
   * Get attachment statistics
   * GET /attachments/stats
   */
  getAttachmentStats = asyncHandler(async (req, res) => {
    const stats = await this.attachmentService.getAttachmentStats(req.user.id);

    ResponseUtils.success(res, { stats }, 'Attachment statistics retrieved');
  });

  /**
   * Get presigned URL for attachment download
   * GET /attachments/:id/presigned-url
   */
  getPresignedUrl = asyncHandler(async (req, res) => {
    const attachmentId = parseInt(req.params.id);
    
    const { attachment, filePath } = await this.attachmentService.getAttachmentForDownload(
      attachmentId, 
      req.user.id
    );
  
    try {
      // Instead of S3 presigned URL, provide our API download URL
      // This avoids CORS issues
      const downloadUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/attachments/${attachmentId}/download`;
      
      ResponseUtils.success(res, { 
        downloadUrl,
        filename: attachment.originalName,
        expiresIn: 3600 // 1 hour
      }, 'Download URL generated successfully');
    } catch (error) {
      console.error('Failed to generate download URL:', error);
      res.status(500).json({ error: 'Failed to generate download URL' });
    }
  });
}

module.exports = AttachmentController;

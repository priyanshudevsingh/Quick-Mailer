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
    console.log('🔍 [AttachmentController] downloadAttachment called');
    console.log('📋 Request params:', req.params);
    console.log('👤 User ID:', req.user.id);
    
    const attachmentId = parseInt(req.params.id);
    console.log('🆔 Parsed attachment ID:', attachmentId);
    
    try {
      console.log('🔍 [AttachmentController] Getting attachment for download...');
      const { attachment, filePath } = await this.attachmentService.getAttachmentForDownload(
        attachmentId, 
        req.user.id
      );
      
      console.log('📎 [AttachmentController] Attachment found:', {
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        mimetype: attachment.mimetype,
        filePath: filePath
      });
  
      console.log('🔍 [AttachmentController] Creating storage service...');
      const { createStorageService } = require('../../../shared/storage/StorageService');
      const storageService = createStorageService();
      console.log('✅ [AttachmentController] Storage service created');
      
      // For both S3 and local storage, stream the file through our API
      // This avoids CORS issues with S3
      console.log('📤 [AttachmentController] Setting response headers...');
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      res.setHeader('Content-Type', attachment.mimetype);
      console.log('✅ [AttachmentController] Headers set');
      
      // Get file content and stream it
      console.log('🔍 [AttachmentController] Getting file content from storage...');
      const fileContent = await storageService.getFile(filePath);
      console.log('✅ [AttachmentController] File content retrieved, size:', fileContent?.length || 'unknown');
      
      console.log('📤 [AttachmentController] Sending file content...');
      res.send(fileContent);
      console.log('✅ [AttachmentController] File sent successfully');
      
    } catch (error) {
      console.error('❌ [AttachmentController] Error in downloadAttachment:', error);
      console.error('❌ [AttachmentController] Error stack:', error.stack);
      console.error('❌ [AttachmentController] Error message:', error.message);
      
      // Send a more detailed error response
      res.status(500).json({ 
        error: 'Failed to download file',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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

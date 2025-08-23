/**
 * Attachment Service
 * Business logic for file attachment management
 */

const fs = require('fs').promises;
const path = require('path');
const Attachment = require('../models/Attachment');
const StorageService = require('../../../shared/storage/StorageService');
const { NotFoundError, ValidationError } = require('../../../common/errors/AppError');

class AttachmentService {
  constructor() {
    this.storageService = new StorageService();
  }

  /**
   * Get all attachments for a user
   * @param {number} userId - User ID
   * @returns {Array} Array of attachments
   */
  async getUserAttachments(userId) {
    return await Attachment.findAll({
      where: { userId, isActive: true },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'originalName', 'filename', 'mimetype', 'size', 'description', 'createdAt']
    });
  }

  /**
   * Get attachment by ID
   * @param {number} attachmentId - Attachment ID
   * @param {number} userId - User ID (for authorization)
   * @returns {object} Attachment instance
   */
  async getAttachmentById(attachmentId, userId) {
    const attachment = await Attachment.findOne({
      where: {
        id: attachmentId,
        userId,
        isActive: true
      }
    });

    if (!attachment) {
      throw new NotFoundError('Attachment');
    }

    return attachment;
  }

  /**
   * Upload new file
   * @param {object} file - File object from multer
   * @param {number} userId - User ID
   * @returns {object} Created attachment
   */
  async uploadFile(file, userId) {
    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Use storage service for validation and storage
    const fileInfo = await this.storageService.storeFile(file);

    return await Attachment.create({
      userId,
      originalName: fileInfo.originalName,
      filename: fileInfo.filename,
      mimetype: fileInfo.mimetype,
      size: fileInfo.size,
      path: fileInfo.fullPath,
    });
  }

  /**
   * Delete attachment
   * @param {number} attachmentId - Attachment ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if deleted
   */
  async deleteAttachment(attachmentId, userId) {
    const attachment = await this.getAttachmentById(attachmentId, userId);

    // Delete file from filesystem
    try {
      await this.storageService.deleteFile(attachment.filename);
    } catch (error) {
      console.warn(`Warning: Could not delete file ${attachment.filename}:`, error.message);
      // Continue with database deletion even if file deletion fails
    }

    // Soft delete from database
    await attachment.update({ isActive: false });
    
    return true;
  }

  /**
   * Update attachment metadata
   * @param {number} attachmentId - Attachment ID
   * @param {object} updateData - Data to update
   * @param {number} userId - User ID (for authorization)
   * @returns {object} Updated attachment
   */
  async updateAttachment(attachmentId, updateData, userId) {
    const attachment = await this.getAttachmentById(attachmentId, userId);
    
    return await attachment.update(updateData);
  }

  /**
   * Get attachment file path for download
   * @param {number} attachmentId - Attachment ID
   * @param {number} userId - User ID (for authorization)
   * @returns {object} File information for download
   */
  async getAttachmentForDownload(attachmentId, userId) {
    const attachment = await this.getAttachmentById(attachmentId, userId);

    // Check if file exists using the full path stored in database
    try {
      await this.storageService.getFile(attachment.path);
    } catch (error) {
      throw new NotFoundError('File not found on server');
    }

    return {
      attachment,
      filePath: attachment.path
    };
  }

  /**
   * Get attachment statistics for a user
   * @param {number} userId - User ID
   * @returns {object} Attachment statistics
   */
  async getAttachmentStats(userId) {
    const attachments = await this.getUserAttachments(userId);
    const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);

    return {
      total: attachments.length,
      totalSize,
      totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
      byType: this.groupAttachmentsByType(attachments)
    };
  }

  /**
   * Group attachments by mime type
   * @private
   */
  groupAttachmentsByType(attachments) {
    const groups = {};
    
    attachments.forEach(attachment => {
      const type = attachment.mimetype.split('/')[0];
      if (!groups[type]) {
        groups[type] = { count: 0, size: 0 };
      }
      groups[type].count++;
      groups[type].size += attachment.size;
    });

    return groups;
  }
}

module.exports = AttachmentService;

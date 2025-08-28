/**
 * Storage Service - File storage management
 * Factory function that returns the appropriate storage service
 */

const fs = require('fs').promises;
const path = require('path');
const { ValidationError } = require('../../common/errors/AppError');

function createStorageService() {
  // Use S3 in production/Lambda, local storage in development
  if (process.env.NODE_ENV === 'production' || process.env.S3_BUCKET) {
    const S3StorageService = require('./S3StorageService');
    return new S3StorageService();
  }
  
  // Local storage for development
  return new LocalStorageService();
}

class LocalStorageService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirExists();
  }

  async ensureUploadDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async storeFile(file) {
    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ValidationError('File too large. Maximum size is 10MB');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = path.extname(file.originalname);
    const filename = `file-${timestamp}-${randomId}${extension}`;
    const fullPath = path.join(this.uploadDir, filename);

    try {
      // Write file to disk
      await fs.writeFile(fullPath, file.buffer);
      
      console.log(`✅ File stored successfully: ${filename}`);
      
      return {
        filename,
        originalName: file.originalname,
        fullPath,
        relativePath: `uploads/${filename}`,
        mimetype: file.mimetype,
        size: file.size
      };
    } catch (error) {
      console.error('❌ Failed to store file:', error);
      throw new Error(`Failed to store file: ${error.message}`);
    }
  }

  async deleteFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
      await fs.unlink(fullPath);
      console.log(`✅ File deleted successfully: ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      return false;
    }
  }

  async getFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
      const fileBuffer = await fs.readFile(fullPath);
      return fileBuffer;
    } catch (error) {
      console.error('❌ Failed to read file:', error);
      throw new Error(`File not found: ${filePath}`);
    }
  }

  async fileExists(filename) {
    try {
      const fullPath = path.join(this.uploadDir, filename);
      await fs.access(fullPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  getFileStream(filename) {
    // For now, just return the file path since we're using res.sendFile()
    return path.join(this.uploadDir, filename);
  }
}

module.exports = {
  createStorageService,
  LocalStorageService // Expose the class for potential direct use if needed
};

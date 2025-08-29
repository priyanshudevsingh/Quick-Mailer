/**
 * S3 Storage Service - Cloud file storage for Lambda
 * Replaces local file storage for serverless deployment
 */

const AWS = require('aws-sdk');
const { ValidationError } = require('../../common/errors/AppError');

class S3StorageService {
  constructor() {
    this.s3 = new AWS.S3({
      // Lambda automatically provides AWS_REGION, no need to set it manually
      // Lambda will use IAM role credentials automatically
    });
    this.bucketName = process.env.S3_BUCKET;
    
    if (!this.bucketName) {
      throw new Error('S3_BUCKET environment variable is required');
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
    const extension = require('path').extname(file.originalname);
    const filename = `file-${timestamp}-${randomId}${extension}`;
    const key = `uploads/${filename}`;

    try {
      // Upload to S3
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          size: file.size.toString(),
          uploadedAt: new Date().toISOString()
        }
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      console.log(`✅ File stored successfully in S3: ${filename}`);
      
      return {
        filename,
        originalName: file.originalname,
        fullPath: result.Location,
        relativePath: key,
        mimetype: file.mimetype,
        size: file.size,
        s3Key: key,
        s3Location: result.Location
      };
    } catch (error) {
      console.error('❌ Failed to store file in S3:', error);
      throw new Error(`Failed to store file: ${error.message}`);
    }
  }

  async deleteFile(filePath) {
    try {
      // Extract S3 key from filePath
      const key = filePath.includes('uploads/') ? filePath : `uploads/${filePath}`;
      
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
      
      console.log(`✅ File deleted successfully from S3: ${key}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete file from S3:', error);
      return false;
    }
  }

  async getFile(filePath) {
    console.log('🔍 [S3StorageService] getFile called');
    console.log('📋 filePath:', filePath);
    console.log('🏪 bucketName:', this.bucketName);
    
    try {
      // Extract S3 key from filePath
      const key = filePath.includes('uploads/') ? filePath : `uploads/${filePath}`;
      console.log('🔑 Extracted S3 key:', key);
      
      console.log('🔍 [S3StorageService] Calling S3 getObject...');
      const result = await this.s3.getObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
      
      console.log('✅ [S3StorageService] S3 getObject successful');
      console.log('📊 File size from S3:', result.Body?.length || 'unknown');
      console.log('📋 Content-Type from S3:', result.ContentType);
      
      return result.Body;
    } catch (error) {
      console.error('❌ [S3StorageService] Failed to read file from S3:', error);
      console.error('❌ [S3StorageService] Error code:', error.code);
      console.error('❌ [S3StorageService] Error message:', error.message);
      console.error('❌ [S3StorageService] Error stack:', error.stack);
      throw new Error(`File not found: ${filePath}`);
    }
  }

  async fileExists(filename) {
    try {
      const key = `uploads/${filename}`;
      await this.s3.headObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  async generatePresignedUrl(filename, operation = 'getObject', expiresIn = 3600) {
    try {
      // Handle different filename formats
      let key = filename;
      if (!filename.includes('uploads/')) {
        key = `uploads/${filename}`;
      }
      
      // Validate bucket exists
      if (!this.bucketName) {
        throw new Error('S3_BUCKET environment variable is not set');
      }
      
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn
      };

      console.log(`🔗 Generating presigned URL for: ${key} in bucket: ${this.bucketName}`);
      const url = await this.s3.getSignedUrlPromise(operation, params);
      
      console.log(`✅ Presigned URL generated successfully for: ${filename}`);
      return url;
    } catch (error) {
      console.error('❌ Failed to generate presigned URL:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  async generateUploadUrl(filename, contentType, expiresIn = 3600) {
    try {
      const key = `uploads/${filename}`;
      const params = {
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise('putObject', params);
      return url;
    } catch (error) {
      console.error('❌ Failed to generate upload URL:', error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }
}

module.exports = S3StorageService;

/**
 * Application Constants
 * Centralized constants for consistency across the application
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  
  // Auth specific
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Authorization token required',
  GMAIL_TOKEN_MISSING: 'Gmail access token not available. Please re-authenticate.',
  
  // Email specific
  EMAIL_SEND_FAILED: 'Failed to send email',
  DRAFT_SAVE_FAILED: 'Failed to save draft',
  INVALID_EMAIL: 'Invalid email address',
  TEMPLATE_NOT_FOUND: 'Template not found',
  ATTACHMENT_NOT_FOUND: 'Attachment not found',
  
  // File upload
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
};

// Success Messages
const SUCCESS_MESSAGES = {
  EMAIL_SENT: 'Email sent successfully',
  DRAFT_SAVED: 'Email saved as draft successfully',
  TEMPLATE_CREATED: 'Template created successfully',
  TEMPLATE_UPDATED: 'Template updated successfully',
  TEMPLATE_DELETED: 'Template deleted successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DELETED: 'File deleted successfully',
};

// Validation Rules
const VALIDATION = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
  },
  TEMPLATE: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    SUBJECT_MAX_LENGTH: 200,
    BODY_MAX_LENGTH: 50000,
  },
  FILE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
      DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
      IMAGES: ['jpg', 'jpeg', 'png', 'gif'],
      SPREADSHEETS: ['xls', 'xlsx', 'csv'],
    },
  },
};

// Email Types
const EMAIL_TYPES = {
  IMMEDIATE: 'immediate',
  SCHEDULED: 'scheduled',
  DRAFT: 'draft',
};

// Database Tables
const DB_TABLES = {
  USERS: 'users',
  TEMPLATES: 'templates',
  ATTACHMENTS: 'attachments',

};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  EMAIL_TYPES,
  DB_TABLES,
};

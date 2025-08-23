/**
 * Response Utilities
 * Standardized response helpers for consistent API responses
 */

const { HTTP_STATUS } = require('../constants');

class ResponseUtils {
  static success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
    const response = {
      success: true,
      message,
      ...(data && { data })
    };
    
    return res.status(statusCode).json(response);
  }

  static created(res, data = null, message = 'Created successfully') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static error(res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    const response = {
      success: false,
      message,
      ...(details && { details })
    };
    
    return res.status(statusCode).json(response);
  }

  static validationError(res, details, message = 'Validation failed') {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, details);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(res, resource = 'Resource', message = null) {
    const defaultMessage = `${resource} not found`;
    return this.error(res, message || defaultMessage, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(res, message = 'Resource already exists') {
    return this.error(res, message, HTTP_STATUS.CONFLICT);
  }
}

module.exports = ResponseUtils;

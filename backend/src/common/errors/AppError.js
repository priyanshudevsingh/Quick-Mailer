/**
 * Custom Application Error Class
 * Provides consistent error handling across the application
 */

const { HTTP_STATUS } = require('../constants');

class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
};

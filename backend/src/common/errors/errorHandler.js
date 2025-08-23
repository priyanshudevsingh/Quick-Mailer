/**
 * Global Error Handler Middleware
 * Handles all errors in a consistent way across the application
 */

const { AppError } = require('./AppError');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'duplicate value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', HTTP_STATUS.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', HTTP_STATUS.UNAUTHORIZED);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details && { details: err.details })
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

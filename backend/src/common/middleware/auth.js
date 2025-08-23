/**
 * Authentication Middleware
 * Handles JWT token verification for protected routes
 */

const jwt = require('jsonwebtoken');
const ResponseUtils = require('../utils/responseUtils');
const { ERROR_MESSAGES } = require('../constants');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return ResponseUtils.unauthorized(res, ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Import User model dynamically to avoid circular dependency
    const User = require('../../features/auth/models/User');
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return ResponseUtils.unauthorized(res, 'User not found');
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
    }
    if (error.name === 'TokenExpiredError') {
      return ResponseUtils.unauthorized(res, 'Token has expired');
    }
    
    console.error('Auth middleware error:', error);
    return ResponseUtils.error(res, ERROR_MESSAGES.INTERNAL_ERROR, 500);
  }
};

/**
 * Middleware to check Gmail access token
 */
const requireGmailAccess = async (req, res, next) => {
  try {
    if (!req.user.accessToken) {
      return ResponseUtils.unauthorized(res, ERROR_MESSAGES.GMAIL_TOKEN_MISSING);
    }
    
    next();
  } catch (error) {
    console.error('Gmail access middleware error:', error);
    return ResponseUtils.error(res, ERROR_MESSAGES.INTERNAL_ERROR, 500);
  }
};

module.exports = {
  authenticateToken,
  requireGmailAccess,
};

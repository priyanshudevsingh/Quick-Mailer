/**
 * Authentication Routes
 * Route definitions for authentication endpoints
 */

const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../../../common/middleware/auth');

const router = express.Router();
const authController = new AuthController();

// Server-side OAuth flow
router.get('/google/url', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.googleCallback);

// Legacy client-side OAuth (for backward compatibility)
router.post('/google', authController.googleLogin);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/refresh', authenticateToken, authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;

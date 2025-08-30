/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

const AuthService = require('../services/AuthService');
const ResponseUtils = require('../../../common/utils/responseUtils');
const asyncHandler = require('../../../common/utils/asyncHandler');
const { SUCCESS_MESSAGES } = require('../../../common/constants');
const config = require('../../../config');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Get Google OAuth URL
   * GET /auth/google/url
   */
  getGoogleAuthUrl = asyncHandler(async (req, res) => {
    const authUrl = this.authService.generateGoogleAuthUrl();
    ResponseUtils.success(res, { authUrl }, 'Google auth URL generated');
  });

  /**
   * Handle Google OAuth callback
   * GET /auth/google/callback
   */
  googleCallback = asyncHandler(async (req, res) => {
    try {
      console.log('🔍 Google Callback - Code received:', req.query.code ? 'YES' : 'NO');
      console.log('🔍 Google Callback - Query params:', req.query);
      
      const { code } = req.query;
      
      if (!code) {
        console.error('❌ Google Callback - No authorization code received');
        return res.status(400).json({ error: 'No authorization code received' });
      }
      
      console.log('🔄 Google Callback - Processing with code:', code.substring(0, 20) + '...');
      
      const { user, token } = await this.authService.handleGoogleCallback(code);
      
      console.log('✅ Google Callback - Success, user ID:', user?.id);
      
      const frontendUrl = config.server.frontendUrl;
      const redirectUrl = `${frontendUrl}/auth-callback?token=${token}&success=true`;
      
      console.log('🔄 Google Callback - Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Google Callback - Error:', error);
      console.error('❌ Google Callback - Stack:', error.stack);
      
      // Return error instead of throwing
      res.status(500).json({ 
        error: 'Authentication failed', 
        details: error.message 
      });
    }
  });

  /**
   * Handle Google OAuth login (ID token verification)
   * POST /auth/google
   */
  googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
      return ResponseUtils.validationError(res, ['ID token is required']);
    }

    const { user, token } = await this.authService.verifyGoogleToken(idToken);
    
    // Get user profile
    const profile = await this.authService.getUserProfile(user.id);

    ResponseUtils.success(res, {
      token,
      user: profile,
    }, 'Login successful');
  });

  /**
   * Get current user profile
   * GET /auth/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const profile = await this.authService.getUserProfile(req.user.id);
    ResponseUtils.success(res, { user: profile }, 'Profile retrieved');
  });

  /**
   * Refresh JWT token
   * POST /auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    // Get current user
    const user = await this.authService.getUserById(req.user.id);
    
    // Generate new token
    const token = this.authService.generateToken(user.id);
    
    // Get updated profile
    const profile = await this.authService.getUserProfile(user.id);

    ResponseUtils.success(res, { 
      token,
      user: profile 
    }, 'Token refreshed');
  });

  /**
   * Logout user (client-side token removal)
   * POST /auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    // Logout is handled client-side by removing the token
    // Server-side logout would require token blacklisting
    
    ResponseUtils.success(res, null, 'Logout successful');
  });

  /**
   * Get dashboard statistics
   * GET /auth/dashboard-stats
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await this.authService.getDashboardStats(req.user.id);
    ResponseUtils.success(res, { stats }, 'Dashboard statistics retrieved');
  });
}

module.exports = AuthController;

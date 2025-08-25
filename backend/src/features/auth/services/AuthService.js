/**
 * Authentication Service
 * Business logic for user authentication and authorization
 */

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const User = require('../models/User');
const config = require('../../../config');
const { AppError, AuthenticationError } = require('../../../common/errors/AppError');
const { ERROR_MESSAGES } = require('../../../common/constants');

class AuthService {
  constructor() {
    this.client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
  }

  /**
   * Generate Google OAuth URL
   * @returns {string} Google OAuth URL
   */
  generateGoogleAuthUrl() {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      prompt: 'consent'
    });
  }

  /**
   * Handle Google OAuth callback
   * @param {string} code - Authorization code from Google
   * @returns {object} User and token information
   */
  async handleGoogleCallback(code) {
    if (!code) {
      throw new AppError('Authorization code is required', 400);
    }

    try {
      console.log('🔄 AuthService - Starting Google OAuth callback processing');
      
      // Exchange code for tokens
      console.log('🔄 AuthService - Exchanging code for tokens...');
      const { tokens } = await this.client.getToken(code);
      console.log('✅ AuthService - Tokens received:', !!tokens.access_token);
      
      this.client.setCredentials(tokens);

      // Get user info
      console.log('🔄 AuthService - Getting user info from Google...');
      const oauth2 = google.oauth2({ version: 'v2', auth: this.client });
      const { data: userInfo } = await oauth2.userinfo.get();
      console.log('✅ AuthService - User info received:', userInfo.email);

      // Find or create user
      console.log('🔄 AuthService - Finding or creating user...');
      const user = await this.findOrCreateUser({
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      });
      console.log('✅ AuthService - User processed:', user.id);

      // Generate JWT token
      console.log('🔄 AuthService - Generating JWT token...');
      const token = this.generateToken(user.id);
      console.log('✅ AuthService - JWT token generated');

      return { user, token };
    } catch (error) {
      console.error('❌ AuthService - Google authentication failed:', error);
      console.error('❌ AuthService - Error stack:', error.stack);
      throw new AuthenticationError(`Google authentication failed: ${error.message}`);
    }
  }

  /**
   * Verify Google ID token and authenticate user
   * @param {string} idToken - Google ID token
   * @returns {object} User and token information
   */
  async verifyGoogleToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });
      
      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // Find or create user
      const user = await this.findOrCreateUser({
        googleId,
        email,
        name,
        picture
      });

      // Generate JWT token
      const token = this.generateToken(user.id);

      return { user, token };
    } catch (error) {
      throw new AuthenticationError('Invalid Google token');
    }
  }

  /**
   * Find or create user from Google OAuth data
   * @param {object} userData - User data from Google
   * @returns {object} User instance
   */
  async findOrCreateUser(userData) {
    const { googleId, email, name, picture, accessToken, refreshToken, tokenExpiry } = userData;

    let user = await User.findOne({ where: { googleId } });

    if (!user) {
      // Check if user exists with the same email
      const existingUser = await User.findOne({ where: { email } });
      
      if (existingUser) {
        // Update existing user with Google ID
        user = await existingUser.update({
          googleId,
          name,
          picture,
          ...(accessToken && { accessToken }),
          ...(refreshToken && { refreshToken }),
          ...(tokenExpiry && { tokenExpiry })
        });
      } else {
        // Create new user
        user = await User.create({
          googleId,
          email,
          name,
          picture,
          ...(accessToken && { accessToken }),
          ...(refreshToken && { refreshToken }),
          ...(tokenExpiry && { tokenExpiry })
        });
      }
    } else {
      // Update existing user info
      user = await user.update({
        email,
        name,
        picture,
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
        ...(tokenExpiry && { tokenExpiry })
      });
    }

    return user;
  }

  /**
   * Generate JWT token for user
   * @param {number} userId - User ID
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { userId },
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn,
        issuer: 'email-app',
        audience: 'email-app-users',
      }
    );
  }

  /**
   * Verify JWT token and return user data
   * @param {string} token - JWT token
   * @returns {object} User data from token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError(ERROR_MESSAGES.INVALID_TOKEN);
      }
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token has expired');
      }
      throw new AuthenticationError('Token verification failed');
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {object} User instance
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  }

  /**
   * Refresh Google access token using refresh token
   * @param {object} user - User object with refresh token
   * @returns {string} New access token
   */
  async refreshGoogleToken(user) {
    if (!user.refreshToken) {
      throw new AuthenticationError('No refresh token available. Please re-authenticate.');
    }

    try {
      // Set the refresh token
      this.client.setCredentials({
        refresh_token: user.refreshToken
      });

      // Get new access token
      const { credentials } = await this.client.refreshAccessToken();
      
      // Update user with new tokens
      await User.update({
        accessToken: credentials.access_token,
        tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null
      }, {
        where: { id: user.id }
      });

      return credentials.access_token;
    } catch (error) {
      throw new AuthenticationError('Failed to refresh token. Please re-authenticate.');
    }
  }

  /**
   * Get user profile with sanitized data
   * @param {number} userId - User ID
   * @returns {object} User profile (without sensitive data)
   */
  async getUserProfile(userId) {
    const user = await this.getUserById(userId);
    
    // Return user data without sensitive information
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      emailsSent: user.emailsSent,
      draftsCreated: user.draftsCreated,
      hasGmailAccess: !!user.accessToken,
      createdAt: user.createdAt,
    };
  }

  /**
   * Increment user's email statistics
   * @param {number} userId - User ID
   * @param {number} emailsSent - Number of emails sent to add
   * @param {number} draftsCreated - Number of drafts created to add
   * @returns {object} Updated user
   */
  async incrementUserStats(userId, emailsSent = 0, draftsCreated = 0) {
    return await User.increment(
      { 
        emailsSent,
        draftsCreated 
      },
      { where: { id: userId } }
    );
  }
}

module.exports = AuthService;

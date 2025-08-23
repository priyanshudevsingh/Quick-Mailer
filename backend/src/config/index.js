/**
 * Application Configuration
 * Centralized configuration management with environment variables
 */

require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  },
  
  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'xls', 'xlsx', 'csv'],
  },
  
  // Security Configuration
  security: {
    corsOrigin: process.env.FRONTEND_URL || 'http://localhost:3000',
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // Limit each IP to 100 requests per windowMs
  },
  
  // Email Configuration
  email: {
    defaultDelay: 100, // Delay between mass emails in ms
    maxRetries: 3,
    timeout: 30000, // 30 seconds
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Warn about optional but recommended variables
const recommendedEnvVars = [
  'DATABASE_URL',
];

const missingRecommended = recommendedEnvVars.filter(varName => !process.env[varName]);

if (missingRecommended.length > 0 && config.server.nodeEnv !== 'test') {
  console.warn(`⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}`);
}

module.exports = config;

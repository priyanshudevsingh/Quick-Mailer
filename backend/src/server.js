/**
 * Main Server File
 * Application entry point with clean architecture
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const { testConnection, syncDatabase } = require('./shared/database');
const errorHandler = require('./common/errors/errorHandler');

// Import feature routes
const authRoutes = require('./features/auth/routes');
const templateRoutes = require('./features/templates/routes');
const attachmentRoutes = require('./features/attachments/routes');
const emailRoutes = require('./features/email/routes');
const statisticsRoutes = require('./features/statistics/routes');

const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
if (config.server.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads) - Only in development mode
if (config.server.nodeEnv === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/stats', statisticsRoutes);

// Database sync endpoint (for development/setup only)
app.get('/api/db/sync', async (req, res) => {
  try {
    const { forceSyncDatabase } = require('./shared/database');
    const result = await forceSyncDatabase();
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: result.message,
        warning: 'This endpoint should only be used for initial setup!'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Database sync endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database sync failed' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Email Template Manager API is running',
    version: '2.0.0',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path,
  });
});

// Global error handling middleware
app.use(errorHandler);

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    // Sync database models
    const dbSynced = await syncDatabase();
    if (!dbSynced) {
      throw new Error('Database synchronization failed');
    }
    
    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      console.log(`
🚀 Server is running!
📊 Environment: ${config.server.nodeEnv}
🌐 Port: ${config.server.port}
🔗 API: http://localhost:${config.server.port}/api
💚 Health: http://localhost:${config.server.port}/api/health
      `);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n📝 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔒 HTTP server closed.');
        
        try {
          const { closeConnection } = require('./shared/database');
          await closeConnection();
          console.log('✅ Graceful shutdown completed.');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

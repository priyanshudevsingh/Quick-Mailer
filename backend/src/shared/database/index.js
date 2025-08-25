/**
 * Database Connection and Configuration
 * Centralized database setup with Sequelize
 */

const { Sequelize } = require('sequelize');
const config = require('../../config');

// Create Sequelize instance
const sequelize = new Sequelize(config.database.url, {
  dialect: config.database.dialect,
  logging: config.database.logging,
  pool: config.database.pool,
  dialectOptions: config.database.dialectOptions,
});

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

/**
 * Sync database models
 * @param {object} options - Sequelize sync options
 */
const syncDatabase = async (options = { alter: true }) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Database models synchronized.');
    return true;
  } catch (error) {
    console.error('❌ Failed to sync database models:', error);
    return false;
  }
};

/**
 * Force sync database - creates all tables (WARNING: DESTROYS EXISTING DATA)
 * Use this only for initial setup or when you want to reset everything
 */
const forceSyncDatabase = async () => {
  try {
    console.log('🔄 Force syncing database...');
    
    // Import all models to ensure they're registered with Sequelize
    require('../../features/auth/models/User');
    require('../../features/templates/models/Template');
    require('../../features/email/models/Email');
    require('../../features/attachments/models/Attachment');
    
    // Force sync with alter: true to create tables
    await sequelize.sync({ force: true, alter: true });
    
    console.log('✅ Database tables created successfully!');
    return { success: true, message: 'Database tables created successfully!' };
  } catch (error) {
    console.error('❌ Force sync failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Close database connection
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  forceSyncDatabase,
  closeConnection
};

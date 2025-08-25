const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database');

const Statistics = sequelize.define('Statistics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
    // Foreign key reference will be added after tables exist
  },
  emailsSent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  emailsReceived: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  templatesCreated: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  attachmentsUploaded: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'statistics',
  timestamps: true,
  underscored: true
});

module.exports = Statistics;

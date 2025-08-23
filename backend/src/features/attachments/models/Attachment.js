/**
 * Attachment Model
 * Database model for file attachments
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database');
const { DB_TABLES } = require('../../../common/constants');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DB_TABLES.USERS,
      key: 'id'
    }
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'attachments',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['userId', 'isActive']
    }
  ]
});

module.exports = Attachment;

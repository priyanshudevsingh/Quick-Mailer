/**
 * Template Model
 * Database model for email templates
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database');
const { DB_TABLES } = require('../../../common/constants');

const Template = sequelize.define('Template', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  placeholders: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: DB_TABLES.TEMPLATES,
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['userId', 'isActive']
    },
    {
      fields: ['name']
    }
  ]
});

module.exports = Template;

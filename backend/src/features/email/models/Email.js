const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database');

const Email = sequelize.define('Email', {
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
  to: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isHtml: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'failed'),
    defaultValue: 'draft'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gmailMessageId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'emails',
  timestamps: true,
  underscored: true
});

module.exports = Email;

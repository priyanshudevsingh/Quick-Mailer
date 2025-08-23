/**
 * User Model
 * Database model for user entities
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../shared/database');
const { DB_TABLES } = require('../../../common/constants');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailsSent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  draftsCreated: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: DB_TABLES.USERS,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['googleId']
    },
    {
      unique: true,
      fields: ['email']
    }
  ]
});

module.exports = User;

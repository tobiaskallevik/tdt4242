// PasswordResetToken model – stores temporary tokens for password reset
// Solves Req 3 (password reset functionality)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordResetToken = sequelize.define(
  'PasswordResetToken',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'password_reset_tokens',
    timestamps: false,
  }
);

module.exports = PasswordResetToken;

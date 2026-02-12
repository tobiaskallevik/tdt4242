// Consent model – records informed consent for data collection
// Solves Req 7 (informed consent for data collection)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Consent = sequelize.define(
  'Consent',
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
    consent_version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    consented_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'consents',
    timestamps: false,
  }
);

module.exports = Consent;

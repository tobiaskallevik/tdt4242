// Model index – sets up associations and re-exports all models
const sequelize = require('../config/database');
const User = require('./User');
const Consent = require('./Consent');
const UsageLog = require('./UsageLog');
const PasswordResetToken = require('./PasswordResetToken');

// Associations
User.hasMany(Consent, { foreignKey: 'user_id' });
Consent.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UsageLog, { foreignKey: 'user_id' });
UsageLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(PasswordResetToken, { foreignKey: 'user_id' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Consent, UsageLog, PasswordResetToken };

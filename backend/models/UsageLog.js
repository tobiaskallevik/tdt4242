// UsageLog model – tracks AI tool interactions per student
// Solves Req 4 (frequency over time), Req 5 (breakdown by category/context), Req 6 (filtering)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UsageLog = sequelize.define(
  'UsageLog',
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
    course_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    task_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ai_tool: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    context_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'usage_logs',
    timestamps: false,
  }
);

module.exports = UsageLog;

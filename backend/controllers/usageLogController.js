// UsageLog controller – CRUD and analytics for AI usage logs
// Solves Req 4 (frequency over time), Req 5 (breakdown by category/context),
// Req 6 (filtering), Req 8 (access restricted to owner + authorized personnel)
const { Op, fn, col, literal } = require('sequelize');
const { UsageLog } = require('../models');

// Create a new usage log entry
const createLog = async (req, res, next) => {
  try {
    const { course_code, task_type, ai_tool, context_text, tokens } = req.body;

    const log = await UsageLog.create({
      user_id: req.user.id,
      course_code,
      task_type,
      ai_tool,
      context_text: context_text || null,
      tokens: tokens || null,
    });

    return res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

// Get logs for the authenticated user with optional filters
// Solves Req 6 – filtering by course, task type, and time period
const getMyLogs = async (req, res, next) => {
  try {
    const where = { user_id: req.user.id };
    const { course_code, task_type, ai_tool, from, to } = req.query;

    if (course_code) where.course_code = course_code;
    if (task_type) where.task_type = task_type;
    if (ai_tool) where.ai_tool = ai_tool;
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = new Date(from);
      if (to) where.created_at[Op.lte] = new Date(to);
    }

    const logs = await UsageLog.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    return res.json(logs);
  } catch (err) {
    next(err);
  }
};

// Admin: get logs for any user
// Solves Req 8 – authorized personnel access
const getLogsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const logs = await UsageLog.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
    return res.json(logs);
  } catch (err) {
    next(err);
  }
};

// Solves Req 4 – Dashboard: frequency of prompts over time (grouped by day)
const getFrequencyOverTime = async (req, res, next) => {
  try {
    const where = { user_id: req.user.id };
    const { from, to } = req.query;
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = new Date(from);
      if (to) where.created_at[Op.lte] = new Date(to);
    }

    const data = await UsageLog.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where,
      group: [literal('DATE(created_at)')],
      order: [[literal('DATE(created_at)'), 'ASC']],
      raw: true,
    });

    return res.json(data);
  } catch (err) {
    next(err);
  }
};

// Solves Req 5 – Breakdown by AI tool category (LLM, image gen, code assistant)
const getBreakdownByTool = async (req, res, next) => {
  try {
    const data = await UsageLog.findAll({
      attributes: [
        'ai_tool',
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { user_id: req.user.id },
      group: ['ai_tool'],
      raw: true,
    });
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

// Solves Req 5 – Breakdown by context/task type (debugging, writing, research)
const getBreakdownByTaskType = async (req, res, next) => {
  try {
    const data = await UsageLog.findAll({
      attributes: [
        'task_type',
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { user_id: req.user.id },
      group: ['task_type'],
      raw: true,
    });
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createLog,
  getMyLogs,
  getLogsByUser,
  getFrequencyOverTime,
  getBreakdownByTool,
  getBreakdownByTaskType,
};

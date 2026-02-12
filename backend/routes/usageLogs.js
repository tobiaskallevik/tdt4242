// Usage log routes – CRUD and analytics endpoints
// Solves Req 4 (frequency), Req 5 (breakdown), Req 6 (filtering), Req 8 (access control)
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const usageLogController = require('../controllers/usageLogController');

// Create a new log entry – Solves Req 4, Req 5
router.post(
  '/',
  authenticate,
  [
    body('course_code').notEmpty().trim().escape().withMessage('course_code required'),
    body('task_type').notEmpty().trim().escape().withMessage('task_type required'),
    body('ai_tool').notEmpty().trim().escape().withMessage('ai_tool required'),
    body('context_text').optional().trim().escape(),
    body('tokens').optional().isInt({ min: 0 }).toInt(),
  ],
  validate,
  usageLogController.createLog
);

// Get own logs with optional filters – Solves Req 6, Req 8
router.get('/', authenticate, usageLogController.getMyLogs);

// Analytics: frequency over time – Solves Req 4
router.get('/analytics/frequency', authenticate, usageLogController.getFrequencyOverTime);

// Analytics: breakdown by AI tool – Solves Req 5
router.get('/analytics/by-tool', authenticate, usageLogController.getBreakdownByTool);

// Analytics: breakdown by task type / context – Solves Req 5
router.get('/analytics/by-task', authenticate, usageLogController.getBreakdownByTaskType);

// Admin: view logs for a specific user – Solves Req 8
router.get(
  '/user/:userId',
  authenticate,
  authorize('admin'),
  usageLogController.getLogsByUser
);

module.exports = router;

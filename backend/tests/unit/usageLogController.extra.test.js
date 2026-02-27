// Tests for usageLogController – createLog, getMyLogs, getLogsByUser, buildWhere filters
// Covers Req 4, 5, 6, 8

process.env.JWT_SECRET = 'test-secret-key-for-jest';

jest.mock('../../models', () => ({
  sequelize: { sync: jest.fn().mockResolvedValue() },
  User: { findOne: jest.fn(), create: jest.fn(), update: jest.fn() },
  UsageLog: { findAll: jest.fn(), create: jest.fn() },
  Consent: { findAll: jest.fn(), create: jest.fn() },
  PasswordResetToken: { create: jest.fn(), findOne: jest.fn(), destroy: jest.fn() },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const { UsageLog } = require('../../models');

function makeToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('usageLogController', () => {
  const studentToken = makeToken({ id: 1, email: 'student@ntnu.no', role: 'student' });
  const adminToken = makeToken({ id: 99, email: 'admin@ntnu.no', role: 'admin' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/usage-logs - createLog', () => {
    it('returns 201 and creates a usage log entry', async () => {
      UsageLog.create.mockResolvedValue({
        id: 1,
        user_id: 1,
        course_code: 'TDT4242',
        task_type: 'Debugging',
        ai_tool: 'LLM',
        context_text: null,
        tokens: null,
      });

      const res = await request(app)
        .post('/api/usage-logs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ course_code: 'TDT4242', task_type: 'Debugging', ai_tool: 'LLM' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('course_code', 'TDT4242');
      expect(UsageLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 1, course_code: 'TDT4242', ai_tool: 'LLM' })
      );
    });

    it('returns 201 with optional context_text and tokens', async () => {
      UsageLog.create.mockResolvedValue({
        id: 2,
        user_id: 1,
        course_code: 'TDT4242',
        task_type: 'Writing',
        ai_tool: 'Code Assistant',
        context_text: 'Wrote unit tests',
        tokens: 150,
      });

      const res = await request(app)
        .post('/api/usage-logs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          course_code: 'TDT4242',
          task_type: 'Writing',
          ai_tool: 'Code Assistant',
          context_text: 'Wrote unit tests',
          tokens: 150,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('tokens', 150);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/usage-logs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ course_code: 'TDT4242' }); // missing task_type and ai_tool

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/usage-logs - getMyLogs', () => {
    it('returns logs for the authenticated user', async () => {
      const mockLogs = [
        { id: 1, user_id: 1, course_code: 'TDT4242', ai_tool: 'LLM', task_type: 'Debugging' },
      ];
      UsageLog.findAll.mockResolvedValue(mockLogs);

      const res = await request(app)
        .get('/api/usage-logs')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockLogs);
      expect(UsageLog.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ user_id: 1 }) })
      );
    });

    it('passes filter query params to buildWhere', async () => {
      UsageLog.findAll.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/usage-logs')
        .query({ course_code: 'TDT4242', task_type: 'Debugging', ai_tool: 'LLM', from: '2025-01-01', to: '2025-12-31' })
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      const callArgs = UsageLog.findAll.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('course_code', 'TDT4242');
      expect(callArgs.where).toHaveProperty('task_type', 'Debugging');
      expect(callArgs.where).toHaveProperty('ai_tool', 'LLM');
      expect(callArgs.where).toHaveProperty('created_at');
    });
  });

  describe('GET /api/usage-logs/user/:userId - getLogsByUser (admin)', () => {
    it('returns logs for the specified user when requester is admin', async () => {
      const mockLogs = [
        { id: 1, user_id: 2, course_code: 'TDT4242', ai_tool: 'LLM', task_type: 'Research' },
      ];
      UsageLog.findAll.mockResolvedValue(mockLogs);

      const res = await request(app)
        .get('/api/usage-logs/user/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockLogs);
      expect(UsageLog.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: '2' } })
      );
    });
  });
});

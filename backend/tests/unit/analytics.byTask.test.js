// TC08 – Unit test: Breakdown by task type endpoint
// Verifies Req 4, Req 5: Dashboard breakdown by usage context / task type
// Input: Fetch /api/usage-logs/analytics/by-task for a user
// Expected: JSON array of task type usage matching mocked DB data

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

describe('TC08 - GET /api/usage-logs/analytics/by-task', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns task type breakdown JSON data matching mocked DB data for the given user', async () => {
    const mockData = [
      { task_type: 'Debugging', count: '8' },
      { task_type: 'Writing', count: '4' },
      { task_type: 'Research', count: '6' },
    ];
    UsageLog.findAll.mockResolvedValue(mockData);

    const token = makeToken({ id: 1, email: 'student@ntnu.no', role: 'student' });

    const res = await request(app)
      .get('/api/usage-logs/analytics/by-task')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(UsageLog.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: 1 }),
        group: ['task_type'],
        raw: true,
      })
    );
  });
});

// TC07 – Unit test: Breakdown by AI tool endpoint
// Verifies Req 4, Req 5: Dashboard breakdown by AI tool category
// Input: Fetch /api/usage-logs/analytics/by-tool for a user
// Expected: JSON array of tool usage matching mocked DB data

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

describe('TC07 - GET /api/usage-logs/analytics/by-tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns tool breakdown JSON data matching mocked DB data for the given user', async () => {
    const mockData = [
      { ai_tool: 'LLM', count: '10' },
      { ai_tool: 'Image Generation', count: '3' },
      { ai_tool: 'Code Assistant', count: '5' },
    ];
    UsageLog.findAll.mockResolvedValue(mockData);

    const token = makeToken({ id: 1, email: 'student@ntnu.no', role: 'student' });

    const res = await request(app)
      .get('/api/usage-logs/analytics/by-tool')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(UsageLog.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: 1 }),
        group: ['ai_tool'],
        raw: true,
      })
    );
  });
});

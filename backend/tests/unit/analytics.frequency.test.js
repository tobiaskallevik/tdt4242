// TC06 – Unit test: Frequency analytics endpoint
// Verifies Req 4: Dashboard frequency of AI prompts over time
// Input: Fetch /api/usage-logs/analytics/frequency for a user
// Expected: Time series JSON array matching mocked DB data

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

describe('TC06 - GET /api/usage-logs/analytics/frequency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns time series JSON data matching mocked DB data for the given user', async () => {
    const mockData = [
      { date: '2025-01-15', count: '3' },
      { date: '2025-01-16', count: '7' },
      { date: '2025-01-17', count: '2' },
    ];
    UsageLog.findAll.mockResolvedValue(mockData);

    const token = makeToken({ id: 1, email: 'student@ntnu.no', role: 'student' });

    const res = await request(app)
      .get('/api/usage-logs/analytics/frequency')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(UsageLog.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: 1 }),
        raw: true,
      })
    );
  });
});

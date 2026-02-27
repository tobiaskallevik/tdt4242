// TC13 – Integration test: Cross-user authorization
// Verifies Req 8: User A cannot access User B's usage logs
// Input: API request where student user supplies another user's ID
// Expected: HTTP 403 forbidden

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

describe('TC13 - Cross-user access to usage logs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 403 when student user A tries to access user B logs via admin endpoint', async () => {
    // User A is a student (not admin)
    const studentToken = makeToken({ id: 1, email: 'usera@ntnu.no', role: 'student' });

    // User A tries to access User B's logs (userId=2)
    const res = await request(app)
      .get('/api/usage-logs/user/2')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/insufficient permissions/i);

    // Controller should never be reached
    expect(UsageLog.findAll).not.toHaveBeenCalled();
  });
});

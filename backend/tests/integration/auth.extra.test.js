// Tests for auth middleware – invalid token and admin authorize pass-through
// Covers uncovered branches in auth.js

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

describe('authenticate middleware – invalid token', () => {
  it('returns 401 when token is expired or malformed', async () => {
    const res = await request(app)
      .get('/api/usage-logs')
      .set('Authorization', 'Bearer totally.invalid.token');

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });
});

describe('authorize middleware – admin pass-through', () => {
  it('allows admin to access admin-only endpoint', async () => {
    const adminToken = jwt.sign(
      { id: 99, email: 'admin@ntnu.no', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    UsageLog.findAll.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/usage-logs/user/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

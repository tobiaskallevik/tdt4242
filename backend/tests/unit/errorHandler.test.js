// Tests for errorHandler middleware

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
const { Consent } = require('../../models');

function makeToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('errorHandler middleware', () => {
  it('returns 500 with error message when controller throws', async () => {
    const token = makeToken({ id: 1, email: 'test@ntnu.no', role: 'student' });

    // Force an error by making findAll throw
    Consent.findAll.mockRejectedValue(new Error('Database connection lost'));

    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .get('/api/consents')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Database connection lost');

    spy.mockRestore();
  });
});

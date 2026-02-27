// TC12 – Integration test: Usage log endpoints without auth
// Verifies Req 8: Authentication module keeps logs restricted
// Input: API request to usage logs endpoints without an auth header
// Expected: HTTP 401 unauthorized status

process.env.JWT_SECRET = 'test-secret-key-for-jest';

jest.mock('../../models', () => ({
  sequelize: { sync: jest.fn().mockResolvedValue() },
  User: { findOne: jest.fn(), create: jest.fn(), update: jest.fn() },
  UsageLog: { findAll: jest.fn(), create: jest.fn() },
  Consent: { findAll: jest.fn(), create: jest.fn() },
  PasswordResetToken: { create: jest.fn(), findOne: jest.fn(), destroy: jest.fn() },
}));

const request = require('supertest');
const app = require('../../app');

describe('TC12 - Usage log endpoints without authentication', () => {
  const endpoints = [
    ['GET', '/api/usage-logs'],
    ['GET', '/api/usage-logs/analytics/frequency'],
    ['GET', '/api/usage-logs/analytics/by-tool'],
    ['GET', '/api/usage-logs/analytics/by-task'],
    ['POST', '/api/usage-logs'],
  ];

  test.each(endpoints)(
    '%s %s returns 401 when no auth header is provided',
    async (method, url) => {
      const res = await request(app)[method.toLowerCase()](url);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/authentication required/i);
    }
  );
});

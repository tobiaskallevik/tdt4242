// TC02 – Unit test: Login endpoint validation
// Verifies Req 2: Validates the validation middleware
// Input: Valid email but no password to login endpoint
// Expected: HTTP 400 bad request with validation error message

jest.mock('../../models', () => ({
  sequelize: { sync: jest.fn().mockResolvedValue() },
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  UsageLog: { findAll: jest.fn(), create: jest.fn() },
  Consent: { findAll: jest.fn(), create: jest.fn() },
  PasswordResetToken: { create: jest.fn(), findOne: jest.fn(), destroy: jest.fn() },
}));

const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');

describe('TC02 - POST /api/auth/login - missing password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 validation error when password is not provided', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@ntnu.no' }); // no password field

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Password is required' }),
      ])
    );

    // Validation should short-circuit before reaching the controller
    expect(User.findOne).not.toHaveBeenCalled();
  });
});

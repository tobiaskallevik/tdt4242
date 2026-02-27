// TC01 – Unit test: Register endpoint
// Verifies Req 1: Student can create an account with email and password
// Input: Valid email and password to registration endpoint
// Expected: HTTP 201 with userId, database save called with expected data

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

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');

describe('TC01 - POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 201 with userId when given valid email and password', async () => {
    // Mock: email not already registered
    User.findOne.mockResolvedValue(null);
    // Mock: user created successfully
    User.create.mockResolvedValue({
      id: 1,
      email: 'student@ntnu.no',
      role: 'student',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'student@ntnu.no', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('email', 'student@ntnu.no');
    expect(res.body).toHaveProperty('role', 'student');

    // Verify database save was called with expected data
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'student@ntnu.no',
        password_hash: 'hashed-password',
      })
    );
  });
});

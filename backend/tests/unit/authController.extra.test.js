// Tests for authController – login success path and resetPassword
// Covers Req 2 (secure login) and Req 3 (password reset)

process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.JWT_EXPIRES_IN = '1h';

jest.mock('../../models', () => ({
  sequelize: { sync: jest.fn().mockResolvedValue() },
  User: { findOne: jest.fn(), create: jest.fn(), update: jest.fn() },
  UsageLog: { findAll: jest.fn(), create: jest.fn() },
  Consent: { findAll: jest.fn(), create: jest.fn() },
  PasswordResetToken: { create: jest.fn(), findOne: jest.fn(), destroy: jest.fn() },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pw'),
  compare: jest.fn(),
}));

const request = require('supertest');
const app = require('../../app');
const { User, PasswordResetToken } = require('../../models');
const bcrypt = require('bcryptjs');

describe('authController – login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a JWT token on successful login', async () => {
    User.findOne.mockResolvedValue({
      id: 1,
      email: 'student@ntnu.no',
      password_hash: 'stored-hash',
      role: 'student',
    });
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@ntnu.no', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ id: 1, email: 'student@ntnu.no', role: 'student' });
  });

  it('returns 401 when user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@ntnu.no', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it('returns 401 when password is wrong', async () => {
    User.findOne.mockResolvedValue({
      id: 1,
      email: 'student@ntnu.no',
      password_hash: 'stored-hash',
      role: 'student',
    });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@ntnu.no', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });
});

describe('authController – resetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resets password with a valid token', async () => {
    PasswordResetToken.findOne.mockResolvedValue({ id: 10, user_id: 1, token: 'valid-token' });
    User.update.mockResolvedValue([1]);
    PasswordResetToken.destroy.mockResolvedValue(1);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'valid-token', newPassword: 'newpassword123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset successfully/i);
    expect(User.update).toHaveBeenCalledWith(
      { password_hash: 'hashed-pw' },
      { where: { id: 1 } }
    );
    expect(PasswordResetToken.destroy).toHaveBeenCalledWith({ where: { id: 10 } });
  });

  it('returns 400 when reset token is invalid or expired', async () => {
    PasswordResetToken.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'expired-token', newPassword: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });
});

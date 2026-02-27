// TC04 – Integration test: Forgot password flow
// Verifies Req 3: Password reset request generates token and sends email
// Input: Pressing forget password button and entering email
// Expected: HTTP 200, reset token saved to DB, mock email sent with link

process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.FRONTEND_URL = 'http://localhost:3000';

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-123' });

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  }),
}));

jest.mock('../../models', () => ({
  sequelize: { sync: jest.fn().mockResolvedValue() },
  User: { findOne: jest.fn(), create: jest.fn(), update: jest.fn() },
  UsageLog: { findAll: jest.fn(), create: jest.fn() },
  Consent: { findAll: jest.fn(), create: jest.fn() },
  PasswordResetToken: { create: jest.fn(), findOne: jest.fn(), destroy: jest.fn() },
}));

const request = require('supertest');
const nodemailer = require('nodemailer');
const app = require('../../app');
const { User, PasswordResetToken } = require('../../models');

describe('TC04 - POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200, saves reset token to DB, and sends mock email', async () => {
    // Mock: user exists in database
    User.findOne.mockResolvedValue({ id: 5, email: 'student@ntnu.no' });
    // Mock: token creation succeeds
    PasswordResetToken.create.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'student@ntnu.no' });

    // HTTP 200 OK status
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/reset link/i);

    // Reset token saved to DB
    expect(PasswordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 5,
        token: expect.any(String),
        expires_at: expect.any(Date),
      })
    );

    // Verify the token is a 64-char hex string (32 random bytes)
    const savedToken = PasswordResetToken.create.mock.calls[0][0].token;
    expect(savedToken).toMatch(/^[a-f0-9]{64}$/);

    // Mock email was sent with a reset link
    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'student@ntnu.no',
        subject: expect.stringContaining('Password Reset'),
      })
    );
  });
});

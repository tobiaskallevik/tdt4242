// Tests for consentController – createConsent and getMyConsents
// Covers Req 7 (informed consent)

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

describe('consentController', () => {
  const token = makeToken({ id: 1, email: 'student@ntnu.no', role: 'student' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/consents - createConsent', () => {
    it('returns 201 and creates a consent record', async () => {
      Consent.create.mockResolvedValue({
        id: 1,
        user_id: 1,
        consent_version: '1.0',
        consented_at: '2025-01-01T00:00:00Z',
      });

      const res = await request(app)
        .post('/api/consents')
        .set('Authorization', `Bearer ${token}`)
        .send({ consent_version: '1.0' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('consent_version', '1.0');
      expect(Consent.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 1, consent_version: '1.0' })
      );
    });

    it('returns 400 when consent_version is missing', async () => {
      const res = await request(app)
        .post('/api/consents')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/consents - getMyConsents', () => {
    it('returns the current user consent records', async () => {
      const mockConsents = [
        { id: 1, user_id: 1, consent_version: '1.0', consented_at: '2025-01-01T00:00:00Z' },
      ];
      Consent.findAll.mockResolvedValue(mockConsents);

      const res = await request(app)
        .get('/api/consents')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockConsents);
      expect(Consent.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: 1 } })
      );
    });
  });
});

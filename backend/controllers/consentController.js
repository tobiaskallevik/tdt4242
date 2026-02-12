// Consent controller – record and retrieve consent
// Solves Req 7 (informed consent for data collection)
const { Consent } = require('../models');

// Record new consent
const createConsent = async (req, res, next) => {
  try {
    const { consent_version } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || null;

    const consent = await Consent.create({
      user_id: req.user.id,
      consent_version,
      ip,
    });

    return res.status(201).json(consent);
  } catch (err) {
    next(err);
  }
};

// Get current user's consent records
const getMyConsents = async (req, res, next) => {
  try {
    const consents = await Consent.findAll({
      where: { user_id: req.user.id },
      order: [['consented_at', 'DESC']],
    });
    return res.json(consents);
  } catch (err) {
    next(err);
  }
};

module.exports = { createConsent, getMyConsents };

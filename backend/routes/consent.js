// Consent routes – record and view consent
// Solves Req 7 (informed consent)
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const consentController = require('../controllers/consentController');

// Record consent – requires authentication
router.post(
  '/',
  authenticate,
  [
    body('consent_version')
      .notEmpty()
      .withMessage('consent_version is required'),
  ],
  validate,
  consentController.createConsent
);

// Get current user's consent history
router.get('/', authenticate, consentController.getMyConsents);

module.exports = router;

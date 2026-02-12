// Consent service – record and retrieve consent
// Solves Req 7 (informed consent for data collection)
import api from './api';

export const createConsent = (consent_version) =>
  api.post('/consents', { consent_version });

export const getMyConsents = () => api.get('/consents');

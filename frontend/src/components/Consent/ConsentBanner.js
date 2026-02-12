// ConsentBanner component – shown before data is collected
// Solves Req 7 (system must obtain informed consent for data collection)
import React, { useState, useEffect } from 'react';
import { createConsent, getMyConsents } from '../../services/consentService';

const CURRENT_CONSENT_VERSION = '1.0';

const ConsentBanner = ({ onConsented }) => {
  const [hasConsented, setHasConsented] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await getMyConsents();
        const current = data.find(
          (c) => c.consent_version === CURRENT_CONSENT_VERSION
        );
        if (current) {
          setHasConsented(true);
          onConsented && onConsented();
        }
      } catch {
        // not consented yet
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async () => {
    try {
      await createConsent(CURRENT_CONSENT_VERSION);
      setHasConsented(true);
      onConsented && onConsented();
    } catch (err) {
      alert('Failed to record consent. Please try again.');
    }
  };

  if (loading || hasConsented) return null;

  // Solves Req 7 – informed consent
  return (
    <div className="consent-banner">
      <h3>Data Collection Consent</h3>
      <p>
        This application collects data about your AI tool usage to help ensure
        compliance with university policies. The data includes course codes,
        task types, AI tools used, and optional context text. Your data will
        only be accessible to you and authorized university personnel.
      </p>
      <p>
        Consent version: <strong>{CURRENT_CONSENT_VERSION}</strong>
      </p>
      <button onClick={handleAccept}>I Consent</button>
    </div>
  );
};

export default ConsentBanner;

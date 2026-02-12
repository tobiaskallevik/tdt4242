// DashboardPage – wraps Dashboard with consent check
// Solves Req 4, Req 5, Req 6, Req 7
import React, { useState } from 'react';
import ConsentBanner from '../Consent/ConsentBanner';
import Dashboard from './Dashboard';

const DashboardPage = () => {
  const [consented, setConsented] = useState(false);

  return (
    <div>
      <ConsentBanner onConsented={() => setConsented(true)} />
      {consented ? (
        <Dashboard />
      ) : (
        <p>Please accept the data collection consent to view your dashboard.</p>
      )}
    </div>
  );
};

export default DashboardPage;

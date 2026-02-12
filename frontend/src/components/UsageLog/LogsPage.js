// LogsPage – combines UsageLogForm and UsageLogList with consent gate
// Solves Req 4, Req 5, Req 6, Req 7
import React, { useState } from 'react';
import ConsentBanner from '../Consent/ConsentBanner';
import UsageLogForm from '../UsageLog/UsageLogForm';
import UsageLogList from '../UsageLog/UsageLogList';

const LogsPage = () => {
  const [consented, setConsented] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      {/* Solves Req 7 – consent must be granted before data collection */}
      <ConsentBanner onConsented={() => setConsented(true)} />
      {consented ? (
        <>
          <UsageLogForm onCreated={() => setRefreshKey((k) => k + 1)} />
          <UsageLogList refreshKey={refreshKey} />
        </>
      ) : (
        <p>Please accept the data collection consent to start logging.</p>
      )}
    </div>
  );
};

export default LogsPage;

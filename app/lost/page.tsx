'use client';

import React, { useState } from 'react';
import QuickSearchBar from '../../components/lost/QuickSearchBar';
import LostReportWizard from '../../components/lost/LostReportWizard';

export default function LostPage() {
  const [inWizard, setInWizard] = useState(true);

  return (
    <main className="min-h-screen bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!inWizard ? (
          <QuickSearchBar onStartReport={() => setInWizard(true)} />
        ) : (
          <LostReportWizard onBackToSearch={() => setInWizard(false)} />
        )}
      </div>
    </main>
  );
}

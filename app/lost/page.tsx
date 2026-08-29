'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import QuickSearchBar from '@/components/lost/QuickSearchBar';
import LostReportWizard from '@/components/lost/LostReportWizard';

export default function LostPage() {
  const router = useRouter();
  const [inWizard, setInWizard] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (inWizard) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login?redirect=/lost');
          return;
        }
      }
      setLoadingAuth(false);
    }
    checkAuth();
  }, [inWizard, router]);

  const handleStartReport = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login?redirect=/lost');
    } else {
      setInWizard(true);
    }
  };

  if (inWizard && loadingAuth) {
    return (
      <main className="min-h-screen bg-canvas py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-xs text-text-secondary">Checking authentication...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!inWizard ? (
          <QuickSearchBar onStartReport={handleStartReport} />
        ) : (
          <LostReportWizard onBackToSearch={() => setInWizard(false)} />
        )}
      </div>
    </main>
  );
}

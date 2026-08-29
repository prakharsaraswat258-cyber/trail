'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QuickSearchBar from '@/components/lost/QuickSearchBar';
import LostReportWizard from '@/components/lost/LostReportWizard';
import { BottomNav } from '@/components/browse/BottomNav';

export default function SearchPage() {
  const [inWizard, setInWizard] = useState(false);

  return (
    <div className="bg-[#FAF8F3] min-h-screen text-[#1C1B18] flex justify-center">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md min-h-screen bg-[#FAF8F3] flex flex-col sm:border-x sm:border-black/7 sm:shadow-xl relative">
        {/* Sticky Mobile App Header */}
        <header className="sticky top-0 z-20 bg-[#FAF8F3] px-4 pt-4 pb-3 border-b border-black/7 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link
                href="/browse"
                aria-label="Back to browse"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6E6B5F] hover:text-[#1C1B18] hover:bg-[#ECEAE2] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-[#1C1B18] tracking-tight">
                {inWizard ? 'Report Lost Item' : 'Search Items'}
              </h1>
            </div>
            <span className="text-xs font-semibold text-[#C96442] bg-[#F2E8E2] px-2.5 py-1 rounded-full">
              Live Search
            </span>
          </div>
        </header>

        {/* Search / Wizard Content */}
        <main className="flex-1 px-4 py-4 space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
          {!inWizard ? (
            <QuickSearchBar onStartReport={() => setInWizard(true)} simplified={true} />
          ) : (
            <LostReportWizard onBackToSearch={() => setInWizard(false)} />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

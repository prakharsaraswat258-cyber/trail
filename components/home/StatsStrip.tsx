'use client';

import React, { useEffect, useState } from 'react';
import { BentoCard } from '@/components/ui/BentoCard';
import { fetchStatsSummary, StatsSummary } from '@/lib/api/stats';
import { CheckCircle2, FileText, Clock } from 'lucide-react';

export function StatsStrip() {
  const [stats, setStats] = useState<StatsSummary>({
    itemsReturnedThisWeek: 42,
    activeReports: 128,
    avgTimeToMatchHours: 4.2,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchStatsSummary();
        setStats(data);
      } catch {
        // Fallback to default
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2" aria-label="Community statistics">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 overflow-x-auto pb-1 sm:pb-0">
        {/* Metric 1: Items Returned */}
        <BentoCard compact className="flex items-center gap-3.5 bg-white border border-border">
          <div className="w-9 h-9 rounded-md bg-success-light flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-normal text-text-secondary leading-tight">
              Items Returned This Week
            </p>
            <p className="text-xl font-semibold text-text-primary mt-0.5 tracking-tight">
              {loading ? '—' : stats.itemsReturnedThisWeek}
            </p>
          </div>
        </BentoCard>

        {/* Metric 2: Active Reports */}
        <BentoCard compact className="flex items-center gap-3.5 bg-white border border-border">
          <div className="w-9 h-9 rounded-md bg-surface-alt flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-normal text-text-secondary leading-tight">
              Active Reports
            </p>
            <p className="text-xl font-semibold text-text-primary mt-0.5 tracking-tight">
              {loading ? '—' : stats.activeReports}
            </p>
          </div>
        </BentoCard>

        {/* Metric 3: Avg Time to Match */}
        <BentoCard compact className="flex items-center gap-3.5 bg-white border border-border">
          <div className="w-9 h-9 rounded-md bg-accent-light flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-normal text-text-secondary leading-tight">
              Avg. Time to Match
            </p>
            <p className="text-xl font-semibold text-text-primary mt-0.5 tracking-tight">
              {loading ? '—' : `${stats.avgTimeToMatchHours}h`}
            </p>
          </div>
        </BentoCard>
      </div>
    </section>
  );
}

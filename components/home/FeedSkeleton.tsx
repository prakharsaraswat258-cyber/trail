import React from 'react';
import { BentoCard } from '@/components/ui/BentoCard';

export function FeedSkeleton() {
  return (
    <div className="w-full space-y-3.5" aria-label="Loading reports">
      {[1, 2, 3].map((i) => (
        <BentoCard key={i} className="animate-opacity-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Type Badge & Category skeleton */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-6 bg-surface-alt rounded-md" />
                <div className="w-20 h-4 bg-surface-alt rounded" />
              </div>

              {/* Title skeleton */}
              <div className="w-4/5 h-5 bg-surface-alt rounded" />

              {/* Description snippet skeleton */}
              <div className="space-y-1.5">
                <div className="w-full h-4 bg-surface-alt rounded" />
                <div className="w-3/5 h-4 bg-surface-alt rounded" />
              </div>

              {/* Meta row skeleton */}
              <div className="w-1/2 h-3.5 bg-surface-alt rounded pt-1" />
            </div>

            {/* Photo / Thumbnail placeholder skeleton */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface-alt rounded-lg flex-shrink-0" />
          </div>

          {/* Footer action skeleton */}
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <div className="w-24 h-5 bg-surface-alt rounded" />
            <div className="w-32 h-9 bg-surface-alt rounded-lg" />
          </div>
        </BentoCard>
      ))}
    </div>
  );
}

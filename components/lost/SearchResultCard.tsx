'use client';

import React, { useState } from 'react';
import { FoundSearchResult } from '../../lib/api/lostItems';
import { BentoCard } from '../ui/BentoCard';
import { Button } from '../ui/Button';

interface SearchResultCardProps {
  item: FoundSearchResult;
}

export default function SearchResultCard({ item }: SearchResultCardProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClaimClick = () => {
    // Stubbed placeholder only per spec
    setToastMessage('Owner verification & claim flow is coming soon.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <BentoCard className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border hover:border-border-strong transition-colors">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-12 h-12 rounded-lg bg-surface-alt border border-border flex-shrink-0 flex items-center justify-center text-text-secondary">
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.itemName}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <svg
              className="w-6 h-6 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              {item.itemName}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-alt text-text-secondary border border-border">
              {item.category}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Found {item.foundDate} near {item.foundLocationSummary}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:items-end gap-1.5 flex-shrink-0">
        <Button
          type="button"
          variant="secondary"
          className="text-xs sm:text-sm py-2 px-4 whitespace-nowrap w-full sm:w-auto"
          onClick={handleClaimClick}
        >
          This might be mine →
        </Button>
        {toastMessage && (
          <span className="text-xs text-accent font-medium animate-fade-in" role="status">
            {toastMessage}
          </span>
        )}
      </div>
    </BentoCard>
  );
}

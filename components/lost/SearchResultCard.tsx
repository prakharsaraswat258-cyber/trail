'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FoundSearchResult } from '../../lib/api/lostItems';
import { BentoCard } from '../ui/BentoCard';
import { Button } from '../ui/Button';

interface SearchResultCardProps {
  item: FoundSearchResult;
}

export default function SearchResultCard({ item }: SearchResultCardProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClaimClick = () => {
    setToastMessage('Match recorded. We will alert you when verified.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const isLost = item.type === 'lost';

  return (
    <BentoCard className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border hover:border-border-strong transition-colors bg-white">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="relative w-12 h-12 rounded-lg bg-surface-alt border border-border flex-shrink-0 flex items-center justify-center text-text-secondary overflow-hidden">
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.itemName}
              fill
              sizes="48px"
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

        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                isLost
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {item.type || 'FOUND'}
            </span>

            {/* Ticket / Ref ID */}
            {item.ticketId && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#F3F1EB] text-[#1C1B18] border border-[rgba(0,0,0,0.14)]">
                {item.ticketId}
              </span>
            )}

            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              {item.itemName}
            </h3>

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-alt text-text-secondary border border-border">
              {item.category}
            </span>
          </div>

          {item.description && (
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          <p className="text-xs text-text-muted flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0 text-[#A8A49A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{isLost ? 'Lost' : 'Found'} {item.foundDate} · {item.foundLocationSummary}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:items-end gap-1.5 flex-shrink-0">
        {isLost && item.ticketId ? (
          <Link
            href={`/lost/${item.ticketId}`}
            className="inline-flex items-center justify-center text-xs sm:text-sm font-semibold py-2 px-4 rounded-lg bg-[#FAF8F3] hover:bg-[#F3F1EB] text-[#1C1B18] border border-[rgba(0,0,0,0.14)] min-h-[44px] transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            Track Status →
          </Link>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="text-xs sm:text-sm py-2 px-4 whitespace-nowrap w-full sm:w-auto min-h-[44px]"
            onClick={handleClaimClick}
          >
            This might be mine →
          </Button>
        )}
        {toastMessage && (
          <span className="text-xs text-accent font-medium animate-fade-in" role="status">
            {toastMessage}
          </span>
        )}
      </div>
    </BentoCard>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Calendar, MapPin, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { MatchBadge } from '../ui/MatchBadge';
import { Button } from '../ui/Button';

export interface MatchResultItem {
  found_item_id: string;
  confidence_score: number;
  confidence_label: string;
  ai_reasoning: string;
  item_name: string;
  category: string;
  date_found?: string;
  location_found?: string;
}

interface MatchResultsDrawerProps {
  isOpen: boolean;
  matches: MatchResultItem[];
  ticketId: string;
  onSelectCandidate?: (candidate: MatchResultItem) => void;
  onProceedToTracking?: () => void;
}

export function MatchResultsDrawer({
  isOpen,
  matches,
  ticketId,
  onSelectCandidate,
  onProceedToTracking,
}: MatchResultsDrawerProps) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchCurrentY, setTouchCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleProceed = React.useCallback(() => {
    if (onProceedToTracking) {
      onProceedToTracking();
    } else if (ticketId) {
      router.push(`/lost/${ticketId}`);
    }
  }, [onProceedToTracking, ticketId, router]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleProceed();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleProceed]);

  if (!isOpen || !matches || matches.length === 0) {
    return null;
  }

  // Touch gesture handlers for mobile bottom sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    if (currentY > touchStartY) {
      setTouchCurrentY(currentY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (touchCurrentY - touchStartY > 90) {
      handleProceed();
    }
    setTouchStartY(0);
    setTouchCurrentY(0);
  };

  const dragOffset = isDragging && touchCurrentY > touchStartY ? touchCurrentY - touchStartY : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-results-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-sans animate-fade-in"
    >
      {/* Solid overlay backdrop - no blur per Brand DNA */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={handleProceed}
        aria-hidden="true"
      />

      {/* Sheet Surface */}
      <div
        ref={drawerRef}
        style={dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined}
        className="relative w-full max-h-[85vh] sm:max-w-xl bg-white rounded-t-2xl sm:rounded-xl shadow-2xl z-10 overflow-hidden flex flex-col transition-transform duration-150"
      >
        {/* Mobile Drag Handle */}
        <div
          className="sm:hidden pt-3 pb-1 cursor-grab active:cursor-grabbing flex justify-center shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-[#A8A49A]/50" />
        </div>

        {/* Header */}
        <div className="p-5 border-b border-[rgba(0,0,0,0.07)] flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[rgba(5,150,105,0.08)] text-[#047857] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Match Engine</span>
            </div>
            <h2
              id="match-results-title"
              className="text-lg sm:text-xl font-bold text-[#1C1B18] tracking-tight"
            >
              Potential Matches Found ({matches.length})
            </h2>
            <p className="text-xs text-[#6E6B5F] leading-relaxed">
              We identified matching items turned in by finders that closely fit your report description.
            </p>
          </div>

          <button
            type="button"
            onClick={handleProceed}
            aria-label="Close match results and go to ticket tracking"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[rgba(0,0,0,0.07)] bg-white text-[#1C1B18] hover:bg-[#F3F1EB] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Cards List (No photos rendered - privacy safe) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
          {matches.map((item) => (
            <div
              key={item.found_item_id}
              className="p-4 sm:p-5 rounded-lg bg-white border border-[rgba(0,0,0,0.07)] hover:border-[rgba(0,0,0,0.14)] transition-all space-y-3"
            >
              {/* Header Row: Title, Category & Badge */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-[#A8A49A] uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1C1B18] truncate mt-0.5">
                    {item.item_name}
                  </h3>
                </div>

                <MatchBadge
                  confidenceLabel={item.confidence_label}
                  score={item.confidence_score}
                  className="shrink-0"
                />
              </div>

              {/* AI Reasoning Quote Box */}
              {item.ai_reasoning && (
                <div className="p-3 bg-[#FAF8F3] rounded-md border border-[rgba(0,0,0,0.06)] text-xs text-[#6E6B5F] leading-relaxed">
                  <span className="font-semibold text-[#1C1B18]">AI Insight: </span>
                  {item.ai_reasoning}
                </div>
              )}

              {/* Metadata Row: Date & Location */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#6E6B5F] pt-1">
                {item.date_found && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#A8A49A]" />
                    <span>Found: {item.date_found}</span>
                  </div>
                )}
                {item.location_found && (
                  <div className="flex items-center gap-1 truncate max-w-[240px]">
                    <MapPin className="w-3.5 h-3.5 text-[#A8A49A] shrink-0" />
                    <span className="truncate">{item.location_found}</span>
                  </div>
                )}
              </div>

              {/* Action CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onSelectCandidate?.(item)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#C96442] hover:bg-[#B5572E] active:bg-[#9E4622] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>Claim This Item</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAF8F3] border-t border-[rgba(0,0,0,0.07)] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-[#6E6B5F] text-center sm:text-left">
            None of these your item? You can view and track your report status anytime.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto min-h-[44px] text-xs font-semibold px-5 py-2.5 whitespace-nowrap"
            onClick={handleProceed}
          >
            Continue to Ticket Tracking
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MatchResultsDrawer;

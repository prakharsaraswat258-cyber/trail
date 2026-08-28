import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
  searchQuery?: string;
  selectedType?: string;
}

export function EmptyState({ onClearFilters, searchQuery, selectedType }: EmptyStateProps) {
  return (
    <div className="w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-[#FFFFFF] rounded-2xl border border-[rgba(0,0,0,0.07)] my-2">
      {/* Icon illustration container */}
      <div className="w-14 h-14 rounded-2xl bg-[#FAF8F3] border border-[rgba(0,0,0,0.07)] flex items-center justify-center text-[#A8A49A] mb-4">
        <SearchX className="w-7 h-7 text-[#6E6B5F]" />
      </div>

      {/* Copy */}
      <h3 className="text-base font-bold text-[#1C1B18]">
        No items match
      </h3>
      <p className="text-xs text-[#6E6B5F] mt-1.5 max-w-xs leading-relaxed">
        No items match — try widening your search or switching filter categories.
      </p>

      {/* Clear Filters Action Button (>= 44x44px touch target) */}
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F3F1EB] border border-[rgba(0,0,0,0.07)] text-xs font-semibold text-[#1C1B18] flex items-center gap-2 transition-colors active:scale-95"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[#C96442]" />
        <span>Clear filters & search</span>
      </button>
    </div>
  );
}

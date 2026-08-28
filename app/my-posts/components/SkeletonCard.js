import React from 'react';

/**
 * SkeletonCard component
 * Placeholder loading card with solid rounded blocks and animate-pulse.
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white border border-black/7 rounded-lg p-5 w-full">
      <div className="flex items-start gap-4">
        {/* Thumbnail skeleton */}
        <div className="w-16 h-16 rounded-md bg-[#F3F1EB] animate-pulse shrink-0" />

        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Tags row */}
          <div className="flex items-center gap-2">
            <div className="w-14 h-6 rounded-md bg-[#F3F1EB] animate-pulse" />
            <div className="w-16 h-6 rounded-md bg-[#F3F1EB] animate-pulse" />
          </div>

          {/* Title line */}
          <div className="w-3/4 h-5 rounded-md bg-[#F3F1EB] animate-pulse" />

          {/* Location line */}
          <div className="w-1/2 h-4 rounded-md bg-[#F3F1EB] animate-pulse" />
        </div>
      </div>

      {/* Action row skeleton */}
      <div className="mt-5 pt-4 border-t border-black/7 flex items-center justify-between gap-3">
        <div className="w-24 h-9 rounded-lg bg-[#F3F1EB] animate-pulse" />
        <div className="flex gap-2">
          <div className="w-20 h-9 rounded-lg bg-[#F3F1EB] animate-pulse" />
          <div className="w-9 h-9 rounded-lg bg-[#F3F1EB] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

import React from 'react';

interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-card-${index}`}
          className="w-full bg-[#FFFFFF] rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden shadow-sm flex flex-col"
        >
          {/* Photo skeleton (1:1 aspect ratio) */}
          <div className="w-full aspect-square bg-[#F3F1EB] animate-pulse relative p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-14 h-6 rounded-full bg-[#ECEAE2]" />
              <div className="w-24 h-6 rounded-full bg-[#ECEAE2]" />
            </div>
          </div>

          {/* Card Body skeleton */}
          <div className="p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="w-20 h-4 rounded-md bg-[#F3F1EB] animate-pulse" />
              <div className="w-16 h-4 rounded-full bg-[#F3F1EB] animate-pulse" />
            </div>

            {/* Title skeleton */}
            <div className="space-y-1.5 pt-0.5">
              <div className="w-full h-4 rounded bg-[#F3F1EB] animate-pulse" />
              <div className="w-3/4 h-4 rounded bg-[#F3F1EB] animate-pulse" />
            </div>

            {/* Location & Time footer skeleton */}
            <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.04)]">
              <div className="w-36 h-3 rounded bg-[#F3F1EB] animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-[#F3F1EB] animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

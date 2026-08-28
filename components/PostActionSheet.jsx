'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CheckCircle2 } from 'lucide-react';

export function PostActionSheet({ isOpen, onClose }) {
  const router = useRouter();
  const touchStartY = useRef(0);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Swipe-down to dismiss gesture
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY - touchStartY.current > 50) {
      onClose?.();
    }
  };

  const handleNavigate = (path) => {
    onClose?.();
    router.push(path);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-action-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center font-sans animate-fadeIn"
    >
      {/* Dark translucent overlay (No backdrop blur) */}
      <div
        className="fixed inset-0 transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(28, 27, 24, 0.4)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Surface */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-md bg-[#FFFFFF] rounded-t-2xl pt-3 px-5 z-10 shadow-xl transition-transform duration-300 ease-out pb-[max(16px,env(safe-area-inset-bottom,16px))]"
      >
        {/* Drag handle (pill 40px x 4px, 12px from top) */}
        <div
          aria-hidden="true"
          className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.14)' }}
        />

        {/* Sheet Title */}
        <h3
          id="post-action-sheet-title"
          className="text-[18px] font-semibold text-[#1C1B18] text-center mb-4"
        >
          What would you like to post?
        </h3>

        {/* Options Stack (12px gap between rows) */}
        <div className="flex flex-col gap-3">
          {/* Row 1 — Report Lost Item */}
          <button
            type="button"
            onClick={() => handleNavigate('/lost')}
            className="w-full min-h-[56px] px-4 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F3F1EB] active:bg-[#F3F1EB] border border-[rgba(0,0,0,0.07)] flex items-center gap-3.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#C96442]"
          >
            <Search className="w-6 h-6 text-[#C96442] flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[16px] font-semibold text-[#1C1B18]">
                Report Lost Item
              </span>
              <span className="text-[12px] text-[#6E6B5F]">
                Lost something? Let us help you find it.
              </span>
            </div>
          </button>

          {/* Row 2 — Report Found Item */}
          <button
            type="button"
            onClick={() => handleNavigate('/found')}
            className="w-full min-h-[56px] px-4 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F3F1EB] active:bg-[#F3F1EB] border border-[rgba(0,0,0,0.07)] flex items-center gap-3.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#059669]"
          >
            <CheckCircle2 className="w-6 h-6 text-[#059669] flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[16px] font-semibold text-[#1C1B18]">
                Report Found Item
              </span>
              <span className="text-[12px] text-[#6E6B5F]">
                Found something? Help reunite it with its owner.
              </span>
            </div>
          </button>
        </div>

        {/* Cancel Button (44px touch target) */}
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 flex items-center justify-center text-[14px] font-medium text-[#6E6B5F] hover:text-[#1C1B18] transition-colors focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostActionSheet;

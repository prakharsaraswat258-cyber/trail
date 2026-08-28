import React from 'react';
import { Search, PlusCircle, X } from 'lucide-react';

interface ReportBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (route: 'lost' | 'found') => void;
}

export function ReportBottomSheet({
  isOpen,
  onClose,
  onSelectAction,
}: ReportBottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-filter-none transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-t-3xl border-t border-[rgba(0,0,0,0.07)] p-6 z-10 shadow-2xl animate-fadeIn pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
        {/* Handle Bar */}
        <div className="w-12 h-1.5 bg-[#E5E3DC] rounded-full mx-auto mb-4" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#1C1B18]">Create a Report</h2>
            <p className="text-xs text-[#6E6B5F] mt-0.5">
              Choose the type of campus report to file
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#6E6B5F] hover:bg-[#F3F1EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {/* Option 1: Report Lost */}
          <button
            type="button"
            onClick={() => onSelectAction('lost')}
            className="w-full min-h-[56px] p-4 rounded-2xl bg-[#FAF8F3] hover:bg-[#F3F1EB] border border-[rgba(0,0,0,0.07)] flex items-center gap-3.5 text-left transition-colors active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1C1B18] text-[#FAF8F3] flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block text-sm font-bold text-[#1C1B18]">
                I Lost Something
              </span>
              <span className="block text-xs text-[#6E6B5F]">
                Report an item you are missing to match with found reports
              </span>
            </div>
          </button>

          {/* Option 2: Report Found */}
          <button
            type="button"
            onClick={() => onSelectAction('found')}
            className="w-full min-h-[56px] p-4 rounded-2xl bg-[#FAF8F3] hover:bg-[#F3F1EB] border border-[rgba(0,0,0,0.07)] flex items-center gap-3.5 text-left transition-colors active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C96442] text-white flex items-center justify-center flex-shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block text-sm font-bold text-[#1C1B18]">
                I Found Something
              </span>
              <span className="block text-xs text-[#6E6B5F]">
                List an item you found on campus so the owner can claim it
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

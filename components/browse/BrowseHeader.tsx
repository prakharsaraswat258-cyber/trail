import React from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

export function BrowseHeader() {
  return (
    <header className="w-full bg-[#FAF8F3] border-b border-[rgba(0,0,0,0.07)] px-4 py-2.5 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)] flex items-center justify-between sticky top-0 z-20">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
          <Image
            src="/icons/icon-192.png"
            alt="LPU Find Logo"
            width={32}
            height={32}
            className="object-contain w-full h-full"
            priority
          />
        </div>
        <span className="text-lg font-bold text-[#1C1B18] tracking-tight">
          LPU Find
        </span>
      </div>

      {/* Location Pill */}
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Change campus location"
          className="min-h-[44px] px-3 py-1.5 rounded-full bg-[#F3F1EB] border border-[rgba(0,0,0,0.07)] text-xs font-medium text-[#1C1B18] flex items-center gap-1.5 hover:bg-[#ECEAE2] transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-[#C96442]" />
          <span>Main Campus</span>
        </button>
      </div>
    </header>
  );
}

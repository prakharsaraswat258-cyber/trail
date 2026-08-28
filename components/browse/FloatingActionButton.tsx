import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <div className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] z-20">
      <button
        type="button"
        onClick={onClick}
        aria-label="Report lost or found item"
        className="w-14 h-14 rounded-full bg-[#C96442] hover:bg-[#B5572E] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C96442]"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
}

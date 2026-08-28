import React from 'react';
import { Home, Search, PlusCircle, Bookmark, Bell } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF] border-t border-[rgba(0,0,0,0.07)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
        {/* Home - Active */}
        <button
          type="button"
          aria-label="Home"
          className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[#C96442]"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* Search - Static */}
        <button
          type="button"
          aria-label="Search"
          className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[#6E6B5F] hover:text-[#1C1B18]"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Search</span>
        </button>

        {/* Post - Static */}
        <button
          type="button"
          aria-label="Post"
          className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[#6E6B5F] hover:text-[#1C1B18]"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Post</span>
        </button>

        {/* My Posts - Static */}
        <button
          type="button"
          aria-label="My posts"
          className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[#6E6B5F] hover:text-[#1C1B18]"
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] font-medium">My posts</span>
        </button>

        {/* Notifications - Static */}
        <button
          type="button"
          aria-label="Notifications"
          className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[#6E6B5F] hover:text-[#1C1B18]"
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-medium">Alerts</span>
        </button>
      </div>
    </nav>
  );
}

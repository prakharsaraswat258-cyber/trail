'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Bookmark, Bell } from 'lucide-react';
import { PostActionSheet } from '@/components/PostActionSheet';

export function BottomNav() {
  const [isPostSheetOpen, setIsPostSheetOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === '/browse';
  const isMyPosts = pathname === '/my-posts' || pathname?.startsWith('/my-posts');

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF] border-t border-[rgba(0,0,0,0.07)] pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
          {/* Home */}
          <Link
            href="/browse"
            aria-label="Home"
            className={`flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 ${
              isHome ? 'text-[#C96442]' : 'text-[#6E6B5F] hover:text-[#1C1B18]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className={`text-[10px] ${isHome ? 'font-semibold' : 'font-medium'}`}>Home</span>
          </Link>

          {/* Search - Static */}
          <button
            type="button"
            aria-label="Search"
            className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[#6E6B5F] hover:text-[#1C1B18]"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Search</span>
          </button>

          {/* Post - Trigger PostActionSheet */}
          <button
            type="button"
            aria-label="Post"
            onClick={() => setIsPostSheetOpen(true)}
            className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[#6E6B5F] hover:text-[#1C1B18]"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Post</span>
          </button>

          {/* My Posts */}
          <Link
            href="/my-posts"
            aria-label="My posts"
            className={`flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 ${
              isMyPosts ? 'text-[#C96442]' : 'text-[#6E6B5F] hover:text-[#1C1B18]'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className={`text-[10px] ${isMyPosts ? 'font-semibold' : 'font-medium'}`}>My posts</span>
          </Link>

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

      {/* Post Action Sheet */}
      <PostActionSheet
        isOpen={isPostSheetOpen}
        onClose={() => setIsPostSheetOpen(false)}
      />
    </>
  );
}


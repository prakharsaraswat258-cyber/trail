'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, UserCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useToast } from '@/components/ui/Toast';

export function Header() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && profileMenuOpen) {
        setProfileMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

  const handleProfileItemClick = (feature: string) => {
    setProfileMenuOpen(false);
    showToast(`${feature} — Coming soon`, {
      message: 'Account profile management will be available in the next release.',
      type: 'info',
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-border transition-shadow duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Left: Penga Wordmark + Dragon Icon */}
        <div className="flex items-center flex-shrink-0">
          <Logo size="md" />
        </div>

        {/* Center/Right: Actions and Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Report Lost CTA (Secondary Button style) */}
          <Link
            href="/lost"
            className="inline-flex items-center justify-center font-semibold text-xs sm:text-sm text-text-primary bg-white border border-border-strong hover:bg-surface-alt active:bg-surface-raised rounded-lg px-3.5 sm:px-5 py-2 sm:py-2.5 min-h-[44px] transition-colors select-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          >
            Report Lost
          </Link>

          {/* Report Found CTA (Primary Button style, Terracotta-filled) */}
          <Link
            href="/found"
            className="inline-flex items-center justify-center font-semibold text-xs sm:text-sm text-white bg-accent hover:bg-accent-hover active:bg-[#9E4622] rounded-lg px-3.5 sm:px-5 py-2 sm:py-2.5 min-h-[44px] transition-colors select-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 shadow-none"
          >
            Report Found
          </Link>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-border mx-0.5 sm:mx-1 hidden xs:block" />

          {/* Notification Bell */}
          <NotificationBell />

          {/* Avatar / Profile Dropdown */}
          <div className="relative inline-block text-left">
            <button
              ref={profileButtonRef}
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center justify-center w-11 h-11 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt active:bg-surface-raised transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="User profile menu"
              aria-expanded={profileMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-surface-alt border border-border-strong flex items-center justify-center text-text-primary font-semibold text-xs">
                <User className="w-4 h-4 text-text-secondary" />
              </div>
            </button>

            {profileMenuOpen && (
              <div
                ref={profileMenuRef}
                role="menu"
                className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-border-strong shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 py-1"
              >
                <button
                  type="button"
                  onClick={() => handleProfileItemClick('Profile')}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm text-text-primary hover:bg-surface-alt text-left font-medium"
                  role="menuitem"
                >
                  <UserCheck className="w-4 h-4 text-text-secondary" />
                  My Reports
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => handleProfileItemClick('Sign Out')}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm text-text-secondary hover:text-error hover:bg-error-light/50 text-left font-medium"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

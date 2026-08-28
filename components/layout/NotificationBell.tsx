'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Sparkles } from 'lucide-react';
import { fetchNotifications, markAllNotificationsRead, NotificationItem } from '@/lib/api/notifications';
import { useToast } from '@/components/ui/Toast';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications.slice(0, 8));
      setUnreadCount(data.unreadCount);
    } catch {
      // Gracefully handle error
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    // Close on Escape
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast('Notifications updated', {
        message: 'All notifications marked as read.',
        type: 'success',
      });
    } catch {
      showToast('Error', {
        message: 'Could not mark notifications as read.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* Bell Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-11 h-11 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt active:bg-surface-raised transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] font-bold rounded-full border-2 border-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-surface-raised border border-border-strong shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-error-light text-error">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="text-xs font-medium text-accent hover:text-accent-hover focus:outline-none focus:underline flex items-center gap-1 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Sparkles className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-60" />
                <p className="text-sm font-medium text-text-primary">No notifications yet</p>
                <p className="text-xs text-text-secondary mt-1">
                  We will alert you when matches are found.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors text-left flex gap-3 ${
                    !item.read ? 'bg-surface-alt' : 'bg-white hover:bg-surface-alt/50'
                  }`}
                >
                  <div className="pt-1 flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        !item.read ? 'bg-accent' : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-5 ${
                        !item.read ? 'text-text-primary font-medium' : 'text-text-secondary'
                      }`}
                    >
                      {item.message}
                    </p>
                    <span className="text-[11px] text-text-muted mt-1 inline-block">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="py-2.5 px-4 bg-surface-alt/60 text-center border-t border-border">
            <span className="text-[11px] text-text-muted">
              Auto-updating Lost & Found match alerts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

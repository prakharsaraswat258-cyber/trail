'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Check, Sparkles, Volume2, VolumeX, ShieldCheck, ChevronRight } from 'lucide-react';
import { fetchNotifications, markAllNotificationsRead, NotificationItem } from '@/lib/api/notifications';
import { useToast } from '@/components/ui/Toast';
import { MatchDossierModal } from '@/components/layout/MatchDossierModal';

/**
 * Synthesizes a two-tone notification chime (~1318.5Hz then ~1760Hz) using Web Audio API.
 * Uses envelope-decayed sine oscillators without external audio assets.
 */
function playNotificationChime() {
  try {
    const AudioContextClass =
      typeof window !== 'undefined'
        ? window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        : null;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: ~1318.51 Hz (E6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Tone 2: ~1760 Hz (A6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.1);
    gain2.gain.setValueAtTime(0.12, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.38);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 500);
  } catch {
    // Silently ignore audio playback errors (e.g. autoplay policies)
  }
}

/**
 * Triggers device haptic vibration if supported.
 */
function triggerVibration() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([180, 80, 180]);
    }
  } catch {
    // Silently ignore vibration errors
  }
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedDossierNotification, setSelectedDossierNotification] = useState<NotificationItem | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevUnreadRef = useRef<number | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const { showToast } = useToast();

  // Load sound setting from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lpufind_sound_enabled');
      if (saved !== null) {
        setSoundEnabled(saved === 'true');
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      localStorage.setItem('lpufind_sound_enabled', String(nextVal));
    } catch {
      // LocalStorage access fallback
    }
  };

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      const newUnread = data.unreadCount;
      const prev = prevUnreadRef.current;

      // Play chime & trigger haptic feedback ONLY when unreadCount increases between polls
      if (prev !== null && newUnread > prev) {
        if (soundEnabledRef.current) {
          playNotificationChime();
        }
        triggerVibration();
      }

      prevUnreadRef.current = newUnread;
      setNotifications(data.notifications.slice(0, 8));
      setUnreadCount(newUnread);
    } catch {
      // Gracefully handle network/API errors
    }
  }, []);

  // Initial load + 10s polling interval
  useEffect(() => {
    loadNotifications();
    const intervalId = setInterval(loadNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [loadNotifications]);

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
      prevUnreadRef.current = 0;
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
    <>
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

              <div className="flex items-center gap-2">
                {/* Sound On/Off Toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-label={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
                  title={soundEnabled ? 'Sound alerts on' : 'Sound alerts muted'}
                  className={`p-1.5 rounded-md transition-colors ${
                    soundEnabled
                      ? 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                      : 'text-text-muted hover:text-text-secondary hover:bg-surface-alt'
                  }`}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-accent" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>

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
                notifications.map((item) => {
                  const hasMatchDetails = Boolean(item.recipientRole || item.matchScore !== undefined);
                  const hasDossier = Boolean(item.partnerName);

                  return (
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
                        {/* Match & Role Badges (rendered only when present) */}
                        {hasMatchDetails && (
                          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                            {item.recipientRole && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F2E8E2] text-[#C96442] border border-[#C96442]/20">
                                {item.recipientRole}
                              </span>
                            )}
                            {item.matchScore !== undefined && (
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                  item.matchScore >= 70
                                    ? 'text-[#047857] bg-emerald-50 border-emerald-200'
                                    : item.matchScore >= 40
                                    ? 'text-[#D97706] bg-amber-50 border-amber-200'
                                    : 'text-[#6B7280] bg-slate-50 border-slate-200'
                                }`}
                              >
                                {item.matchScore}% Match
                              </span>
                            )}
                          </div>
                        )}

                        <p
                          className={`text-xs leading-5 ${
                            !item.read ? 'text-text-primary font-medium' : 'text-text-secondary'
                          }`}
                        >
                          {item.message}
                        </p>

                        {/* Actions / Timestamps */}
                        {hasDossier ? (
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-text-muted">{item.timestamp}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDossierNotification(item);
                                setIsOpen(false);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-border-strong text-text-primary hover:bg-surface-alt active:bg-surface-raised transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                              <span>View Match Dossier</span>
                            </button>
                          </div>
                        ) : item.link ? (
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-text-muted">{item.timestamp}</span>
                            <Link
                              href={item.link}
                              onClick={() => setIsOpen(false)}
                              className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>View details</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        ) : (
                          <span className="text-[11px] text-text-muted mt-1 inline-block">
                            {item.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
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

      {/* Match Dossier Modal */}
      <MatchDossierModal
        notification={selectedDossierNotification}
        isOpen={Boolean(selectedDossierNotification)}
        onClose={() => setSelectedDossierNotification(null)}
      />
    </>
  );
}

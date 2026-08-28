'use client';

import React, { useState } from 'react';
import { BentoCard } from '../ui/BentoCard';
import { updateNotificationPreferences } from '../../lib/api/lostItems';

interface NotificationPreferencesProps {
  ticketId: string;
  initialPreferences?: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

export default function NotificationPreferences({
  ticketId,
  initialPreferences = { email: true, sms: true, inApp: true },
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleToggle = async (key: 'email' | 'sms' | 'inApp') => {
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(updated);
    setIsSaving(true);
    setStatusMessage('Saving changes…');

    try {
      await updateNotificationPreferences(ticketId, updated);
      setStatusMessage('Preferences updated');
      setTimeout(() => {
        setStatusMessage(null);
      }, 2500);
    } catch (err) {
      console.error('Failed to update preferences', err);
      setStatusMessage('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BentoCard className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">
            Notification Preferences
          </h3>
          <p className="text-xs text-text-secondary">
            Manage where we alert you when matching items or updates are found.
          </p>
        </div>
        {statusMessage && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded transition-opacity ${
              statusMessage.includes('Failed')
                ? 'bg-red-50 text-error'
                : 'bg-green-50 text-success'
            }`}
            role="status"
          >
            {statusMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Email Toggle */}
        <div
          onClick={() => !isSaving && handleToggle('email')}
          className="p-4 bg-surface-alt border border-border-strong rounded-lg flex items-center justify-between cursor-pointer hover:bg-surface-raised transition-colors min-h-[52px]"
          role="switch"
          aria-checked={preferences.email}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleToggle('email');
            }
          }}
        >
          <div>
            <span className="text-sm font-semibold text-text-primary block">
              Email Alerts
            </span>
            <span className="text-xs text-text-secondary block">
              Detailed match dossier
            </span>
          </div>
          <div
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              preferences.email ? 'bg-accent' : 'bg-text-muted/40'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                preferences.email ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* SMS Toggle */}
        <div
          onClick={() => !isSaving && handleToggle('sms')}
          className="p-4 bg-surface-alt border border-border-strong rounded-lg flex items-center justify-between cursor-pointer hover:bg-surface-raised transition-colors min-h-[52px]"
          role="switch"
          aria-checked={preferences.sms}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleToggle('sms');
            }
          }}
        >
          <div>
            <span className="text-sm font-semibold text-text-primary block">
              SMS Updates
            </span>
            <span className="text-xs text-text-secondary block">
              Direct text alert
            </span>
          </div>
          <div
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              preferences.sms ? 'bg-accent' : 'bg-text-muted/40'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                preferences.sms ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* In-App Toggle */}
        <div
          onClick={() => !isSaving && handleToggle('inApp')}
          className="p-4 bg-surface-alt border border-border-strong rounded-lg flex items-center justify-between cursor-pointer hover:bg-surface-raised transition-colors min-h-[52px]"
          role="switch"
          aria-checked={preferences.inApp}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleToggle('inApp');
            }
          }}
        >
          <div>
            <span className="text-sm font-semibold text-text-primary block">
              In-App Alerts
            </span>
            <span className="text-xs text-text-secondary block">
              Real-time popup alerts
            </span>
          </div>
          <div
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              preferences.inApp ? 'bg-accent' : 'bg-text-muted/40'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                preferences.inApp ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

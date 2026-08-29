'use client';

import React, { useState } from 'react';
import BentoCard from '../../ui/BentoCard';
import Input from '../../ui/Input';

interface ContactStepProps {
  contact: {
    fullName: string;
    phone: string;
    email: string;
    studentId: string;
  };
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  errors: Record<string, string>;
  onContactChange: (field: string, value: string) => void;
  onNotificationChange: (field: string, value: boolean) => void;
  headingRef: React.RefObject<HTMLHeadingElement>;
  isLoggedIn?: boolean;
}

export default function ContactStep({
  contact,
  notificationPreferences,
  errors,
  onContactChange,
  onNotificationChange,
  headingRef,
  isLoggedIn = false,
}: ContactStepProps) {
  const [isEditingAccountInfo, setIsEditingAccountInfo] = useState(!isLoggedIn);

  return (
    <div className="space-y-6">
      {/* Contact Details Card */}
      <BentoCard className="p-6 sm:p-8 space-y-6">
        <div className="border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-bold text-text-primary tracking-tight outline-none"
            >
              Step 5: Contact Details
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Provide your details so the system and campus staff can notify you immediately when your item is found.
            </p>
          </div>
          {isLoggedIn && !isEditingAccountInfo && (
            <button
              type="button"
              onClick={() => setIsEditingAccountInfo(true)}
              className="text-xs font-semibold text-accent hover:text-accent-hover underline cursor-pointer"
            >
              Edit Details
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            id="lost-fullname"
            label="Full Name *"
            placeholder="e.g. Alex Mercer"
            value={contact.fullName}
            onChange={(e) => onContactChange('fullName', e.target.value)}
            error={errors.fullName}
            disabled={isLoggedIn && !isEditingAccountInfo}
          />

          <Input
            id="lost-phone"
            type="tel"
            label="Phone Number (for SMS Tracking) *"
            placeholder="e.g. +1 (555) 019-2834"
            value={contact.phone}
            onChange={(e) => onContactChange('phone', e.target.value)}
            error={errors.phone}
            helperText="SMS updates alert you as soon as an item is matched."
          />

          <Input
            id="lost-email"
            type="email"
            label="Email Address *"
            placeholder="e.g. alex.mercer@campus.edu"
            value={contact.email}
            onChange={(e) => onContactChange('email', e.target.value)}
            error={errors.email}
            disabled={isLoggedIn && !isEditingAccountInfo}
          />

          <Input
            id="lost-studentid"
            label="Student / User ID *"
            placeholder="e.g. STU-89214 or EMP-4402"
            value={contact.studentId}
            onChange={(e) => onContactChange('studentId', e.target.value)}
            error={errors.studentId}
          />
        </div>
      </BentoCard>

      {/* Notification Preferences Card */}
      <BentoCard className="p-6 sm:p-8 space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="text-base font-bold text-text-primary">
            Notification Preferences
          </h3>
          <p className="text-xs text-text-secondary">
            Select channels where you wish to receive match alerts and status changes (all active by default)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Email Checkbox */}
          <label className="flex items-start gap-3 p-3 bg-surface-alt border border-border-strong rounded-lg cursor-pointer hover:bg-surface-raised transition-colors min-h-[44px]">
            <input
              type="checkbox"
              checked={notificationPreferences.email}
              onChange={(e) => onNotificationChange('email', e.target.checked)}
              className="mt-0.5 w-4 h-4 text-accent border-border-strong rounded focus:ring-accent accent-accent cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-text-primary block">
                Email Alerts
              </span>
              <span className="text-xs text-text-secondary block">
                Instant match dossier sent to inbox
              </span>
            </div>
          </label>

          {/* SMS Checkbox */}
          <label className="flex items-start gap-3 p-3 bg-surface-alt border border-border-strong rounded-lg cursor-pointer hover:bg-surface-raised transition-colors min-h-[44px]">
            <input
              type="checkbox"
              checked={notificationPreferences.sms}
              onChange={(e) => onNotificationChange('sms', e.target.checked)}
              className="mt-0.5 w-4 h-4 text-accent border-border-strong rounded focus:ring-accent accent-accent cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-text-primary block">
                SMS Alerts
              </span>
              <span className="text-xs text-text-secondary block">
                Direct text alert on mobile
              </span>
            </div>
          </label>

          {/* In-app Checkbox */}
          <label className="flex items-start gap-3 p-3 bg-surface-alt border border-border-strong rounded-lg cursor-pointer hover:bg-surface-raised transition-colors min-h-[44px]">
            <input
              type="checkbox"
              checked={notificationPreferences.inApp}
              onChange={(e) => onNotificationChange('inApp', e.target.checked)}
              className="mt-0.5 w-4 h-4 text-accent border-border-strong rounded focus:ring-accent accent-accent cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-text-primary block">
                In-App Alerts
              </span>
              <span className="text-xs text-text-secondary block">
                Popup banner and badge
              </span>
            </div>
          </label>
        </div>
      </BentoCard>
    </div>
  );
}

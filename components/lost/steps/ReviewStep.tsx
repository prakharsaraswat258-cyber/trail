'use client';

import React from 'react';
import { BentoCard } from '../../ui/BentoCard';
import { LostWizardFormData } from '../../../lib/draft/lostWizardDraftStorage';

interface ReviewStepProps {
  formData: LostWizardFormData;
  onJumpToStep: (step: number) => void;
  headingRef: React.RefObject<HTMLHeadingElement>;
}

export default function ReviewStep({
  formData,
  onJumpToStep,
  headingRef,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 bg-surface p-6 rounded-lg border">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-text-primary tracking-tight outline-none"
        >
          Step 6: Review & Submit
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Review your report details carefully. You can edit any section before submitting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Item Identification */}
        <BentoCard className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              1. Item Details
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs font-semibold text-accent hover:text-accent-hover underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Item Name
              </span>
              <p className="font-bold text-text-primary">{formData.itemName}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Category
              </span>
              <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-semibold bg-surface-alt text-text-secondary border border-border">
                {formData.category}
              </span>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Description */}
        <BentoCard className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              2. Description
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs font-semibold text-accent hover:text-accent-hover underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="text-sm">
            <span className="text-xs font-semibold text-text-secondary block mb-1">
              Physical Marks & Details
            </span>
            <p className="text-text-primary whitespace-pre-wrap leading-relaxed text-sm bg-surface-alt p-3 rounded-md border border-border">
              {formData.description}
            </p>
          </div>
        </BentoCard>

        {/* Card 3: Date & Location */}
        <BentoCard className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              3. Date & Location
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="text-xs font-semibold text-accent hover:text-accent-hover underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Date Lost
              </span>
              <p className="font-semibold text-text-primary">{formData.dateLost}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Time Lost
              </span>
              <p className="text-text-primary">
                {formData.isTimeExact && formData.timeLost
                  ? formData.timeLost
                  : formData.timePeriod
                  ? `${formData.timePeriod.charAt(0).toUpperCase() + formData.timePeriod.slice(1)}`
                  : 'Not specified'}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-xs font-semibold text-text-secondary block">
                Location
              </span>
              <p className="font-semibold text-text-primary">
                {formData.building}
                {formData.area ? ` — ${formData.area}` : ''}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Card 4: Photos */}
        <BentoCard className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              4. Photos Attached
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="text-xs font-semibold text-accent hover:text-accent-hover underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          {formData.photos && formData.photos.length > 0 ? (
            <div className="flex items-center gap-3">
              {formData.photos.map((photo, i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-lg overflow-hidden border border-border-strong bg-surface-alt"
                >
                  {/* local blob preview, not optimized by next/image */}
                  <img
                    src={photo}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <span className="text-xs text-text-secondary">
                {formData.photos.length} photo(s) attached
              </span>
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">No photo attached (skipped)</p>
          )}
        </BentoCard>

        {/* Card 5: Contact & Notification Preferences */}
        <BentoCard className="p-5 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              5. Contact & Notification Channels
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className="text-xs font-semibold text-accent hover:text-accent-hover underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Name
              </span>
              <p className="font-semibold text-text-primary">{formData.contact.fullName}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Phone
              </span>
              <p className="text-text-primary">{formData.contact.phone}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Email
              </span>
              <p className="text-text-primary">{formData.contact.email}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                ID
              </span>
              <p className="text-text-primary">{formData.contact.studentId}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-text-secondary">
              Alerts enabled:
            </span>
            {formData.notificationPreferences.email && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-green-50 px-2 py-0.5 rounded border border-success/20">
                ✓ Email
              </span>
            )}
            {formData.notificationPreferences.sms && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-green-50 px-2 py-0.5 rounded border border-success/20">
                ✓ SMS
              </span>
            )}
            {formData.notificationPreferences.inApp && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-green-50 px-2 py-0.5 rounded border border-success/20">
                ✓ In-App
              </span>
            )}
          </div>
        </BentoCard>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import BentoCard from '../../ui/BentoCard';

interface DescriptionStepProps {
  description: string;
  error?: string;
  onChange: (val: string) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}

export default function DescriptionStep({
  description,
  error,
  onChange,
  headingRef,
}: DescriptionStepProps) {
  const charCount = description.trim().length;

  return (
    <BentoCard className="p-6 sm:p-8 space-y-6">
      <div className="border-b border-border pb-4">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-text-primary tracking-tight outline-none"
        >
          Step 2: Detailed Description
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Detailed physical marks, colors, and contents are critical for our matching engine.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="lost-item-description"
              className="text-sm font-semibold text-text-secondary select-none"
            >
              Description & Distinguishing Features *
            </label>
            <span
              className={`text-xs ${
                charCount >= 10 ? 'text-success font-medium' : 'text-text-muted'
              }`}
            >
              {charCount} / min 10 characters
            </span>
          </div>

          <textarea
            id="lost-item-description"
            rows={4}
            placeholder="Brand, color, model, unique stickers, scratches, or contents — the more specific, the faster we can match it."
            value={description}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'description-error' : 'description-helper'}
            className={`w-full p-4 text-sm text-text-primary placeholder:text-text-muted bg-surface border rounded-lg transition-colors focus:outline-none focus:ring-2 resize-y ${
              error
                ? 'border-error focus:border-error focus:ring-error/15'
                : 'border-border-strong focus:border-accent focus:ring-accent/15'
            }`}
          />

          {error ? (
            <p id="description-error" className="text-[13px] text-error mt-0.5">
              {error}
            </p>
          ) : (
            <p id="description-helper" className="text-xs text-text-muted mt-0.5">
              Mention unique traits like engravings, keychain charms, case color, or internal cards.
            </p>
          )}
        </div>
      </div>
    </BentoCard>
  );
}

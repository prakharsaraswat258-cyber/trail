'use client';

import React from 'react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps?: number;
}

const STEP_LABELS = [
  'Item Details',
  'Description',
  'Date & Location',
  'Photo / Reference',
  'Contact Info',
  'Review & Submit',
];

export default function WizardProgress({
  currentStep,
  totalSteps = 6,
}: WizardProgressProps) {
  return (
    <div className="w-full space-y-3" role="navigation" aria-label="Report lost item progress">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-accent uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-text-secondary">
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>

      {/* Segmented bar & Stepper indicators */}
      <div className="grid grid-cols-6 gap-2" role="list">
        {Array.from({ length: totalSteps }, (_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          let stepClasses = 'bg-text-muted/30 text-text-muted border-transparent';
          if (isCompleted) {
            stepClasses = 'bg-accent text-white border-accent';
          } else if (isCurrent) {
            stepClasses = 'bg-surface text-accent border-accent border-2 font-bold ring-2 ring-accent/15';
          }

          return (
            <div
              key={stepNumber}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
              className="flex flex-col items-center gap-1.5"
            >
              {/* Progress bar segment */}
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-accent'
                    : isCurrent
                    ? 'bg-accent'
                    : 'bg-surface-raised'
                }`}
              />

              {/* Number indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors border ${stepClasses}`}
              >
                {isCompleted ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span className="hidden sm:inline text-[11px] text-center line-clamp-1 text-text-secondary">
                {STEP_LABELS[idx]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

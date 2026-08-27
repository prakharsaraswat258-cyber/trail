'use client';

import React from 'react';

export type TicketStage = 'submitted' | 'under_review' | 'potential_match' | 'resolved';

interface StatusTrackerProps {
  currentStatus: TicketStage;
  createdAt: string;
  updatedAt?: string;
}

const STAGES: { id: TicketStage; label: string; description: string }[] = [
  {
    id: 'submitted',
    label: 'Submitted',
    description: 'Report logged in matching registry',
  },
  {
    id: 'under_review',
    label: 'Under Review',
    description: 'Campus desk & security check',
  },
  {
    id: 'potential_match',
    label: 'Potential Match Found',
    description: 'AI detected high-confidence item',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    description: 'Item safely claimed and returned',
  },
];

const STAGE_ORDER: Record<TicketStage, number> = {
  submitted: 0,
  under_review: 1,
  potential_match: 2,
  resolved: 3,
};

export default function StatusTracker({
  currentStatus,
  createdAt,
  updatedAt,
}: StatusTrackerProps) {
  const currentIndex = STAGE_ORDER[currentStatus] ?? 0;
  const isResolved = currentStatus === 'resolved';

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full space-y-6" aria-label="Report status tracker">
      {/* Desktop / Tablet: Horizontal Stepper */}
      <div className="hidden md:flex items-start justify-between relative">
        {/* Background Connecting Line */}
        <div
          className="absolute top-4 left-6 right-6 h-0.5 bg-border-strong -z-0"
          aria-hidden="true"
        >
          <div
            className={`h-full transition-all duration-500 ${
              isResolved ? 'bg-success' : 'bg-accent'
            }`}
            style={{
              width: `${(currentIndex / (STAGES.length - 1)) * 100}%`,
            }}
          />
        </div>

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          let badgeStyles = 'bg-surface border-2 border-text-muted text-text-muted';
          if (isCompleted) {
            badgeStyles = isResolved
              ? 'bg-success border-success text-white'
              : 'bg-accent border-accent text-white';
          } else if (isCurrent) {
            badgeStyles = isResolved
              ? 'bg-success border-success text-white ring-4 ring-success/15 font-bold'
              : 'bg-surface border-accent border-2 text-accent ring-4 ring-accent/15 font-bold';
          }

          return (
            <div
              key={stage.id}
              className="flex flex-col items-center text-center max-w-[160px] z-10 space-y-2"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors shadow-sm ${badgeStyles}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
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
                  <span>{idx + 1}</span>
                )}
              </div>

              <div>
                <p
                  className={`text-xs font-bold ${
                    isCurrent
                      ? isResolved
                        ? 'text-success'
                        : 'text-accent'
                      : isCompleted
                      ? 'text-text-primary'
                      : 'text-text-muted'
                  }`}
                >
                  {stage.label}
                </p>
                <p className="text-[11px] text-text-secondary line-clamp-2 mt-0.5">
                  {stage.description}
                </p>
                {idx === 0 && (
                  <span className="text-[10px] text-text-muted mt-1 block">
                    {formatTimestamp(createdAt)}
                  </span>
                )}
                {isCompleted && idx > 0 && (
                  <span className="text-[10px] text-text-muted mt-1 block">
                    {formatTimestamp(updatedAt)}
                  </span>
                )}
                {isCurrent && idx > 0 && (
                  <span className="text-[10px] text-accent font-medium mt-1 block">
                    In progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical Stepper */}
      <div className="flex md:hidden flex-col space-y-4 pl-2">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          let badgeStyles = 'bg-surface border-2 border-text-muted text-text-muted';
          if (isCompleted) {
            badgeStyles = isResolved
              ? 'bg-success border-success text-white'
              : 'bg-accent border-accent text-white';
          } else if (isCurrent) {
            badgeStyles = isResolved
              ? 'bg-success border-success text-white ring-4 ring-success/15 font-bold'
              : 'bg-surface border-accent border-2 text-accent ring-4 ring-accent/15 font-bold';
          }

          return (
            <div key={stage.id} className="flex items-start gap-3 relative">
              {idx < STAGES.length - 1 && (
                <div
                  className={`absolute top-7 left-3.5 w-0.5 bottom-[-16px] -z-0 ${
                    idx < currentIndex
                      ? isResolved
                        ? 'bg-success'
                        : 'bg-accent'
                      : 'bg-border-strong'
                  }`}
                />
              )}

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 z-10 ${badgeStyles}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="space-y-0.5 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      isCurrent
                        ? isResolved
                          ? 'text-success'
                          : 'text-accent'
                        : isCompleted
                        ? 'text-text-primary'
                        : 'text-text-muted'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded bg-accent-light text-accent">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{stage.description}</p>
                {idx === 0 && (
                  <p className="text-[11px] text-text-muted">
                    {formatTimestamp(createdAt)}
                  </p>
                )}
                {isCompleted && idx > 0 && (
                  <p className="text-[11px] text-text-muted">
                    {formatTimestamp(updatedAt)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

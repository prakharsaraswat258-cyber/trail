'use client';

import React from 'react';

export type MatchConfidenceLevel = 'strong' | 'possible' | 'weak';

export interface MatchBadgeProps {
  confidenceLabel?: MatchConfidenceLevel | string;
  score?: number;
  showScore?: boolean;
  className?: string;
}

export function getConfidenceFromScore(score?: number): MatchConfidenceLevel {
  if (typeof score !== 'number') return 'possible';
  if (score >= 70) return 'strong';
  if (score >= 40) return 'possible';
  return 'weak';
}

const BADGE_CONFIGS: Record<
  MatchConfidenceLevel,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  strong: {
    label: 'Strong Match',
    bgClass: 'bg-[rgba(5,150,105,0.08)] dark:bg-[rgba(5,150,105,0.16)]',
    textClass: 'text-[#047857] dark:text-[#34D399]',
    borderClass: 'border-[rgba(5,150,105,0.2)]',
    dotClass: 'bg-[#059669] dark:bg-[#34D399]',
  },
  possible: {
    label: 'Possible Match',
    bgClass: 'bg-[#FFFBEB] dark:bg-[rgba(217,119,6,0.16)]',
    textClass: 'text-[#D97706] dark:text-[#FBBF24]',
    borderClass: 'border-[rgba(217,119,6,0.2)]',
    dotClass: 'bg-[#D97706]',
  },
  weak: {
    label: 'Weak Match',
    bgClass: 'bg-[#F9FAFB] dark:bg-[rgba(107,114,128,0.16)]',
    textClass: 'text-[#6B7280] dark:text-[#9CA3AF]',
    borderClass: 'border-[rgba(107,114,128,0.2)]',
    dotClass: 'bg-[#6B7280]',
  },
};

export function MatchBadge({
  confidenceLabel,
  score,
  showScore = false,
  className = '',
}: MatchBadgeProps) {
  // Determine normalized level from label or score
  let level: MatchConfidenceLevel = 'possible';
  if (confidenceLabel) {
    const lower = confidenceLabel.toLowerCase().trim();
    if (lower.includes('strong') || lower === 'hot' || lower === 'high') {
      level = 'strong';
    } else if (lower.includes('possible') || lower === 'warm' || lower === 'potential') {
      level = 'possible';
    } else if (lower.includes('weak') || lower === 'cold' || lower === 'low') {
      level = 'weak';
    } else if (typeof score === 'number') {
      level = getConfidenceFromScore(score);
    }
  } else if (typeof score === 'number') {
    level = getConfidenceFromScore(score);
  }

  const config = BADGE_CONFIGS[level];

  const labelText =
    showScore && typeof score === 'number'
      ? `${score}% ${config.label}`
      : config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold tracking-wide border ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
      title={typeof score === 'number' ? `AI match score: ${score}% (${config.label})` : config.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass} shrink-0`} aria-hidden="true" />
      <span>{labelText}</span>
    </span>
  );
}

export default MatchBadge;

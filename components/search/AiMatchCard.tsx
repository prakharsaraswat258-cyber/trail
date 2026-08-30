'use client';

import React from 'react';
import { MapPin, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { EnrichedMatchResult } from '@/lib/matching';

interface AiMatchCardProps {
  match: EnrichedMatchResult;
  onViewDetails?: (match: EnrichedMatchResult) => void;
}

export default function AiMatchCard({ match, onViewDetails }: AiMatchCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-sm hover:shadow-md transition-shadow p-3.5 space-y-2.5 text-left">
      {/* Top row: Name, Category, Confidence */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-sm font-bold text-[#1C1B18] truncate">
            {match.item_name || 'Found Item'}
          </h4>
          {match.category && (
            <span className="inline-block text-[11px] font-medium text-[#6E6B5F] bg-[#FAF8F3] px-2 py-0.5 rounded border border-[rgba(0,0,0,0.06)]">
              {match.category}
            </span>
          )}
        </div>

        <MatchBadge
          score={match.confidence_score}
          confidenceLabel={match.confidence_label}
          showScore={true}
          className="shrink-0"
        />
      </div>

      {/* Date & Location */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6E6B5F]">
        {match.date_found && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#A8A49A] shrink-0" />
            <span>Found {match.date_found}</span>
          </div>
        )}
        {match.location_found && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#A8A49A] shrink-0" />
            <span className="truncate max-w-[200px]" title={match.location_found}>
              {match.location_found}
            </span>
          </div>
        )}
      </div>

      {/* AI Match Reasoning */}
      {match.ai_reasoning && (
        <div className="bg-[#FAF8F3] rounded-lg p-2 flex items-start gap-1.5 border border-[rgba(0,0,0,0.05)] text-xs text-[#4A473F] leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-[#C96442] shrink-0 mt-0.5" />
          <p className="flex-1 italic">{match.ai_reasoning}</p>
        </div>
      )}

      {/* Action footer */}
      {onViewDetails && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => onViewDetails(match)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96442] hover:text-[#A74E31] px-2.5 py-1.5 rounded-lg hover:bg-[#F2E8E2] transition-colors"
          >
            <span>View &amp; Claim</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

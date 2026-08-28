import React from 'react';
import { Sparkles, Clock, Flame } from 'lucide-react';
import { BrowseItem } from './mockData';

interface QuickActionStripProps {
  items: BrowseItem[];
  onSelectUrgentItem: (itemId: string) => void;
  selectedItemId?: string | null;
}

export function QuickActionStrip({
  items,
  onSelectUrgentItem,
  selectedItemId,
}: QuickActionStripProps) {
  // Top 3-5 urgent items: matchConfidence === 'strong' or recent (ends with 'm ago')
  const urgentItems = items
    .filter((item) => item.matchConfidence === 'strong' || item.timeAgo.includes('m ago'))
    .slice(0, 5);

  if (urgentItems.length === 0) return null;

  return (
    <div className="w-full">
      <div className="px-4 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1B18]">
          <Flame className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Urgent Attention</span>
        </div>
        <span className="text-[11px] text-[#A8A49A]">Tap to jump to item</span>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar py-1.5 px-4">
        <div className="flex items-center gap-2 min-w-max">
          {urgentItems.map((item) => {
            const isStrong = item.matchConfidence === 'strong';
            const isSelected = selectedItemId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectUrgentItem(item.id)}
                aria-label={`Jump to ${item.title}`}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all border ${
                  isSelected
                    ? 'bg-[#1C1B18] text-[#FAF8F3] border-[#1C1B18] scale-105 shadow-sm'
                    : isStrong
                    ? 'bg-[#FEF2F2] border-[rgba(220,38,38,0.25)] text-[#DC2626] hover:bg-[#FEE2E2]'
                    : 'bg-[#FFFFFF] border-[rgba(0,0,0,0.07)] text-[#1C1B18] hover:bg-[#F3F1EB]'
                }`}
              >
                {isStrong ? (
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#DC2626]" />
                ) : (
                  <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#6E6B5F]" />
                )}
                <span className="font-semibold max-w-[140px] truncate">
                  {item.title}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isStrong
                      ? 'bg-[#DC2626]/10 text-[#DC2626]'
                      : 'bg-[#F3F1EB] text-[#6E6B5F]'
                  }`}
                >
                  {isStrong ? 'Strong' : item.timeAgo}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export type FilterType = 'all' | 'lost' | 'found';

interface TogglePillsProps {
  selectedType: FilterType;
  onSelectType: (type: FilterType) => void;
}

export function TogglePills({ selectedType, onSelectType }: TogglePillsProps) {
  const options: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'lost', label: 'Lost' },
    { id: 'found', label: 'Found' },
  ];

  return (
    <div className="w-full px-4 py-1.5">
      <div className="flex items-center p-1 bg-[#F3F1EB] rounded-xl border border-[rgba(0,0,0,0.07)]">
        {options.map((opt) => {
          const isActive = selectedType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectType(opt.id)}
              className={`flex-1 min-h-[44px] rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#FFFFFF] text-[#1C1B18] shadow-sm'
                  : 'text-[#6E6B5F] hover:text-[#1C1B18]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

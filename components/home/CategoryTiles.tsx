'use client';

import React, { useRef } from 'react';
import {
  Laptop,
  Briefcase,
  CreditCard,
  Shirt,
  Watch,
  Key,
  Coffee,
  BookOpen,
  Wallet,
  Package,
  Layers,
} from 'lucide-react';
import { ITEM_CATEGORIES, ItemCategory } from '@/lib/constants/itemCategories';

interface CategoryTilesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <Layers className="w-4 h-4" />,
  Electronics: <Laptop className="w-4 h-4" />,
  Bag: <Briefcase className="w-4 h-4" />,
  'ID/Card': <CreditCard className="w-4 h-4" />,
  Clothing: <Shirt className="w-4 h-4" />,
  Jewelry: <Watch className="w-4 h-4" />,
  Keys: <Key className="w-4 h-4" />,
  'Water Bottle': <Coffee className="w-4 h-4" />,
  Notebook: <BookOpen className="w-4 h-4" />,
  Wallet: <Wallet className="w-4 h-4" />,
  Other: <Package className="w-4 h-4" />,
};

export function CategoryTiles({
  selectedCategory,
  onSelectCategory,
}: CategoryTilesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTileClick = (cat: string) => {
    const nextCategory = selectedCategory === cat ? '' : cat;
    onSelectCategory(nextCategory);

    // Smooth scroll the feed into view
    const feedElement = document.getElementById('feed-section');
    if (feedElement) {
      const yOffset = -140; // account for sticky header & filter bar
      const y = feedElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const allCategories = ['All', ...ITEM_CATEGORIES];

  return (
    <div className="w-full max-w-[640px] mx-auto px-4 sm:px-0 pt-2 pb-1">
      <div
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        role="tablist"
        aria-label="Filter by item category"
      >
        {allCategories.map((cat) => {
          const isAll = cat === 'All';
          const isSelected = isAll ? !selectedCategory : selectedCategory === cat;
          const icon = CATEGORY_ICONS[cat] || <Package className="w-4 h-4" />;
          const label = isAll ? 'All Items' : cat;

          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleTileClick(isAll ? '' : cat)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 select-none flex-shrink-0 border focus:outline-none focus:ring-2 focus:ring-accent ${
                isSelected
                  ? 'bg-accent-light text-accent border-accent font-semibold shadow-sm'
                  : 'bg-white text-text-secondary border-border hover:text-text-primary hover:bg-surface-alt hover:border-border-strong'
              }`}
            >
              <span className={isSelected ? 'text-accent' : 'text-text-muted'}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

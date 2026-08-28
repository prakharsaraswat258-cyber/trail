'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { ITEM_CATEGORIES, ItemCategory } from '@/lib/constants/itemCategories';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: 'all' | 'lost' | 'found';
  onTypeFilterChange: (type: 'all' | 'lost' | 'found') => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  onResetFilters: () => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onResetFilters,
}: SearchFilterBarProps) {
  // Local input state for 400ms debounce
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        onSearchChange(localQuery);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, onSearchChange]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || typeFilter !== 'all' || (categoryFilter !== '' && categoryFilter !== 'All');

  return (
    <div className="w-full max-w-[640px] mx-auto px-4 sm:px-0">
      <div className="bg-white border border-border rounded-lg p-3 sm:p-4 shadow-sm space-y-3">
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-text-muted pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search by item name, brand, or description…"
            className="w-full pl-10 pr-10 py-2.5 min-h-[44px] text-sm text-text-primary placeholder-text-muted bg-white border border-border-strong rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
            aria-label="Search lost and found reports"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => {
                setLocalQuery('');
                onSearchChange('');
              }}
              className="absolute right-2.5 p-1 text-text-muted hover:text-text-primary rounded focus:outline-none focus:ring-2 focus:ring-accent min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Type Segmented Control (All / Lost / Found) */}
          <div
            className="inline-flex p-1 bg-surface-alt rounded-lg border border-border min-h-[44px] items-center"
            role="group"
            aria-label="Filter reports by type"
          >
            {(['all', 'lost', 'found'] as const).map((t) => {
              const isActive = typeFilter === t;
              const label = t === 'all' ? 'All' : t === 'lost' ? 'Lost' : 'Found';
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTypeFilterChange(t)}
                  aria-pressed={isActive}
                  className={`px-3 sm:px-4 py-1.5 min-h-[36px] text-xs font-semibold rounded-md transition-colors select-none focus:outline-none focus:ring-2 focus:ring-accent ${
                    isActive
                      ? 'bg-white text-text-primary shadow-sm border border-border'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <div className="relative min-w-[140px] sm:min-w-[160px]">
              <select
                value={categoryFilter || 'All'}
                onChange={(e) => onCategoryFilterChange(e.target.value === 'All' ? '' : e.target.value)}
                className="w-full appearance-none bg-white border border-border-strong text-text-primary text-xs font-medium pl-3 pr-8 py-2 min-h-[44px] rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 cursor-pointer"
                aria-label="Filter reports by category"
              >
                <option value="All">All Categories</option>
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-text-secondary hover:text-accent focus:outline-none focus:underline min-h-[44px]"
                aria-label="Clear all filters"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StatsStrip } from '@/components/home/StatsStrip';
import { SearchFilterBar } from '@/components/home/SearchFilterBar';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { Feed } from '@/components/home/Feed';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('');
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans">
      {/* 1. Global Sticky Header */}
      <Header />

      <main className="flex-1 flex flex-col">
        {/* 2. Stats Strip (Not sticky, scrolls with page) */}
        <StatsStrip />

        {/* 3 & 4. Sticky Filter & Category Navigation Bar */}
        <div className="sticky top-16 sm:top-[72px] z-30 bg-[#FAF8F3] py-2.5 space-y-1.5 border-b border-border transition-all">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            onResetFilters={handleResetFilters}
          />
          <CategoryTiles
            selectedCategory={categoryFilter}
            onSelectCategory={setCategoryFilter}
          />
        </div>

        {/* 5. Unified Lost & Found Feed */}
        <Feed
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          searchQuery={searchQuery}
          onClearFilters={handleResetFilters}
        />
      </main>

      {/* Footer Minimal Attribution */}
      <footer className="w-full py-8 text-center border-t border-border mt-auto bg-white/50">
        <p className="text-xs text-text-muted">
          Penga Lost & Found Network · Fast community matching
        </p>
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { BrowseHeader } from '@/components/browse/BrowseHeader';
import { QuickActionStrip } from '@/components/browse/QuickActionStrip';
import { SearchBar } from '@/components/browse/SearchBar';
import { TogglePills, FilterType } from '@/components/browse/TogglePills';
import { ItemCard } from '@/components/browse/ItemCard';
import { EmptyState } from '@/components/browse/EmptyState';
import { FeedSkeleton } from '@/components/browse/FeedSkeleton';
import { MOCK_ITEMS, BrowseItem } from '@/components/browse/mockData';
import { FloatingActionButton } from '@/components/browse/FloatingActionButton';
import { PostActionSheet } from '@/components/PostActionSheet';
import { BottomNav } from '@/components/browse/BottomNav';
import { CheckCircle2 } from 'lucide-react';

export default function BrowsePage() {
  const [selectedType, setSelectedType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Reset all filters and search
  const handleResetFilters = () => {
    setSelectedType('all');
    setSearchQuery('');
  };

  // Client-side filtering by type and search query
  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter((item) => {
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(query);
        const categoryMatch = item.category.toLowerCase().includes(query);
        const zoneMatch = item.zone.toLowerCase().includes(query);
        if (!titleMatch && !categoryMatch && !zoneMatch) {
          return false;
        }
      }
      return true;
    });
  }, [selectedType, searchQuery]);

  // Handle tapping an urgent item chip -> reset filters if hidden, scroll and highlight
  const handleSelectUrgentItem = (itemId: string) => {
    const targetItem = MOCK_ITEMS.find((it) => it.id === itemId);
    if (!targetItem) return;

    if (selectedType !== 'all' && targetItem.type !== selectedType) {
      setSelectedType('all');
    }
    if (searchQuery.trim() !== '') {
      setSearchQuery('');
    }

    setHighlightedItemId(itemId);

    setTimeout(() => {
      const element = document.getElementById(`item-card-${itemId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);

    setTimeout(() => {
      setHighlightedItemId((current) => (current === itemId ? null : current));
    }, 2200);
  };

  // Double-tap claim action handler
  const handleClaimAction = (item: BrowseItem, isClaimed: boolean) => {
    if (isClaimed) {
      showToast(`Claim initiated for "${item.title.slice(0, 24)}..."`);
    } else {
      showToast(`Removed claim for "${item.title.slice(0, 24)}..."`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1C1B18] flex flex-col font-sans max-w-md mx-auto relative border-x border-[rgba(0,0,0,0.07)]">
      {/* 1. Header Bar */}
      <BrowseHeader />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pb-[calc(env(safe-area-inset-bottom,0px)+84px)]">
        {/* 2. Quick Action Strip (Urgent Items) */}
        <section aria-label="Urgent Quick Actions" className="pt-2">
          <QuickActionStrip
            items={MOCK_ITEMS}
            onSelectUrgentItem={handleSelectUrgentItem}
            selectedItemId={highlightedItemId}
          />
        </section>

        {/* 3. Search Bar */}
        <section aria-label="Search" className="pt-1">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        </section>

        {/* 4. Toggle Pills (Segmented Control) */}
        <section aria-label="Filter by type" className="pt-1">
          <TogglePills
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />
        </section>

        {/* 5. Feed List / Loading Skeleton / Empty State */}
        <section aria-label="Feed Items" className="flex-1 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6B5F]">
              {selectedType === 'all'
                ? 'Recent Activity'
                : selectedType === 'lost'
                ? 'Lost Items'
                : 'Found Items'}
            </span>
            <span className="text-xs text-[#A8A49A]">
              {isLoading
                ? 'Loading...'
                : `${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'items'}`}
            </span>
          </div>

          {isLoading ? (
            <FeedSkeleton count={3} />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              onClearFilters={handleResetFilters}
              searchQuery={searchQuery}
              selectedType={selectedType}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isHighlighted={highlightedItemId === item.id}
                  onClaimAction={handleClaimAction}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-fadeIn pointer-events-none">
          <div className="px-4 py-3 rounded-xl bg-[#1C1B18] text-[#FAF8F3] text-xs font-medium shadow-lg flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 6. Floating Action Button */}
      <FloatingActionButton onClick={() => setIsSheetOpen(true)} />

      {/* Post Action Sheet */}
      <PostActionSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* 7. Bottom Tab Navigation */}
      <BottomNav />
    </div>
  );
}

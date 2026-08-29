'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowseHeader } from '@/components/browse/BrowseHeader';
import { QuickActionStrip } from '@/components/browse/QuickActionStrip';
import { SearchBar } from '@/components/browse/SearchBar';
import { TogglePills, FilterType } from '@/components/browse/TogglePills';
import { ItemCard } from '@/components/browse/ItemCard';
import { EmptyState } from '@/components/browse/EmptyState';
import { FeedSkeleton } from '@/components/browse/FeedSkeleton';
import { MOCK_ITEMS, BrowseItem } from '@/components/browse/mockData';
import { BottomNav } from '@/components/browse/BottomNav';
import { CheckCircle2 } from 'lucide-react';
import ItemDetailDrawer from '@/components/ItemDetailDrawer';
import { createClient } from '@/lib/supabase/client';
import { isValidPhotoUrl } from '@/lib/utils/imageCompression';

function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export default function BrowsePage() {
  const [items, setItems] = useState<BrowseItem[]>(MOCK_ITEMS);
  const [selectedType, setSelectedType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<BrowseItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadLiveItems = useCallback(async () => {
    try {
      const supabase = createClient();
      const [foundRes, lostRes] = await Promise.all([
        supabase
          .from('found_items_public')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('lost_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30),
      ]);

      const liveFound: BrowseItem[] = (foundRes.data || [])
        .filter((row: any) => {
          const photo = Array.isArray(row.photos) && row.photos.length > 0 ? row.photos[0] : null;
          return isValidPhotoUrl(photo);
        })
        .map((row: any) => ({
          id: row.id,
          ticketId: row.reference_code,
          title: row.item_name,
          category: row.category,
          zone: `${row.location_building}${row.location_floor ? ` · ${row.location_floor}` : ''}`,
          timeAgo: formatTimeAgo(row.created_at),
          photoUrl: row.photos[0],
          type: 'found',
          matchConfidence: 'strong',
          status: row.status === 'returned' ? 'resolved' : 'active',
          description: row.description,
        }));

      const liveLost: BrowseItem[] = (lostRes.data || [])
        .filter((row: any) => {
          const photo = Array.isArray(row.photos) && row.photos.length > 0 ? row.photos[0] : null;
          return isValidPhotoUrl(photo);
        })
        .map((row: any) => ({
          id: row.id,
          ticketId: row.ticket_id,
          title: row.item_name,
          category: row.category,
          zone: `${row.location_building}${row.location_area ? ` · ${row.location_area}` : ''}`,
          timeAgo: formatTimeAgo(row.created_at),
          photoUrl: row.photos[0],
          type: 'lost',
          matchConfidence: row.status === 'potential_match' ? 'strong' : null,
          status:
            row.status === 'resolved'
              ? 'resolved'
              : row.status === 'potential_match'
              ? 'claimed'
              : 'active',
          description: row.description,
        }));

      const combinedLive = [...liveFound, ...liveLost];

      if (combinedLive.length > 0) {
        // Merge live items with mock seed items (avoiding duplicates)
        const liveIds = new Set(combinedLive.map((i) => i.id));
        const filteredMocks = MOCK_ITEMS.filter((m) => !liveIds.has(m.id));
        setItems([...combinedLive, ...filteredMocks]);
      } else {
        setItems(MOCK_ITEMS);
      }
    } catch (err) {
      console.warn('Could not load live items from Supabase, using seed data:', err);
      setItems(MOCK_ITEMS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveItems();
  }, [loadLiveItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleResetFilters = () => {
    setSelectedType('all');
    setSearchQuery('');
  };

  // Client-side filtering by type, search query (including Ticket ID / Reference Code)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      // Search filter: matches query against title, ticketId, category, zone, description
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const ticketMatch = item.ticketId
          ? item.ticketId.toLowerCase().includes(query)
          : false;
        const titleMatch = item.title.toLowerCase().includes(query);
        const categoryMatch = item.category.toLowerCase().includes(query);
        const zoneMatch = item.zone.toLowerCase().includes(query);
        const descMatch = item.description
          ? item.description.toLowerCase().includes(query)
          : false;

        if (!ticketMatch && !titleMatch && !categoryMatch && !zoneMatch && !descMatch) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedType, searchQuery]);

  const handleSelectUrgentItem = (itemId: string) => {
    const targetItem = items.find((it) => it.id === itemId);
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
            items={items.slice(0, 6)}
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
                : `${filteredItems.length} ${
                    filteredItems.length === 1 ? 'item' : 'items'
                  }`}
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
                <div
                  key={item.id}
                  onClick={() => setSelectedItemForDetail(item)}
                  className="cursor-pointer rounded-2xl transition-colors hover:bg-[#F3F1EB]"
                >
                  <ItemCard
                    item={item}
                    isHighlighted={highlightedItemId === item.id}
                    onClaimAction={handleClaimAction}
                  />
                </div>
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

      {/* Item Detail Drawer */}
      {selectedItemForDetail && (
        <ItemDetailDrawer
          isOpen={!!selectedItemForDetail}
          item={selectedItemForDetail}
          onClose={() => setSelectedItemForDetail(null)}
        />
      )}

      {/* Bottom Tab Navigation */}
      <BottomNav />
    </div>
  );
}

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FeedPost, fetchFeed } from '@/lib/api/feed';
import { FeedPostCard } from '@/components/home/FeedPostCard';
import { FeedSkeleton } from '@/components/home/FeedSkeleton';
import { Button } from '@/components/ui/Button';
import { BentoCard } from '@/components/ui/BentoCard';
import { AlertCircle, RotateCcw, SearchX, Inbox, Loader2 } from 'lucide-react';

interface FeedProps {
  typeFilter: 'all' | 'lost' | 'found';
  categoryFilter: string;
  searchQuery: string;
  onClearFilters: () => void;
}

export function Feed({
  typeFilter,
  categoryFilter,
  searchQuery,
  onClearFilters,
}: FeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');

  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial / Filter change data loader
  const loadInitialFeed = useCallback(async () => {
    setIsLoadingInitial(true);
    setIsError(false);
    try {
      const data = await fetchFeed({
        type: typeFilter,
        category: categoryFilter,
        q: searchQuery,
        limit: 5,
      });
      setPosts(data.posts);
      setNextCursor(data.nextCursor);
      setAriaAnnouncement(`${data.posts.length} reports loaded`);
    } catch {
      setIsError(true);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [typeFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    loadInitialFeed();
  }, [loadInitialFeed]);

  // Load more via cursor pagination
  const loadMorePosts = useCallback(async () => {
    if (!nextCursor || isLoadingMore || isLoadingInitial) return;

    setIsLoadingMore(true);
    try {
      const data = await fetchFeed({
        type: typeFilter,
        category: categoryFilter,
        q: searchQuery,
        cursor: nextCursor,
        limit: 4,
      });

      setPosts((prev) => [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
      setAriaAnnouncement(`${data.posts.length} more reports loaded`);
    } catch {
      // Don't wipe already loaded posts
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore, isLoadingInitial, typeFilter, categoryFilter, searchQuery]);

  // IntersectionObserver for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoadingMore && !isLoadingInitial) {
          loadMorePosts();
        }
      },
      { threshold: 0.2, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [nextCursor, isLoadingMore, isLoadingInitial, loadMorePosts]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    typeFilter !== 'all' ||
    (categoryFilter !== '' && categoryFilter !== 'All');

  return (
    <section
      id="feed-section"
      className="w-full max-w-[640px] mx-auto px-4 sm:px-0 py-6"
      aria-label="Lost and Found feed"
    >
      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite">
        {ariaAnnouncement}
      </div>

      {/* Initial Loading Skeleton */}
      {isLoadingInitial && <FeedSkeleton />}

      {/* Initial Load Error State */}
      {!isLoadingInitial && isError && posts.length === 0 && (
        <BentoCard className="text-center py-10 px-6 bg-white">
          <div className="w-12 h-12 rounded-full bg-error-light text-error flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">
            Something went wrong loading the feed
          </h3>
          <p className="text-xs text-text-secondary mb-5 max-w-xs mx-auto">
            Unable to connect to reports service. Please try again.
          </p>
          <Button
            variant="secondary"
            onClick={loadInitialFeed}
            className="inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry</span>
          </Button>
        </BentoCard>
      )}

      {/* Empty State: No results for active filters */}
      {!isLoadingInitial && !isError && posts.length === 0 && hasActiveFilters && (
        <BentoCard className="text-center py-12 px-6 bg-white">
          <div className="w-12 h-12 rounded-full bg-surface-alt text-text-secondary flex items-center justify-center mx-auto mb-3">
            <SearchX className="w-6 h-6 text-text-muted" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">
            No matches for these filters
          </h3>
          <p className="text-xs text-text-secondary mb-5 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the category/type filters to see more results.
          </p>
          <Button variant="secondary" onClick={onClearFilters}>
            Clear filters
          </Button>
        </BentoCard>
      )}

      {/* Empty State: No reports at all in system */}
      {!isLoadingInitial && !isError && posts.length === 0 && !hasActiveFilters && (
        <BentoCard className="text-center py-12 px-6 bg-white">
          <div className="w-12 h-12 rounded-full bg-surface-alt text-accent flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">
            No reports yet
          </h3>
          <p className="text-xs text-text-secondary mb-6 max-w-xs mx-auto">
            Be the first to report a lost or found item in your community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/lost"
              className="w-full sm:w-auto inline-flex items-center justify-center font-semibold text-xs sm:text-sm text-text-primary bg-white border border-border-strong hover:bg-surface-alt rounded-lg px-6 py-2.5 min-h-[44px]"
            >
              Report Lost
            </Link>
            <Link
              href="/found"
              className="w-full sm:w-auto inline-flex items-center justify-center font-semibold text-xs sm:text-sm text-white bg-accent hover:bg-accent-hover rounded-lg px-6 py-2.5 min-h-[44px]"
            >
              Report Found
            </Link>
          </div>
        </BentoCard>
      )}

      {/* Feed List */}
      {!isLoadingInitial && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Subsequent Page Error State */}
      {isError && posts.length > 0 && (
        <div className="p-4 mt-4 bg-white border border-error/30 rounded-lg text-center flex items-center justify-between gap-4">
          <p className="text-xs text-error font-medium">Failed to load more reports.</p>
          <Button variant="secondary" size="sm" onClick={loadMorePosts}>
            Retry
          </Button>
        </div>
      )}

      {/* Infinite Scroll Trigger & Inline Loading Indicator */}
      <div ref={observerTarget} className="py-6 flex justify-center items-center min-h-[50px]">
        {isLoadingMore && (
          <div className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary bg-white px-4 py-2 rounded-full border border-border shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span>Loading more reports…</span>
          </div>
        )}
        {!isLoadingMore && !nextCursor && posts.length > 0 && (
          <p className="text-xs text-text-muted text-center">
            You&apos;ve reached the end of recent reports
          </p>
        )}
      </div>
    </section>
  );
}

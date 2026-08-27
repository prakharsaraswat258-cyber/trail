'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchFoundItems, FoundSearchResult } from '../../lib/api/lostItems';
import SearchResultCard from './SearchResultCard';
import Button from '../ui/Button';

interface QuickSearchBarProps {
  onStartReport: () => void;
}

export default function QuickSearchBar({ onStartReport }: QuickSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoundSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus per spec
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setLiveAnnouncement('');
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchFoundItems(trimmed);
        setResults(res.results);
        setHasSearched(true);
        if (res.results.length === 0) {
          setLiveAnnouncement('No matches yet — you can still file a report below.');
        } else {
          setLiveAnnouncement(
            `${res.results.length} possible ${
              res.results.length === 1 ? 'match' : 'matches'
            } found.`
          );
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce per spec

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Header & Reassuring Subline */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Report a Lost Item
        </h1>
        <p className="text-sm text-text-secondary">
          Let&apos;s start by checking if it&apos;s already been found.
        </p>
      </div>

      {/* Large Prominent Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="quick-search-input" className="sr-only">
            Search by item name, brand, or description
          </label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            id="quick-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by item name, brand, or description…"
            className="w-full min-h-[52px] pl-12 pr-12 py-3.5 text-base text-text-primary placeholder:text-text-muted bg-surface border border-border-strong rounded-lg shadow-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-accent">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {/* Screen Reader Announcement */}
        <div aria-live="polite" className="sr-only">
          {liveAnnouncement}
        </div>

        {/* Search Results List */}
        {hasSearched && query.trim() && (
          <div className="space-y-3 pt-2">
            {results.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-xs text-text-secondary px-1">
                  <span>Possible matches already reported found:</span>
                  <span className="font-semibold">{results.length} {results.length === 1 ? 'result' : 'results'}</span>
                </div>
                <div className="space-y-3">
                  {results.map((item) => (
                    <SearchResultCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            ) : (
              <div className="p-6 bg-surface-alt border border-border rounded-lg text-center space-y-1">
                <p className="text-sm font-semibold text-text-primary">
                  No matches yet — you can still file a report below.
                </p>
                <p className="text-xs text-text-secondary">
                  Filing a report will continuously notify you the moment someone turns in an item matching your description.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider and Report CTA */}
      <div className="pt-6 border-t border-border flex flex-col items-center gap-3">
        <p className="text-xs text-text-secondary">
          Don&apos;t see your item in recent found listings?
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={onStartReport}
          className="w-full sm:w-auto text-base px-8 py-3.5 shadow-sm"
        >
          Can&apos;t find it? Report it as lost
        </Button>
      </div>
    </div>
  );
}

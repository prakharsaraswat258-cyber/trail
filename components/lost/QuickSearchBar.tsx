'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchFoundItems, FoundSearchResult } from '../../lib/api/lostItems';
import SearchResultCard from './SearchResultCard';
import Button from '../ui/Button';

interface QuickSearchBarProps {
  onStartReport: () => void;
}

const CATEGORY_CHIPS = [
  { label: 'All Items', value: 'All' },
  { label: '⚡ Chargers', value: 'Laptop Charger' },
  { label: '💻 Laptops', value: 'Laptop' },
  { label: '📱 Phones', value: 'Smartphone' },
  { label: '🎧 Audio', value: 'Headphones' },
  { label: '🎒 Bags', value: 'Bag' },
  { label: '🪪 IDs & Cards', value: 'ID/Card' },
  { label: '💧 Bottles', value: 'Water Bottle' },
  { label: '👛 Wallets', value: 'Wallet' },
];

const COLOR_FILTERS = [
  { label: 'All Colors', value: 'All', dot: '' },
  { label: 'White / Silver', value: 'White', dot: 'bg-slate-100 border border-slate-300' },
  { label: 'Space Gray / Grey', value: 'Space Gray', dot: 'bg-slate-500' },
  { label: 'Black', value: 'Black', dot: 'bg-zinc-900' },
  { label: 'Blue', value: 'Blue', dot: 'bg-blue-600' },
  { label: 'Olive / Green', value: 'Green', dot: 'bg-emerald-600' },
  { label: 'Red', value: 'Red', dot: 'bg-rose-600' },
  { label: 'Brown', value: 'Brown', dot: 'bg-amber-800' },
];

const QUICK_SUGGESTIONS = [
  'MacBook charger white',
  'MagSafe 3 charger',
  'Anker USB-C charger',
  'iPhone 15 Pro',
  'AirPods Pro case',
  'Hydro Flask olive green',
];

export default function QuickSearchBar({ onStartReport }: QuickSearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [results, setResults] = useState<FoundSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback(async (q: string, category: string, color: string) => {
    const trimmed = q.trim();
    setIsSearching(true);
    try {
      const res = await searchFoundItems(trimmed, category, color);
      setResults(res.results);
      setHasSearched(true);
      if (res.results.length === 0) {
        setLiveAnnouncement('No matching found items found yet.');
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, selectedCategory, selectedColor);
    }, 250); // 250ms responsive debounce

    return () => clearTimeout(timer);
  }, [query, selectedCategory, selectedColor, performSearch]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setQuery('');
    setSelectedCategory('All');
    setSelectedColor('All');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-7">
      {/* Header & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-bold uppercase tracking-wider mb-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Campus Item Search
        </div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Search Lost &amp; Found
        </h1>
        <p className="text-sm text-text-secondary max-w-lg mx-auto">
          Instant search for lost items by name, model, colour, or category (e.g. MacBook charger, AirPods, wallet).
        </p>
      </div>

      {/* Main Search Controls */}
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="quick-search-input" className="sr-only">
            Search by item, color, type or brand
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
            placeholder="Search by item, colour, or type (e.g. MacBook charger white, AirPods, ID card)..."
            className="w-full min-h-[52px] pl-12 pr-24 py-3.5 text-base text-text-primary placeholder:text-text-muted bg-surface border border-border-strong rounded-xl shadow-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {isSearching && (
              <div className="p-2 text-accent">
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
        </div>

        {/* Quick Filter Bars: Category / Type & Color */}
        <div className="space-y-2.5 pt-1">
          {/* Category / Type Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
            <span className="text-text-muted font-medium pr-1 text-[11px] uppercase tracking-wider whitespace-nowrap">
              Type:
            </span>
            {CATEGORY_CHIPS.map((chip) => {
              const active = selectedCategory === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setSelectedCategory(chip.value)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Color Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
            <span className="text-text-muted font-medium pr-1 text-[11px] uppercase tracking-wider whitespace-nowrap">
              Colour:
            </span>
            {COLOR_FILTERS.map((col) => {
              const active = selectedColor === col.value;
              return (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setSelectedColor(col.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-text-primary text-surface shadow-sm'
                      : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                  }`}
                >
                  {col.dot && <span className={`w-2.5 h-2.5 rounded-full inline-block ${col.dot}`} />}
                  {col.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-text-secondary">
            <span className="text-text-muted text-[11px]">Popular searches:</span>
            {QUICK_SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                className="px-2.5 py-1 rounded-md bg-surface-alt hover:bg-surface-raised border border-border text-text-secondary hover:text-accent transition-colors cursor-pointer text-xs"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Screen Reader Announcement */}
        <div aria-live="polite" className="sr-only">
          {liveAnnouncement}
        </div>

        {/* Search Results List */}
        {(hasSearched || query.trim() || selectedCategory !== 'All' || selectedColor !== 'All') && (
          <div className="space-y-3 pt-3">
            {results.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-xs text-text-secondary px-1">
                  <span>
                    Found items matching {query ? `"${query}"` : 'selected filters'}
                    {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                    {selectedColor !== 'All' ? ` (${selectedColor})` : ''}:
                  </span>
                  <span className="font-semibold text-text-primary">
                    {results.length} {results.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>
                <div className="space-y-3">
                  {results.map((item) => (
                    <SearchResultCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            ) : (
              <div className="p-6 bg-surface-alt border border-border rounded-xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-text-muted">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  No matching found items found yet.
                </p>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  Try adjusting your search terms or colour/type filters, or file a lost report below so our automated system alerts you the moment it is turned in.
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

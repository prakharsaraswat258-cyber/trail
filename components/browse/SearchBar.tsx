import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch?: () => void;
}

export function SearchBar({ searchQuery, onSearchChange, onClearSearch }: SearchBarProps) {
  return (
    <div className="w-full px-4 py-1.5">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-[#A8A49A] flex items-center">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search lost or found items..."
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#FFFFFF] border border-[rgba(0,0,0,0.07)] text-sm text-[#1C1B18] placeholder-[#A8A49A] focus:outline-none focus:border-[#C96442] focus:ring-1 focus:ring-[#C96442] transition-colors"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => (onClearSearch ? onClearSearch() : onSearchChange(''))}
            aria-label="Clear search"
            className="absolute right-1 w-10 h-10 flex items-center justify-center text-[#A8A49A] hover:text-[#1C1B18] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Bookmark, MapPin, CheckCircle2 } from 'lucide-react';
import { BrowseItem } from './mockData';

interface ItemCardProps {
  item: BrowseItem;
  isHighlighted?: boolean;
  onClaimAction?: (item: BrowseItem, isClaimed: boolean) => void;
}

export function ItemCard({ item, isHighlighted, onClaimAction }: ItemCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isQuickClaimed, setIsQuickClaimed] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [imgSrc, setImgSrc] = useState(item.photoUrl);
  const lastTapRef = useRef<number>(0);

  const triggerClaimToggle = () => {
    const nextState = !isQuickClaimed;
    setIsQuickClaimed(nextState);
    setIsBookmarked(nextState);
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 700);

    if (onClaimAction) {
      onClaimAction(item, nextState);
    }
  };

  // Double tap detection
  const handleCardClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      triggerClaimToggle();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  // Match badge styling according to exact brand specs
  const getMatchBadge = () => {
    if (!item.matchConfidence) return null;

    const config = {
      strong: {
        label: 'Strong Match',
        bg: 'bg-[#FEF2F2]',
        text: 'text-[#DC2626]',
        border: 'border-[rgba(220,38,38,0.2)]',
      },
      possible: {
        label: 'Possible Match',
        bg: 'bg-[#FFFBEB]',
        text: 'text-[#D97706]',
        border: 'border-[rgba(217,119,6,0.2)]',
      },
      weak: {
        label: 'Weak Match',
        bg: 'bg-[#F9FAFB]',
        text: 'text-[#6B7280]',
        border: 'border-[rgba(107,114,128,0.2)]',
      },
    }[item.matchConfidence];

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.label}
      </span>
    );
  };

  // Status pill styling
  const getStatusBadge = () => {
    if (isQuickClaimed) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium border bg-[#ECFDF5] text-[#059669] border-[rgba(5,150,105,0.2)] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Claim Initiated</span>
        </span>
      );
    }

    const config = {
      active: {
        label: 'Active',
        bg: 'bg-[#ECFDF5]',
        text: 'text-[#059669]',
        border: 'border-[rgba(5,150,105,0.2)]',
      },
      claimed: {
        label: 'Claimed',
        bg: 'bg-[#FFFBEB]',
        text: 'text-[#D97706]',
        border: 'border-[rgba(217,119,6,0.2)]',
      },
      resolved: {
        label: 'Resolved',
        bg: 'bg-[#F3F1EB]',
        text: 'text-[#6E6B5F]',
        border: 'border-[rgba(0,0,0,0.07)]',
      },
    }[item.status];

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${config.bg} ${config.text} ${config.border}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <article
      id={`item-card-${item.id}`}
      onClick={handleCardClick}
      className={`w-full bg-[#FFFFFF] rounded-2xl border transition-all duration-300 select-none cursor-pointer overflow-hidden shadow-sm flex flex-col ${
        isHighlighted
          ? 'ring-2 ring-[#C96442] border-[#C96442] shadow-md scale-[1.01]'
          : isQuickClaimed
          ? 'border-[#059669] ring-1 ring-[#059669]'
          : 'border-[rgba(0,0,0,0.07)] hover:border-[rgba(0,0,0,0.15)]'
      }`}
    >
      {/* Photo Container (1:1 aspect ratio on mobile) */}
      <div className="relative w-full aspect-square bg-[#F3F1EB] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc || item.photoUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgSrc('https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80')}
        />

        {/* Double-tap quick visual burst feedback */}
        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-[#059669] scale-110 transition-transform">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Type Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
              item.type === 'lost'
                ? 'bg-[#1C1B18] text-[#FAF8F3]'
                : 'bg-[#C96442] text-white'
            }`}
          >
            {item.type}
          </span>

          {/* Match badge */}
          <div className="flex items-center gap-1.5">{getMatchBadge()}</div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col gap-2">
        {/* Category Pill & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-[#F3F1EB] text-[#6E6B5F] text-[11px] font-medium">
              {item.category}
            </span>
            {item.ticketId && (
              <span className="px-1.5 py-0.5 rounded bg-[#ECEAE2] text-[#1C1B18] text-[10px] font-mono font-bold tracking-tight">
                {item.ticketId}
              </span>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#1C1B18] line-clamp-2 leading-snug">
          {item.title}
        </h3>

        {/* Location & Time Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[rgba(0,0,0,0.04)] text-xs text-[#6E6B5F]">
          <div className="flex items-center gap-1 min-w-0 pr-2">
            <MapPin className="w-3.5 h-3.5 text-[#A8A49A] flex-shrink-0" />
            <span className="truncate">{item.zone}</span>
            <span className="text-[#A8A49A]">·</span>
            <span className="flex-shrink-0 whitespace-nowrap">{item.timeAgo}</span>
          </div>

          {/* Quick-action Bookmark / Claim Icon Button (>= 44x44 touch area) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerClaimToggle();
            }}
            aria-label={`Claim or bookmark ${item.title}`}
            className={`w-11 h-11 -mr-2 -my-2 rounded-full flex items-center justify-center transition-colors ${
              isBookmarked || isQuickClaimed
                ? 'text-[#059669] bg-[#ECFDF5]'
                : 'text-[#6E6B5F] hover:text-[#C96442] hover:bg-[#F3F1EB]'
            }`}
          >
            <Bookmark
              className="w-4 h-4"
              fill={isBookmarked || isQuickClaimed ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

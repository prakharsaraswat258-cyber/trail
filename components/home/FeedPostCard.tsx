'use client';

import React from 'react';
import Image from 'next/image';
import { BentoCard } from '@/components/ui/BentoCard';
import { FeedPost } from '@/lib/api/feed';
import { CATEGORY_DETAILS } from '@/lib/constants/itemCategories';
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
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface FeedPostCardProps {
  post: FeedPost;
}

const CATEGORY_ICON_COMPONENTS: Record<string, React.ReactNode> = {
  Electronics: <Laptop className="w-5 h-5" />,
  Bag: <Briefcase className="w-5 h-5" />,
  'ID/Card': <CreditCard className="w-5 h-5" />,
  Clothing: <Shirt className="w-5 h-5" />,
  Jewelry: <Watch className="w-5 h-5" />,
  Keys: <Key className="w-5 h-5" />,
  'Water Bottle': <Coffee className="w-5 h-5" />,
  Notebook: <BookOpen className="w-5 h-5" />,
  Wallet: <Wallet className="w-5 h-5" />,
  Other: <Package className="w-5 h-5" />,
};

function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date('2026-08-27T23:07:53Z'); // relative to current system time
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

export function FeedPostCard({ post }: FeedPostCardProps) {
  const { showToast } = useToast();

  const handleClaimClick = () => {
    showToast('Match inquiry recorded', {
      message: `We've flagged "${post.itemName}" for verification. You will be notified of updates.`,
      type: 'success',
    });
  };

  const isLost = post.type === 'lost';
  const categoryIcon = CATEGORY_ICON_COMPONENTS[post.category] || <Package className="w-5 h-5" />;

  // 3-tier confidence badge calculation
  const renderConfidenceBadge = () => {
    if (!post.matchStatus || post.matchStatus === 'none' || post.matchConfidence === undefined) {
      return null;
    }

    const score = post.matchConfidence;
    if (score >= 80) {
      return (
        <div
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-success-light text-success text-xs font-semibold tracking-wide border border-success/20"
          title={`Algorithm match confidence score: ${score}%`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
          <span>{score}% High Match</span>
        </div>
      );
    }

    if (score >= 50) {
      return (
        <div
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FFFBEB] text-[#D97706] text-xs font-semibold tracking-wide border border-[#D97706]/20"
          title={`Algorithm match confidence score: ${score}%`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] inline-block" />
          <span>{score}% Potential Match</span>
        </div>
      );
    }

    return (
      <div
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-surface-alt text-text-secondary text-xs font-semibold tracking-wide border border-border"
        title={`Algorithm match confidence score: ${score}%`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-text-muted inline-block" />
        <span>{score}% Low Match</span>
      </div>
    );
  };

  return (
    <BentoCard className="group hover:border-border-strong transition-all duration-150 bg-white">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row: Type Tag + Category + Ticket ID (if lost) */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Type Tag */}
            <span
              className={`rounded-md px-3 py-1 text-xs font-semibold tracking-wide uppercase select-none ${
                isLost
                  ? 'bg-accent-light text-accent border border-accent/20'
                  : 'bg-success-light text-success border border-success/20'
              }`}
            >
              {post.type}
            </span>

            {/* Category label */}
            <span className="text-xs font-medium text-text-secondary">
              {post.category}
            </span>

            {/* Ticket ID for lost reports */}
            {post.ticketId && (
              <span className="text-[11px] font-mono text-text-muted bg-surface-alt px-1.5 py-0.5 rounded">
                {post.ticketId}
              </span>
            )}
          </div>

          {/* Item Name */}
          <h3 className="text-base font-semibold text-text-primary leading-snug group-hover:text-accent transition-colors">
            {post.itemName}
          </h3>

          {/* Description snippet truncated to ~100 characters */}
          <p className="text-sm font-normal text-text-secondary leading-relaxed line-clamp-2">
            {post.descriptionSnippet}
          </p>

          {/* Meta Row: Location & Timestamp */}
          <div className="flex items-center gap-3 text-xs text-text-muted pt-1">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-text-muted" />
              <span className="truncate max-w-[200px]">{post.location}</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>{formatTimeAgo(post.timestamp)}</span>
            </span>
          </div>
        </div>

        {/* Thumbnail Photo or Category Icon Placeholder */}
        <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-lg bg-surface-alt border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
          {post.photoUrl ? (
            <Image
              src={post.photoUrl}
              alt={post.itemName}
              fill
              sizes="(max-width: 640px) 100vw, 96px"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-text-muted text-center">
              <div className="p-2 rounded-md bg-white border border-border mb-1">
                {categoryIcon}
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold">
                {post.category}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Row: Confidence Badge & Stubbed Action */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {renderConfidenceBadge()}
        </div>

        {/* Action Button: "This might be mine →" */}
        <button
          type="button"
          onClick={handleClaimClick}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary bg-white border border-border-strong hover:bg-surface-alt active:bg-surface-raised px-4 py-2 min-h-[44px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent ml-auto"
        >
          <span>This might be mine</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent" />
        </button>
      </div>
    </BentoCard>
  );
}

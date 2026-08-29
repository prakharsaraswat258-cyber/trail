'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Bookmark, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ClaimModal from './ClaimModal';

/**
 * ItemDetailDrawer
 * Shared drawer/modal for displaying full item details and triggering claim flow.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the drawer is open
 * @param {Object} props.item - The item to display
 * @param {Function} props.onClose - Closes the drawer
 * @param {Function} [props.onBookmarkToggle] - Optional callback when bookmark is toggled
 */
export default function ItemDetailDrawer({
  isOpen,
  item,
  onClose,
  onBookmarkToggle,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchCurrentY, setTouchCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const drawerRef = useRef(null);
  const triggerElementRef = useRef(null);

  const handleOpenClaimModal = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const redirectUrl = pathname || '/browse';
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    setIsClaimModalOpen(true);
  };

  // Store trigger element on open for accessible focus restore
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement;
      setIsClaimModalOpen(false);
    } else if (triggerElementRef.current) {
      triggerElementRef.current.focus?.();
    }
  }, [isOpen]);

  // Handle escape key and focus trapping when claim modal is not open
  useEffect(() => {
    if (!isOpen || isClaimModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClaimModalOpen, onClose]);

  if (!isOpen || !item) return null;

  // Touch gesture handlers for mobile bottom sheet
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    if (currentY > touchStartY) {
      setTouchCurrentY(currentY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (touchCurrentY - touchStartY > 90) {
      onClose?.();
    }
    setTouchStartY(0);
    setTouchCurrentY(0);
  };

  const dragOffset =
    isDragging && touchCurrentY > touchStartY ? touchCurrentY - touchStartY : 0;

  const handleToggleBookmark = (e) => {
    e.stopPropagation();
    const next = !isBookmarked;
    setIsBookmarked(next);
    onBookmarkToggle?.(item, next);
  };

  // Match badge styling
  const renderMatchBadge = () => {
    if (!item.matchConfidence) return null;

    const config = {
      strong: {
        label: 'Strong Match',
        bg: 'bg-[#F2E8E2]',
        text: 'text-[#C96442]',
        border: 'border-[rgba(201,100,66,0.2)]',
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
    }[item.matchConfidence] || {
      label: `${item.matchConfidence} Match`,
      bg: 'bg-[#F3F1EB]',
      text: 'text-[#6E6B5F]',
      border: 'border-[rgba(0,0,0,0.07)]',
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.label}
      </span>
    );
  };

  // Extract non-empty attribute items for the 2-column key/value grid
  const attributes = [];
  if (item.ticketId) attributes.push({ label: 'Ticket / Ref ID', value: item.ticketId });
  if (item.color) attributes.push({ label: 'Color', value: item.color });
  if (item.brand) attributes.push({ label: 'Brand', value: item.brand });
  if (item.size) attributes.push({ label: 'Size', value: item.size });
  if (item.condition) attributes.push({ label: 'Condition', value: item.condition });
  if (item.serialNumber) attributes.push({ label: 'Serial / ID', value: item.serialNumber });
  if (item.status) {
    attributes.push({
      label: 'Status',
      value: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    });
  }

  const descriptionText =
    item.description ||
    `This ${item.category?.toLowerCase() || 'item'} was reported as ${
      item.type === 'found' ? 'found' : 'lost'
    } near ${item.zone || 'campus'}. If this belongs to you, please provide identifying details when submitting your claim.`;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-detail-title"
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center font-sans"
      >
        {/* Solid overlay backdrop - no blur */}
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer / Modal Surface */}
        <div
          ref={drawerRef}
          style={dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined}
          className="relative w-full max-h-[90vh] md:max-h-[85vh] md:max-w-[560px] bg-[#FFFFFF] rounded-t-[16px] md:rounded-lg shadow-xl z-10 overflow-hidden flex flex-col transition-transform duration-150"
        >
          {/* Mobile Drag Handle Bar */}
          <div
            className="md:hidden pt-3 pb-1 cursor-grab active:cursor-grabbing flex justify-center shrink-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 rounded-full bg-[#A8A49A]" />
          </div>

          {/* Top Actions: Close & Bookmark */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleBookmark}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark item'}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[rgba(0,0,0,0.07)] bg-[#FFFFFF] flex items-center justify-center transition-colors shadow-sm ${
                isBookmarked
                  ? 'text-[#C96442]'
                  : 'text-[#A8A49A] hover:text-[#C96442] hover:bg-[#F3F1EB]'
              }`}
            >
              <Bookmark
                className="w-4 h-4"
                fill={isBookmarked ? 'currentColor' : 'none'}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[rgba(0,0,0,0.07)] bg-[#FFFFFF] text-[#1C1B18] hover:bg-[#F3F1EB] flex items-center justify-center transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {/* Item Image */}
            <div className="relative w-full aspect-[4/3] bg-[#F3F1EB] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.photoUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Badge Row Overlaid on Image */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2 pointer-events-none pr-28">
                {/* Status / Type Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white shadow-sm ${
                    item.type === 'lost' ? 'bg-[#1C1B18]' : 'bg-[#C96442]'
                  }`}
                >
                  {item.type}
                </span>

                {/* MatchBadge */}
                {renderMatchBadge()}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 md:p-6 space-y-4">
              {/* Category Tag */}
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-[#F3F1EB] text-[#6E6B5F] text-xs font-medium">
                  {item.category}
                </span>
              </div>

              {/* Title */}
              <h2
                id="item-detail-title"
                className="text-[24px] font-bold text-[#1C1B18] leading-tight"
              >
                {item.title}
              </h2>

              {/* Meta Row: location icon + location name · floor/area · relative timestamp */}
              <div className="flex items-center gap-1.5 text-[13px] text-[#A8A49A] flex-wrap">
                <MapPin className="w-4 h-4 text-[#A8A49A] shrink-0" />
                <span className="text-[#6E6B5F] font-medium">{item.zone}</span>
                {item.floor && (
                  <>
                    <span>·</span>
                    <span className="text-[#6E6B5F]">{item.floor}</span>
                  </>
                )}
                {item.timeAgo && (
                  <>
                    <span>·</span>
                    <span>{item.timeAgo}</span>
                  </>
                )}
              </div>

              {/* Description Section */}
              <div className="pt-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1B18] mb-1.5">
                  Description
                </h4>
                <p className="text-[14px] text-[#6E6B5F] leading-relaxed">
                  {descriptionText}
                </p>
              </div>

              {/* Item Attributes 2-Column Key/Value Grid */}
              {attributes.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1B18] mb-2">
                    Item Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 bg-[#FAF8F3] p-3.5 rounded-lg border border-[rgba(0,0,0,0.07)]">
                    {attributes.map((attr) => (
                      <div key={attr.label} className="min-w-0">
                        <span className="block text-[11px] font-medium text-[#A8A49A] uppercase tracking-wide">
                          {attr.label}
                        </span>
                        <span className="block text-[13px] font-semibold text-[#1C1B18] truncate mt-0.5">
                          {attr.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <hr className="border-[rgba(0,0,0,0.07)] my-4" />

              {/* Claim Action Button */}
              <div className="pt-1 pb-2">
                <button
                  type="button"
                  onClick={handleOpenClaimModal}
                  className="w-full min-h-[44px] px-6 py-3 rounded-lg bg-[#C96442] hover:bg-[#B5572E] active:bg-[#9E4622] text-[#FFFFFF] text-sm font-semibold transition-colors flex items-center justify-center shadow-none"
                >
                  Claim This Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        item={item}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccessClose={() => {
          setIsClaimModalOpen(false);
          onClose?.();
        }}
      />
    </>
  );
}

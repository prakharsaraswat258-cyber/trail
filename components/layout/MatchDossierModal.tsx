// NOTE: contact/handoff data is currently sourced from the notification row itself. Real-time coordination (live status, confirmation) is not backend-wired yet — this is presentation-layer only.

'use client';

import React, { useEffect, useState } from 'react';
import { X, MapPin, Phone, User, KeyRound, Copy, Check, ShieldCheck, Tag } from 'lucide-react';
import { NotificationItem } from '@/lib/api/notifications';

interface MatchDossierModalProps {
  notification: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchDossierModal({ notification, isOpen, onClose }: MatchDossierModalProps) {
  const [copiedHandoff, setCopiedHandoff] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !notification) {
    return null;
  }

  const handoffCode = `LPU-${notification.ticketId?.split('-').pop() ?? 'XXXX'}-RET`;
  const itemName = notification.itemName || 'Reported Campus Item';
  const role = notification.recipientRole || 'OWNER';
  const isOwner = role === 'OWNER';
  const partnerRoleLabel = isOwner ? 'Finder' : 'Owner';
  const partnerName = notification.partnerName || 'Campus Community Member';
  const partnerContact = notification.partnerContact || 'Contact via University Helpdesk';
  const location = notification.location || 'Campus Lost & Found Desk';
  const matchScore = notification.matchScore;

  const handleCopyHandoff = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(handoffCode).catch(() => {});
      setCopiedHandoff(true);
      setTimeout(() => setCopiedHandoff(false), 2000);
    }
  };

  const handleCopyContact = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(partnerContact).catch(() => {});
      setCopiedContact(true);
      setTimeout(() => setCopiedContact(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-dossier-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-black/14 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/7 bg-[#FAF8F3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F2E8E2] text-[#C96442] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="match-dossier-title" className="text-base font-bold text-[#1C1B18]">
                Match Dossier
              </h2>
              <p className="text-[11px] text-[#6E6B5F]">Secure Campus Handoff Verification</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close match dossier modal"
            className="flex items-center justify-center w-11 h-11 rounded-lg text-[#6E6B5F] hover:text-[#1C1B18] hover:bg-[#ECEAE2] active:bg-[#F3F1EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C96442]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Item & Match Header Card */}
          <div className="p-4 rounded-xl bg-[#F3F1EB] border border-black/7 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#C96442]" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6E6B5F]">
                  Item Details
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {matchScore !== undefined && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      matchScore >= 70
                        ? 'text-[#047857] bg-emerald-50 border-emerald-200'
                        : matchScore >= 40
                        ? 'text-[#D97706] bg-amber-50 border-amber-200'
                        : 'text-[#6B7280] bg-slate-50 border-slate-200'
                    }`}
                  >
                    {matchScore}% Match
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F2E8E2] text-[#C96442] border border-[#C96442]/20">
                  {role}
                </span>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-[#1C1B18] leading-snug">{itemName}</h3>
            {notification.message && (
              <p className="text-xs text-[#6E6B5F] leading-relaxed">{notification.message}</p>
            )}
          </div>

          {/* Secure Handoff Pass Code */}
          <div className="p-4 rounded-xl bg-[#FAF8F3] border-2 border-dashed border-[#C96442]/30 space-y-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#6E6B5F]">
              <KeyRound className="w-3.5 h-3.5 text-[#C96442]" />
              <span>Handoff Verification Pass Code</span>
            </div>

            <div className="font-mono text-xl font-extrabold text-[#C96442] tracking-wider select-all py-1">
              {handoffCode}
            </div>

            <p className="text-[11px] text-[#6E6B5F]">
              Share this one-time code only when meeting in person at the designated location.
            </p>

            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={handleCopyHandoff}
                className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] rounded-lg text-xs font-semibold bg-white border border-black/14 text-[#1C1B18] hover:bg-[#F3F1EB] active:bg-[#ECEAE2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C96442]"
              >
                {copiedHandoff ? (
                  <>
                    <Check className="w-4 h-4 text-[#059669]" />
                    <span className="text-[#059669]">Copied Code</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#6E6B5F]" />
                    <span>Copy Pass Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Coordination Details */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6B5F]">
              Coordination Contacts
            </h4>

            {/* Partner Info */}
            <div className="p-3.5 rounded-xl bg-white border border-black/7 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#F3F1EB] flex items-center justify-center flex-shrink-0 text-[#6E6B5F]">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6B5F]">
                    {partnerRoleLabel}
                  </span>
                  <p className="text-sm font-bold text-[#1C1B18] truncate">{partnerName}</p>
                  <div className="flex items-center gap-1 text-xs text-[#6E6B5F] mt-0.5">
                    <Phone className="w-3 h-3 text-[#A8A49A]" />
                    <span className="truncate">{partnerContact}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyContact}
                aria-label={`Copy contact for ${partnerName}`}
                className="flex items-center justify-center w-11 h-11 rounded-lg text-[#6E6B5F] hover:text-[#1C1B18] hover:bg-[#F3F1EB] transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#C96442]"
              >
                {copiedContact ? (
                  <Check className="w-4 h-4 text-[#059669]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Meeting Location */}
            <div className="p-3.5 rounded-xl bg-white border border-black/7 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F3F1EB] flex items-center justify-center flex-shrink-0 text-[#C96442]">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6B5F]">
                  Designated Handoff Spot
                </span>
                <p className="text-xs font-semibold text-[#1C1B18] truncate">{location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-black/7 bg-[#FAF8F3] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 min-h-[44px] rounded-lg text-xs font-bold text-white bg-[#C96442] hover:bg-[#B5572E] active:bg-[#9E4622] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C96442]"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

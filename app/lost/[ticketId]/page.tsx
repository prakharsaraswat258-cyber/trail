'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BentoCard from '../../../components/ui/BentoCard';
import StatusTracker from '../../../components/lost/StatusTracker';
import NotificationPreferences from '../../../components/lost/NotificationPreferences';
import Button from '../../../components/ui/Button';
import { getTicketStatus, TicketStatusResponse } from '../../../lib/api/lostItems';

export default function TicketTrackingPage() {
  const params = useParams();
  const ticketIdParam = params?.ticketId as string;

  const [ticketData, setTicketData] = useState<TicketStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      if (!ticketIdParam) return;
      setIsLoading(true);
      try {
        const data = await getTicketStatus(ticketIdParam);
        setTicketData(data);
      } catch (err) {
        console.error('Failed to load ticket status', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTicket();
  }, [ticketIdParam]);

  const handleCopyTicketId = () => {
    if (!ticketData?.ticketId) return;
    navigator.clipboard.writeText(ticketData.ticketId);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-text-secondary">
            Loading your report tracking dossier…
          </p>
        </div>
      </main>
    );
  }

  if (!ticketData) {
    return (
      <main className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold text-text-primary">Ticket Not Found</h1>
          <p className="text-sm text-text-secondary">
            We couldn&apos;t find an active report with ID &ldquo;{ticketIdParam}&rdquo;.
          </p>
          <Link href="/lost">
            <Button variant="primary">File a New Report</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Confirmation */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-success mb-1 border border-success/20 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Report Submitted
          </h1>
          <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
            We&apos;ve sent a confirmation to your email/phone with tracking instructions. We&apos;ll notify you the moment we find a potential match.
          </p>
        </div>

        {/* Copyable Ticket ID Bento Card */}
        <BentoCard className="p-5 sm:p-6 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Lost Report Ticket ID
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-text-primary tracking-tight block">
              {ticketData.ticketId}
            </span>
            <span className="text-xs text-text-muted">
              Save this reference ID to track your report status anytime
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleCopyTicketId}
            className="flex items-center gap-2 text-xs sm:text-sm py-2.5 px-4 self-start sm:self-auto"
            aria-label="Copy ticket ID"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-success font-bold">Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                <span>Copy ID</span>
              </>
            )}
          </Button>
        </BentoCard>

        {/* Live Status Tracker Bento Card */}
        <BentoCard className="p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Live Status Tracker
              </h2>
              <p className="text-xs text-text-secondary">
                Real-time lifecycle of your reported lost item
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-accent-light text-accent border border-accent/20">
              Live Monitoring
            </span>
          </div>

          <StatusTracker
            currentStatus={ticketData.status}
            createdAt={ticketData.createdAt}
            updatedAt={ticketData.updatedAt}
          />
        </BentoCard>

        {/* Submitted Item Summary Card */}
        <BentoCard className="p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-bold text-text-primary">
              Report Summary
            </h2>
            <p className="text-xs text-text-secondary">
              Information registered in the campus lost-and-found system
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Item Name
              </span>
              <p className="font-bold text-text-primary">{ticketData.summary.itemName}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Category
              </span>
              <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-semibold bg-surface-alt text-text-secondary border border-border">
                {ticketData.summary.category}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Date Lost
              </span>
              <p className="text-text-primary font-medium">{ticketData.summary.dateLost}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-text-secondary block">
                Last Known Location
              </span>
              <p className="text-text-primary font-medium">{ticketData.summary.location}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-border text-sm">
            <span className="text-xs font-semibold text-text-secondary block mb-1">
              Description & Distinguishing Traits
            </span>
            <p className="text-text-primary text-sm bg-surface-alt p-3 rounded-lg border border-border leading-relaxed">
              {ticketData.summary.description}
            </p>
          </div>
        </BentoCard>

        {/* Editable Notification Preferences */}
        <NotificationPreferences
          ticketId={ticketData.ticketId}
          initialPreferences={ticketData.notificationPreferences}
        />

        {/* Quick Links */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
          <Link href="/lost">
            <Button variant="secondary" className="w-full sm:w-auto">
              ← Report Another Item
            </Button>
          </Link>
          <Link href="/lost">
            <Button variant="ghost" className="w-full sm:w-auto text-text-secondary">
              Back to Quick Search →
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

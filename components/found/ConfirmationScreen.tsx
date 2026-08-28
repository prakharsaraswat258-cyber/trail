import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, Sparkles, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { FoundItemResponse, FoundItemPayload } from "@/lib/types/foundItem";
import { BentoCard } from "@/components/ui/BentoCard";
import { Button } from "@/components/ui/Button";
import { KarmaBadge } from "./KarmaBadge";

interface ConfirmationScreenProps {
  response: FoundItemResponse;
  payload: FoundItemPayload;
  onReset: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  response,
  payload,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(response.referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto space-y-5 animate-fadeIn">
      {/* Immediate Match Banner (If matching engine scored a high similarity loss report) */}
      {response.immediateMatchFound && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-success/30 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-success">
              🎉 Good news — this already matches a lost report!
            </h2>
            <p className="text-xs text-text-secondary">
              The potential owner has been automatically notified and is reviewing the report details.
            </p>
          </div>
        </div>
      )}

      {/* Main Confirmation Bento Card */}
      <BentoCard className="text-center py-8 px-6 space-y-6">
        {/* Karma Badge Header */}
        <div className="flex justify-center">
          <KarmaBadge label="Campus Hero" points={10} />
        </div>

        {/* Friendly Hero Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Thank you! 🎉
          </h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Your report is live and we&apos;re already checking it against lost items on campus.
          </p>
        </div>

        {/* Reference ID Card (Monospace, Tap to copy) */}
        <div className="max-w-xs mx-auto">
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Report Reference Code
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            aria-label="Copy report reference code"
            className="w-full flex items-center justify-between gap-2 p-3 bg-surface-alt hover:bg-surface-raised border border-border-strong rounded-lg transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="font-mono text-base font-bold text-text-primary tracking-widest pl-1">
              {response.referenceCode}
            </span>
            <div className="flex items-center gap-1 text-xs text-accent font-semibold">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Privacy reflection note */}
        {payload.hideDetails && (
          <div className="inline-flex items-center gap-2 p-3 rounded-md bg-accent-light/40 border border-accent/20 text-xs text-text-primary max-w-md text-left">
            <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
            <span>Sensitive details are hidden — only a verified match will see them.</span>
          </div>
        )}

        {/* Summary Details Snapshot */}
        <div className="p-4 rounded-lg bg-surface-alt border border-border text-left grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-text-muted block">Item</span>
            <span className="font-semibold text-text-primary truncate block">{payload.itemName}</span>
          </div>
          <div>
            <span className="text-text-muted block">Category</span>
            <span className="font-semibold text-text-primary">{payload.category}</span>
          </div>
          <div>
            <span className="text-text-muted block">Found at</span>
            <span className="font-semibold text-text-primary truncate block">{payload.location.building}</span>
          </div>
          <div>
            <span className="text-text-muted block">Status</span>
            <span className="font-semibold text-text-primary">
              {payload.status === "with_finder" ? "With Finder" : "Handed Over"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Link href={`/found/${response.id}`} className="block w-full">
            <Button variant="secondary" fullWidth className="gap-2">
              <span>View / Edit My Report</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <div>
            <button
              type="button"
              onClick={onReset}
              className="text-sm font-semibold text-text-secondary hover:text-accent underline transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent py-2 px-4"
            >
              Report Another Item
            </button>
          </div>
        </div>
      </BentoCard>
    </div>
  );
};

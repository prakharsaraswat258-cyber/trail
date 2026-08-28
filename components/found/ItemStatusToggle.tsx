import React from "react";
import { Shield, ShieldAlert, CheckCircle2, Building } from "lucide-react";
import { DROPOFF_DESKS } from "@/lib/constants/dropoffDesks";

interface ItemStatusToggleProps {
  status: "with_finder" | "handed_over";
  handoffDesk?: string;
  handoffDeskOther?: string;
  hideDetails: boolean;
  onStatusChange: (status: "with_finder" | "handed_over") => void;
  onHandoffDeskChange: (desk: string) => void;
  onHandoffDeskOtherChange: (other: string) => void;
  onHideDetailsChange: (hide: boolean) => void;
  handoffError?: string;
}

export const ItemStatusToggle: React.FC<ItemStatusToggleProps> = ({
  status,
  handoffDesk = "",
  handoffDeskOther = "",
  hideDetails,
  onStatusChange,
  onHandoffDeskChange,
  onHandoffDeskOtherChange,
  onHideDetailsChange,
  handoffError,
}) => {
  return (
    <div className="w-full space-y-5" id="status-section">
      {/* Status Radio Group */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-text-primary">
          Current Item Status <span className="text-accent">*</span>
        </label>

        <div
          role="radiogroup"
          aria-label="Current Item Possession Status"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {/* Option 1: With Finder */}
          <button
            type="button"
            role="radio"
            aria-checked={status === "with_finder"}
            onClick={() => onStatusChange("with_finder")}
            className={`min-h-[52px] p-3.5 rounded-lg border text-left flex items-center justify-between transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              status === "with_finder"
                ? "bg-accent-light border-accent text-text-primary shadow-sm"
                : "bg-surface border-border-strong text-text-secondary hover:bg-surface-alt"
            }`}
          >
            <div>
              <div className="text-sm font-semibold text-text-primary">I still have it</div>
              <div className="text-xs text-text-secondary">Keep until owner is matched</div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                status === "with_finder"
                  ? "border-accent bg-accent text-white"
                  : "border-border-strong bg-surface"
              }`}
            >
              {status === "with_finder" && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </button>

          {/* Option 2: Handed Over */}
          <button
            type="button"
            role="radio"
            aria-checked={status === "handed_over"}
            onClick={() => onStatusChange("handed_over")}
            className={`min-h-[52px] p-3.5 rounded-lg border text-left flex items-center justify-between transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              status === "handed_over"
                ? "bg-accent-light border-accent text-text-primary shadow-sm"
                : "bg-surface border-border-strong text-text-secondary hover:bg-surface-alt"
            }`}
          >
            <div>
              <div className="text-sm font-semibold text-text-primary">I handed it over</div>
              <div className="text-xs text-text-secondary">Turned into a campus desk</div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                status === "handed_over"
                  ? "border-accent bg-accent text-white"
                  : "border-border-strong bg-surface"
              }`}
            >
              {status === "handed_over" && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </button>
        </div>
      </div>

      {/* Conditional Drop-off Location Field */}
      {status === "handed_over" && (
        <div className="p-4 rounded-lg bg-surface-alt border border-border-strong space-y-3 transition-all animate-fadeIn">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-accent" />
            <label
              htmlFor="handoff-desk-select"
              className="text-xs font-semibold text-text-primary"
            >
              Drop-off Location / Desk <span className="text-accent">*</span>
            </label>
          </div>

          <select
            id="handoff-desk-select"
            value={handoffDesk}
            aria-invalid={Boolean(handoffError)}
            aria-describedby={handoffError ? "handoff-error" : undefined}
            onChange={(e) => onHandoffDeskChange(e.target.value)}
            className={`w-full min-h-[44px] px-3.5 py-2.5 bg-surface text-sm text-text-primary rounded-lg border transition-all duration-150 outline-none ${
              handoffError
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/15"
                : "border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15"
            }`}
          >
            <option value="">Select where you turned it in...</option>
            {DROPOFF_DESKS.map((desk) => (
              <option key={desk} value={desk}>
                {desk}
              </option>
            ))}
          </select>

          {handoffDesk === "Other" && (
            <input
              type="text"
              placeholder="Specify custom location or staff desk..."
              value={handoffDeskOther}
              onChange={(e) => onHandoffDeskOtherChange(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-surface text-sm text-text-primary rounded-lg border border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none mt-2"
            />
          )}

          {handoffError && (
            <p id="handoff-error" className="text-[13px] font-medium text-error flex items-center gap-1" role="alert">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{handoffError}</span>
            </p>
          )}
        </div>
      )}

      {/* Privacy Toggle */}
      <div className="pt-2 border-t border-border">
        <label className="flex items-start gap-3 p-3.5 rounded-lg bg-surface border border-border hover:border-border-strong transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideDetails}
            onChange={(e) => onHideDetailsChange(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-border-strong text-accent focus:ring-accent focus:ring-offset-1 accent-accent"
          />
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent" />
              <span>This item has personal info on it (ID card, name, documents, etc.)</span>
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              We&apos;ll keep identifying details hidden from the public listing until a verified owner claims it.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

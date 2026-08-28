import React from "react";
import { Calendar, Clock } from "lucide-react";
import { TimePeriod } from "@/lib/types/foundItem";

interface DateTimeFieldsProps {
  dateFound: string;
  timeFound?: string;
  timePeriod?: TimePeriod;
  useCoarseTime: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onTimePeriodChange: (period: TimePeriod) => void;
  onToggleCoarseTime: (useCoarse: boolean) => void;
  dateError?: string;
}

export const DateTimeFields: React.FC<DateTimeFieldsProps> = ({
  dateFound,
  timeFound,
  timePeriod = "morning",
  useCoarseTime,
  onDateChange,
  onTimeChange,
  onTimePeriodChange,
  onToggleCoarseTime,
  dateError,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const periods: { id: TimePeriod; label: string; desc: string }[] = [
    { id: "morning", label: "Morning", desc: "6 AM – 12 PM" },
    { id: "afternoon", label: "Afternoon", desc: "12 PM – 5 PM" },
    { id: "evening", label: "Evening", desc: "5 PM – 9 PM" },
    { id: "night", label: "Night", desc: "9 PM – 6 AM" },
  ];

  return (
    <div className="w-full space-y-4" id="datetime-section">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-accent" />
          <span>Date & Time Found</span>
          <span className="text-accent">*</span>
        </label>
        <span className="text-xs text-text-muted">Defaults to today</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Field (No future dates allowed) */}
        <div>
          <label htmlFor="date-found-input" className="block text-xs font-semibold text-text-primary mb-1">
            Date <span className="text-accent">*</span>
          </label>
          <input
            id="date-found-input"
            type="date"
            max={today}
            value={dateFound}
            onChange={(e) => onDateChange(e.target.value)}
            aria-invalid={Boolean(dateError)}
            aria-describedby={dateError ? "date-error" : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2.5 bg-surface text-sm text-text-primary rounded-lg border transition-all duration-150 outline-none ${
              dateError
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/15"
                : "border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15"
            }`}
          />
          {dateError && (
            <p id="date-error" className="mt-1.5 text-[13px] font-medium text-error flex items-center gap-1" role="alert">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{dateError}</span>
            </p>
          )}
        </div>

        {/* Time Field or Coarse Period Switch */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="time-found-input" className="block text-xs font-semibold text-text-primary">
              Approximate Time
            </label>
            <button
              type="button"
              onClick={() => onToggleCoarseTime(!useCoarseTime)}
              className="text-xs text-accent hover:text-accent-hover font-semibold underline focus:outline-none"
            >
              {useCoarseTime ? "Switch to exact time" : "Not sure exactly?"}
            </button>
          </div>

          {!useCoarseTime ? (
            <div className="relative">
              <input
                id="time-found-input"
                type="time"
                value={timeFound || ""}
                onChange={(e) => onTimeChange(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-surface text-sm text-text-primary rounded-lg border border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Approximate time of day">
              {periods.map((p) => {
                const isSelected = timePeriod === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onTimePeriodChange(p.id)}
                    className={`min-h-[44px] px-3 py-2 text-left rounded-lg border transition-all text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? "bg-accent-light border-accent text-text-primary font-semibold shadow-sm"
                        : "bg-surface border-border-strong text-text-secondary hover:bg-surface-alt"
                    }`}
                  >
                    <span className="block font-medium">{p.label}</span>
                    <span className="block text-[10px] text-text-muted">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

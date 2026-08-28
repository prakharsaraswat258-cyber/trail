import React from "react";
import { FileText, AlertCircle } from "lucide-react";

interface DescriptionFieldProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export const DescriptionField: React.FC<DescriptionFieldProps> = ({
  value,
  onChange,
  error,
}) => {
  const charCount = value.trim().length;
  const isMinMet = charCount >= 10;

  return (
    <div className="w-full space-y-2" id="description-section">
      <div className="flex items-center justify-between">
        <label
          htmlFor="item-description-textarea"
          className="text-sm font-semibold text-text-primary flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4 text-accent" />
          <span>Description</span>
          <span className="text-accent">*</span>
        </label>
        <span
          className={`text-xs ${
            isMinMet ? "text-success font-medium" : "text-text-muted"
          }`}
        >
          {charCount}/10 chars min
        </span>
      </div>

      <textarea
        id="item-description-textarea"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "description-error" : "description-helper"}
        placeholder="Brand, color, condition, any stickers or markings — the more specific, the faster we can match it."
        className={`w-full p-3.5 bg-surface text-sm text-text-primary placeholder:text-text-muted rounded-lg border transition-all duration-150 outline-none leading-relaxed resize-y min-h-[96px] ${
          error
            ? "border-error focus:border-error focus:ring-2 focus:ring-error/15"
            : "border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15"
        }`}
      />

      {error ? (
        <p id="description-error" className="text-[13px] font-medium text-error flex items-center gap-1" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      ) : (
        <p id="description-helper" className="text-xs text-text-secondary">
          Mention unique traits like scratches, stickers, or brand tags so the owner can identify it.
        </p>
      )}
    </div>
  );
};

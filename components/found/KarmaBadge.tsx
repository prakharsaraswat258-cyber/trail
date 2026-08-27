import React from "react";

interface KarmaBadgeProps {
  label?: string;
  points?: number;
  className?: string;
}

export const KarmaBadge: React.FC<KarmaBadgeProps> = ({
  label = "Campus Hero",
  points = 10,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold tracking-wide bg-accent-light text-accent border border-accent/15 select-none ${className}`}
    >
      <span role="img" aria-label="Medal">🏅</span>
      <span>{label}</span>
      <span className="font-bold">+{points}</span>
    </span>
  );
};

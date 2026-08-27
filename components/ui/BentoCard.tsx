import React from "react";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  hasError?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = "",
  id,
  hasError = false,
  ...props
}) => {
  return (
    <div
      id={id}
      className={`bg-surface p-5 rounded-lg border transition-colors duration-150 ${
        hasError
          ? "border-error ring-1 ring-error/20"
          : "border-border hover:border-border-strong"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

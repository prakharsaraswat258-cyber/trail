import React from "react";

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  hasError?: boolean;
  interactive?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = "",
  id,
  hasError = false,
  interactive = false,
  ...props
}) => {
  const interactiveStyles = interactive
    ? "hover:bg-surface-alt hover:border-border-strong cursor-pointer"
    : "";

  return (
    <div
      id={id}
      className={`bg-surface p-5 rounded-lg border transition-colors duration-150 ${
        hasError
          ? "border-error ring-1 ring-error/20"
          : "border-border hover:border-border-strong"
      } ${interactiveStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

import React, { HTMLAttributes, forwardRef } from 'react';

export interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
  hasError?: boolean;
  interactive?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  (
    {
      children,
      className = '',
      id,
      hasError = false,
      interactive = false,
      hoverable = false,
      compact = false,
      ...props
    },
    ref
  ) => {
    const isInteractive = interactive || hoverable;
    const interactiveStyles = isInteractive
      ? 'hover:bg-surface-alt hover:border-border-strong cursor-pointer'
      : '';

    const borderStyles = hasError
      ? 'border-error ring-1 ring-error/20'
      : 'border-border';

    return (
      <div
        ref={ref}
        id={id}
        className={`bg-surface rounded-lg border transition-colors duration-150 ${
          compact ? 'p-4' : 'p-5 sm:p-5 p-4'
        } ${borderStyles} ${interactiveStyles} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoCard.displayName = 'BentoCard';

import React, { HTMLAttributes, forwardRef } from 'react';

export interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  compact?: boolean;
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  ({ children, className = '', hoverable = false, compact = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg border border-border transition-colors duration-150 ${
          compact ? 'p-4' : 'p-5 sm:p-5 p-4'
        } ${hoverable ? 'hover:bg-surface-alt hover:border-border-strong' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoCard.displayName = 'BentoCard';

import React from 'react';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export default function BentoCard({
  children,
  className = '',
  interactive = false,
  ...props
}: BentoCardProps) {
  const interactiveStyles = interactive
    ? 'hover:bg-surface-alt hover:border-border-strong cursor-pointer transition-colors'
    : '';

  return (
    <div
      className={`bg-surface border border-border p-5 rounded-lg transition-colors ${interactiveStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

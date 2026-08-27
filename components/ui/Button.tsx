import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  isLoading = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center text-sm font-semibold px-6 py-3 rounded-lg min-h-[44px] min-w-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary:
      'bg-accent text-white hover:bg-accent-hover active:bg-accent-hover shadow-none',
    secondary:
      'bg-surface border border-border-strong text-text-primary hover:bg-surface-alt active:bg-surface-alt shadow-none',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-alt shadow-none',
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${selectedVariant} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

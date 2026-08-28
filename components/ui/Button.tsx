import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles guarantee minimum 44px touch target and 8px border radius
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg min-h-[44px]';

    const variants = {
      // Primary: min-height 44px, bg #C96442, text #FFFFFF, 14px semibold, px-6 py-3, rounded-lg. Hover #B5572E
      primary:
        'bg-accent text-white hover:bg-accent-hover active:bg-[#9E4622] shadow-none border border-transparent',
      // Secondary: min-height 44px, bg #FFFFFF, border 1px rgba(0,0,0,0.14), text #1C1B18, px-6 py-3, rounded-lg. Hover #F3F1EB
      secondary:
        'bg-white text-text-primary border border-border-strong hover:bg-surface-alt active:bg-surface-raised',
      // Danger: bg-error text-white
      danger:
        'bg-error text-white hover:bg-red-700 active:bg-red-800 border border-transparent',
      // Ghost: transparent background, hover soft surface
      ghost:
        'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-alt border border-transparent',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-3.5 text-base',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`.trim()}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

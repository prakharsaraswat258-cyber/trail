import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className = '',
      disabled,
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
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  id?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    id,
    className = '',
    type = 'text',
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const stateBorderClasses = error
    ? 'border-error focus:border-error focus:ring-error/15'
    : 'border-border-strong focus:border-accent focus:ring-accent/15';

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-text-secondary select-none"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        className={`w-full min-h-[44px] px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-surface border rounded-lg transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${stateBorderClasses} ${className}`.trim()}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-[13px] text-error mt-0.5">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-text-muted mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;

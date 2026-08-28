import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  href?: string;
}

export function Logo({
  size = 'md',
  showWordmark = true,
  className = '',
  href = '/',
}: LogoProps) {
  const iconSizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 44, height: 44 },
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const { width, height } = iconSizes[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Abstract Geometric Dragon Icon */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* Dragon Head (Angular Triangle pointing up-right) */}
        <path
          d="M14 6L28 10L20 20Z"
          fill="#C96442"
          stroke="#C96442"
          strokeWidth="1.5"
          strokeLinejoin="miter"
        />
        {/* Sharp Eye accent */}
        <polygon points="21,12 24,13 22,15" fill="#FFFFFF" />
        {/* Sweeping Tail Line 1 */}
        <path
          d="M16 20L8 28L4 27"
          stroke="#C96442"
          strokeWidth="2.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        {/* Sweeping Tail Line 2 */}
        <path
          d="M20 20L15 31L10 32"
          stroke="#C96442"
          strokeWidth="2.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        {/* Crest Spine */}
        <path
          d="M14 6L8 12"
          stroke="#C96442"
          strokeWidth="2.5"
          strokeLinecap="square"
        />
      </svg>

      {showWordmark && (
        <span
          className={`font-bold tracking-wide text-text-primary ${textSizes[size]}`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Penga
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-md"
        aria-label="Penga Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

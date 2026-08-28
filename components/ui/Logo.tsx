import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  href?: string;
}

export function Logo({
  showWordmark = true,
  className = '',
  href = '/',
}: LogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* // TODO: swap fallback for /public/lpu-logo.svg once official asset is added */}
      <div
        className="w-8 h-8 rounded-md bg-[#F2E8E2] dark:bg-[#3D2419] flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <span className="font-bold text-sm text-[#C96442] dark:text-[#D97757]">
          LF
        </span>
      </div>

      {showWordmark && (
        <span
          className="font-bold tracking-wide text-base md:text-lg text-[#1C1B18] dark:text-[#F5F2EC] whitespace-nowrap"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          LPU Find
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center min-h-[44px] min-w-[44px] py-1 px-1 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-md"
        aria-label="LPU Find Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

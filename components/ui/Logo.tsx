import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const pixelSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative ${iconSizes[size]} rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center`}>
        <Image
          src="/icons/icon-192.png"
          alt="LPU Find Logo"
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="object-contain w-full h-full"
          priority
        />
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

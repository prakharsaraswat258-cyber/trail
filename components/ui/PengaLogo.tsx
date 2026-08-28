import React from "react";

interface PengaLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

export const PengaLogo: React.FC<PengaLogoProps> = ({
  size = "md",
  showWordmark = true,
  className = "",
}) => {
  const iconDimensions = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Abstract Geometric Dragon Icon */}
      <svg
        className={`${iconDimensions[size]} text-accent flex-shrink-0`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Angular triangle head pointing upward-right */}
        <path
          d="M16 4L28 10L22 17L16 4Z"
          fill="currentColor"
        />
        {/* Sweeping straight tail lines representing speed and precision */}
        <path
          d="M22 17L11 22L4 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
        <path
          d="M16 11L7 18L3 23"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
      </svg>

      {showWordmark && (
        <span className={`font-bold tracking-wide text-text-primary ${textSizes[size]}`}>
          LPU Find
        </span>
      )}
    </div>
  );
};

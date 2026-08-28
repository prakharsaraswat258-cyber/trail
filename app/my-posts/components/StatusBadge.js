import React from 'react';

/**
 * StatusBadge component
 * Props:
 *  - status: "OPEN" | "IN_CLAIM" | "RESOLVED"
 */
export default function StatusBadge({ status }) {
  const configs = {
    OPEN: {
      label: 'Open',
      className: 'text-[#059669] bg-[#ECFDF5]',
    },
    IN_CLAIM: {
      label: 'In Verification',
      className: 'text-[#D97706] bg-[#FFFBEB]',
    },
    RESOLVED: {
      label: 'Resolved',
      className: 'text-[#6B7280] bg-[#F9FAFB]',
    },
  };

  const current = configs[status] || configs.OPEN;

  return (
    <span
      className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold tracking-wide ${current.className}`}
    >
      {current.label}
    </span>
  );
}

import React, { useEffect } from 'react';

/**
 * ConfirmDialog component
 * Centered confirmation modal with solid overlay (no backdrop blur).
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete this post? This can't be undone.",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Solid overlay - no backdrop blur */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative bg-white border border-black/7 rounded-lg p-6 max-w-sm w-full shadow-lg z-10">
        <h2
          id="confirm-dialog-title"
          className="text-base font-semibold text-[#1C1B18] mb-6 leading-normal"
        >
          {title}
        </h2>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[64px] px-3 py-2 text-sm font-medium text-[#6E6B5F] hover:text-[#1C1B18] active:scale-[0.97] transition-transform duration-100 flex items-center justify-center rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] px-4 py-2 bg-[#DC2626] hover:bg-red-700 text-white text-sm font-medium rounded-lg active:scale-[0.97] transition-transform duration-100 flex items-center justify-center"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

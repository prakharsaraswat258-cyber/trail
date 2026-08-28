import React, { useEffect } from 'react';

/**
 * ActionSheet component
 * Mobile bottom sheet for secondary post actions.
 */
export default function ActionSheet({
  isOpen,
  onClose,
  post,
  onEdit,
  onBump,
  onDelete,
  isBumpEligible,
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

  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-sheet-title"
    >
      {/* Solid overlay - no backdrop blur */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div className="relative w-full bg-white rounded-t-2xl p-4 shadow-xl z-10 max-h-[80vh] overflow-y-auto">
        {/* Drag handle bar */}
        <div className="h-1 w-10 bg-black/14 rounded-full mx-auto mb-3" />

        <div className="px-2 pb-2 mb-2 border-b border-black/7">
          <p
            id="action-sheet-title"
            className="text-xs font-semibold text-[#A8A49A] uppercase tracking-wider truncate"
          >
            {post.title}
          </p>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit();
            }}
            className="w-full text-left min-h-[44px] px-3 py-2 text-sm font-medium text-[#1C1B18] rounded-lg hover:bg-[#F3F1EB] active:scale-[0.97] transition-transform duration-100 flex items-center"
          >
            Edit Post
          </button>

          {isBumpEligible && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onBump();
              }}
              className="w-full text-left min-h-[44px] px-3 py-2 text-sm font-medium text-[#C96442] rounded-lg hover:bg-[#F2E8E2] active:scale-[0.97] transition-transform duration-100 flex items-center"
            >
              Bump Post
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete();
            }}
            className="w-full text-left min-h-[44px] px-3 py-2 text-sm font-medium text-[#DC2626] rounded-lg hover:bg-red-50 active:scale-[0.97] transition-transform duration-100 flex items-center"
          >
            Delete Post
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center min-h-[44px] py-2.5 mt-3 bg-[#F3F1EB] hover:bg-[#ECEAE2] rounded-lg text-sm text-[#6E6B5F] font-medium active:scale-[0.97] transition-transform duration-100 flex items-center justify-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

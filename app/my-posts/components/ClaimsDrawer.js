import React, { useState, useEffect } from 'react';

/**
 * ClaimsDrawer component
 * Mobile bottom sheet with drag handle and swipe-to-dismiss.
 */
export default function ClaimsDrawer({
  isOpen,
  onClose,
  post,
  onApproveClaim,
  onRejectClaim,
}) {
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchCurrentY, setTouchCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    if (currentY > touchStartY) {
      setTouchCurrentY(currentY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const dragDelta = touchCurrentY - touchStartY;
    if (dragDelta > 100) {
      onClose();
    }
    setTouchStartY(0);
    setTouchCurrentY(0);
  };

  const dragOffset = isDragging && touchCurrentY > touchStartY ? touchCurrentY - touchStartY : 0;
  const claims = post.claim_requests || [];

  const getStatusPill = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide text-[#059669] bg-[#ECFDF5]">
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide text-[#6B7280] bg-[#F9FAFB]">
            Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide text-[#D97706] bg-[#FFFBEB]">
            Pending
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="claims-drawer-title"
    >
      {/* Solid overlay - no backdrop blur */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Bottom Sheet */}
      <div
        style={dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined}
        className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] z-10 transition-transform duration-150"
      >
        {/* Drag handle */}
        <div
          className="pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1.5 w-12 bg-black/14 rounded-full mx-auto" />
        </div>

        {/* Sheet Header */}
        <div
          className="px-5 pb-3 border-b border-black/7 flex items-center justify-between gap-3 shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="min-w-0 flex-1">
            <h2
              id="claims-drawer-title"
              className="text-base font-bold text-[#1C1B18] truncate"
            >
              Claims for {post.title}
            </h2>
            <p className="text-xs text-[#6E6B5F] mt-0.5">
              {claims.length} {claims.length === 1 ? 'claim' : 'claims'} submitted
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close claims drawer"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg text-[#A8A49A] hover:text-[#1C1B18] hover:bg-[#F3F1EB] active:scale-[0.97] transition-all flex items-center justify-center shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Claims List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {claims.length === 0 ? (
            <div className="text-center py-12 text-[#6E6B5F] text-sm">
              No claims submitted for this post.
            </div>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.claim_id}
                className={`p-3.5 rounded-xl border transition-colors ${
                  claim.status === 'REJECTED'
                    ? 'bg-[#F3F1EB]/50 border-black/7 opacity-75'
                    : 'bg-white border-black/7'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-[#6E6B5F]">
                    Student #{claim.claimant_id}
                  </span>
                  {getStatusPill(claim.status)}
                </div>

                <p className="text-sm text-[#1C1B18] leading-relaxed mb-3">
                  {claim.proof_note}
                </p>

                {claim.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-black/7">
                    <button
                      type="button"
                      onClick={() => onRejectClaim(post.post_id, claim.claim_id)}
                      className="min-h-[44px] px-3.5 py-2 text-sm font-semibold text-[#DC2626] hover:underline active:scale-[0.97] transition-transform duration-100 flex items-center justify-center rounded-lg"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => onApproveClaim(post.post_id, claim.claim_id)}
                      className="min-h-[44px] min-w-[80px] px-4 py-2 bg-[#C96442] hover:bg-[#B5572E] text-white text-sm font-semibold rounded-lg active:scale-[0.97] transition-transform duration-100 flex items-center justify-center"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

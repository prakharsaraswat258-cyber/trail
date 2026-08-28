import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import EditForm from './EditForm';

/**
 * PostCard component
 * Mobile-first card representing a user's lost or found post.
 */
export default function PostCard({
  post,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onStatusChange,
  onEditSave,
  onBump,
  onDeleteClick,
  onViewClaims,
  onOpenActionSheet,
}) {
  const [isSavedFlash, setIsSavedFlash] = useState(false);

  const pendingClaims = (post.claim_requests || []).filter(
    (c) => c.status === 'PENDING'
  );
  const totalClaims = (post.claim_requests || []).length;

  const now = new Date().getTime();
  const createdTime = new Date(post.created_at).getTime();
  const isOlderThan3Days = now - createdTime > 3 * 24 * 60 * 60 * 1000;
  const isBumpEligible = post.status === 'OPEN' && isOlderThan3Days;

  const handleSave = async (fields) => {
    await onEditSave(post.post_id, fields);
    onCancelEdit();
    setIsSavedFlash(true);
    setTimeout(() => {
      setIsSavedFlash(false);
    }, 200);
  };

  const isResolved = post.status === 'RESOLVED';

  return (
    <div
      className={`bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 ${
        isSavedFlash
          ? 'border-[#059669] ring-2 ring-[#059669]/20'
          : 'border-black/7 hover:border-black/14'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Thumbnail */}
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-black/7"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-[#ECEAE2] flex items-center justify-center shrink-0 border border-black/7">
            <svg
              className="w-5 h-5 text-[#A8A49A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Content details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide ${
                post.type === 'LOST'
                  ? 'text-[#DC2626] bg-[#FEF2F2]'
                  : 'text-[#059669] bg-[#ECFDF5]'
              }`}
            >
              {post.type}
            </span>

            <StatusBadge status={post.status} />

            <span className="text-[11px] font-medium text-[#A8A49A] ml-auto truncate">
              {post.category}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-[#1C1B18] line-clamp-1 leading-snug">
            {post.title}
          </h3>

          <p className="text-xs text-[#6E6B5F] truncate mt-0.5 flex items-center gap-1">
            <svg
              className="w-3 h-3 shrink-0 text-[#A8A49A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{post.location}</span>
          </p>

          {pendingClaims.length > 0 && (
            <p className="text-xs font-semibold text-[#C96442] mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C96442]" />
              {pendingClaims.length} Pending Claim{pendingClaims.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Inline Edit Form */}
      {isEditing && (
        <EditForm
          post={post}
          onSave={handleSave}
          onCancel={onCancelEdit}
        />
      )}

      {/* Mobile Action Row */}
      {!isEditing && (
        <div className="mt-3 pt-3 border-t border-black/7 flex items-center justify-between gap-2">
          <div className="flex-1">
            {totalClaims > 0 ? (
              <button
                type="button"
                onClick={() => onViewClaims(post)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#F2E8E2] text-[#C96442] hover:bg-[#ebdcd3] text-sm font-semibold rounded-lg active:scale-[0.97] transition-transform duration-100 flex items-center justify-center gap-1.5"
              >
                <span>View Claims</span>
                <span className="bg-[#C96442] text-white text-[11px] px-1.5 py-0.5 rounded-full font-bold">
                  {totalClaims}
                </span>
              </button>
            ) : !isResolved ? (
              <button
                type="button"
                onClick={() => onStatusChange(post.post_id, 'RESOLVED')}
                className="w-full min-h-[44px] px-4 py-2 bg-[#C96442] hover:bg-[#B5572E] text-white text-sm font-medium rounded-lg active:scale-[0.97] transition-transform duration-100 flex items-center justify-center"
              >
                Mark Resolved
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStartEdit(post.post_id)}
                className="w-full min-h-[44px] px-3 py-2 bg-[#F3F1EB] text-[#1C1B18] text-sm font-medium rounded-lg active:scale-[0.97] transition-transform duration-100 flex items-center justify-center"
              >
                Edit Details
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenActionSheet(post)}
            aria-label="More actions"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-[#F3F1EB] hover:bg-[#ECEAE2] text-[#6E6B5F] hover:text-[#1C1B18] active:scale-[0.97] transition-transform duration-100 flex items-center justify-center shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

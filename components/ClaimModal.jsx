'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { submitClaim } from '@/lib/mockClaims';

/**
 * ClaimModal
 * Modal for submitting a claim on an item.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.item - The item being claimed
 * @param {Function} props.onClose - Closes the claim modal
 * @param {Function} props.onSuccessClose - Closes both modal and parent drawer on completion
 */
export default function ClaimModal({ isOpen, item, onClose, onSuccessClose }) {
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [proof, setProof] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [claimId, setClaimId] = useState(null);

  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // Track initial active element for focus restore
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      // Reset state on open
      setIsSubmitted(false);
      setClaimId(null);
      setErrors({});
    } else if (triggerRef.current) {
      triggerRef.current.focus?.();
    }
  }, [isOpen]);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const validateContact = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Contact email or phone is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!emailRegex.test(trimmed) && !phoneRegex.test(trimmed.replace(/\s+/g, ''))) {
      return 'Please enter a valid email or phone number';
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    const contactErr = validateContact(contact);
    if (contactErr) {
      newErrors.contact = contactErr;
    }
    if (!proof.trim()) {
      newErrors.proof = 'Proof / identifying detail is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid =
    fullName.trim().length > 0 &&
    contact.trim().length > 0 &&
    proof.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await submitClaim(item.id, {
        name: fullName.trim(),
        contact: contact.trim(),
        proof: proof.trim(),
      });
      if (res?.success) {
        setClaimId(res.claimId);
        setIsSubmitted(true);
      }
    } catch (err) {
      setErrors({ general: err?.message || 'Failed to submit claim. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    if (onSuccessClose) {
      onSuccessClose();
    } else {
      onClose?.();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      {/* Dimmed backdrop - solid rgba overlay, no blur */}
      <div
        className="fixed inset-0 bg-[rgba(0,0,0,0.4)] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[480px] bg-[#FFFFFF] rounded-lg border border-[rgba(0,0,0,0.07)] shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.07)] flex items-center justify-between">
          <div>
            <h2 id="claim-modal-title" className="text-lg font-bold text-[#1C1B18]">
              {isSubmitted ? 'Claim Confirmation' : 'Claim Item'}
            </h2>
            <p className="text-xs text-[#6E6B5F] mt-0.5 truncate max-w-[340px]">
              {item.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close claim dialog"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 rounded-lg text-[#A8A49A] hover:text-[#1C1B18] hover:bg-[#F3F1EB] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {isSubmitted ? (
            /* Confirmation State */
            <div className="py-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1C1B18] mb-2">Claim submitted</h3>
              <p className="text-sm text-[#6E6B5F] max-w-sm mb-6 leading-relaxed">
                We&apos;ve notified the finder. You&apos;ll hear back once they confirm.
              </p>
              {claimId && (
                <div className="w-full max-w-xs mb-6 px-3 py-2 rounded-md bg-[#F3F1EB] text-xs text-[#6E6B5F]">
                  Reference ID: <span className="font-mono font-medium text-[#1C1B18]">{claimId}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleDone}
                className="w-full min-h-[44px] px-6 py-3 rounded-lg bg-[#C96442] hover:bg-[#B5572E] text-[#FFFFFF] text-sm font-semibold transition-colors flex items-center justify-center"
              >
                Done
              </button>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {errors.general && (
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[rgba(220,38,38,0.2)] text-xs text-[#DC2626]">
                  {errors.general}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label
                  htmlFor="claim-full-name"
                  className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
                >
                  Full Name <span className="text-[#C96442]">*</span>
                </label>
                <input
                  id="claim-full-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border outline-none transition-colors ${
                    errors.fullName
                      ? 'border-[#DC2626] focus:border-[#DC2626]'
                      : 'border-[rgba(0,0,0,0.14)] focus:border-[#C96442]'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.fullName}</p>
                )}
              </div>

              {/* Contact Email or Phone */}
              <div>
                <label
                  htmlFor="claim-contact"
                  className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
                >
                  Contact Email or Phone <span className="text-[#C96442]">*</span>
                </label>
                <input
                  id="claim-contact"
                  type="text"
                  required
                  placeholder="name@university.edu or (555) 000-0000"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (errors.contact) setErrors((prev) => ({ ...prev, contact: null }));
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border outline-none transition-colors ${
                    errors.contact
                      ? 'border-[#DC2626] focus:border-[#DC2626]'
                      : 'border-[rgba(0,0,0,0.14)] focus:border-[#C96442]'
                  }`}
                />
                {errors.contact && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.contact}</p>
                )}
              </div>

              {/* Proof / Identifying Detail */}
              <div>
                <label
                  htmlFor="claim-proof"
                  className="block text-xs font-semibold text-[#1C1B18] mb-1.5"
                >
                  Proof / Identifying Detail <span className="text-[#C96442]">*</span>
                </label>
                <textarea
                  id="claim-proof"
                  required
                  rows={4}
                  placeholder="Describe something specific about this item only the owner would know, e.g. a scratch, sticker, or contents"
                  value={proof}
                  onChange={(e) => {
                    setProof(e.target.value);
                    if (errors.proof) setErrors((prev) => ({ ...prev, proof: null }));
                  }}
                  className={`w-full p-3.5 bg-[#FFFFFF] text-sm text-[#1C1B18] placeholder:text-[#A8A49A] rounded-lg border outline-none transition-colors resize-y min-h-[96px] ${
                    errors.proof
                      ? 'border-[#DC2626] focus:border-[#DC2626]'
                      : 'border-[rgba(0,0,0,0.14)] focus:border-[#C96442]'
                  }`}
                />
                {errors.proof && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.proof}</p>
                )}
              </div>

              {/* Form Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full min-h-[44px] px-6 py-3 rounded-lg bg-[#C96442] hover:bg-[#B5572E] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFFFFF] text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting…</span>
                    </>
                  ) : (
                    'Submit Claim'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

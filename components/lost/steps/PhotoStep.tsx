'use client';

import React, { useRef, useState } from 'react';
import BentoCard from '../../ui/BentoCard';
import Button from '../../ui/Button';

interface PhotoStepProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  headingRef: React.RefObject<HTMLHeadingElement>;
}

export default function PhotoStep({
  photos,
  onChange,
  headingRef,
}: PhotoStepProps) {
  const [errors, setErrors] = useState<{ [slotIndex: number]: string }>({});
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | undefined, slotIndex: number) => {
    if (!file) return;

    // Constraints: JPG/PNG only, max 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const isTypeValid = validTypes.includes(file.type.toLowerCase());
    const isSizeValid = file.size <= 5 * 1024 * 1024; // 5MB

    if (!isTypeValid || !isSizeValid) {
      setErrors((prev) => ({
        ...prev,
        [slotIndex]:
          'File size exceeds 5MB or invalid format. Please attach a JPG or PNG.',
      }));
      return;
    }

    // Clear slot error
    setErrors((prev) => {
      const next = { ...prev };
      delete next[slotIndex];
      return next;
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const updated = [...photos];
      updated[slotIndex] = result;
      onChange(updated.filter(Boolean));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    onChange(updated);
  };

  const handleRetry = (slotIndex: number) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[slotIndex];
      return next;
    });
    if (slotIndex === 0) {
      if (fileInputRef1.current) {
        fileInputRef1.current.value = '';
        fileInputRef1.current.click();
      }
    } else {
      if (fileInputRef2.current) {
        fileInputRef2.current.value = '';
        fileInputRef2.current.click();
      }
    }
  };

  return (
    <BentoCard className="p-6 sm:p-8 space-y-6">
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-text-primary tracking-tight outline-none"
          >
            Step 4: Photo / Reference Image (Optional)
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-alt text-text-secondary border border-border">
            Optional
          </span>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Add up to 2 photos to assist visually when your item is turned in.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Photo Slot 1 */}
        <div className="p-4 bg-surface-alt border border-border-strong rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">
              Image 1 {photos[0] ? '✓ Uploaded' : '(Primary Photo)'}
            </span>
            {photos[0] && (
              <button
                type="button"
                onClick={() => handleRemovePhoto(0)}
                className="text-xs text-error font-semibold hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          {photos[0] ? (
            <div className="relative w-full h-44 rounded-lg overflow-hidden border border-border bg-surface">
              <img
                src={photos[0]}
                alt="Uploaded item preview 1"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-44 rounded-lg border-2 border-dashed border-border-strong flex flex-col items-center justify-center p-4 text-center bg-surface">
              <input
                ref={fileInputRef1}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                id="photo-upload-1"
                onChange={(e) => handleFileChange(e.target.files?.[0], 0)}
              />
              <svg
                className="w-8 h-8 text-text-muted mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <label
                htmlFor="photo-upload-1"
                className="text-xs font-semibold text-accent hover:text-accent-hover underline cursor-pointer py-1"
              >
                Choose file (JPG / PNG)
              </label>
              <p className="text-[11px] text-text-muted mt-1">Up to 5MB</p>
            </div>
          )}

          {errors[0] && (
            <div className="p-3 bg-red-50 border border-error/20 rounded-lg space-y-2">
              <p className="text-xs text-error font-medium">{errors[0]}</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleRetry(0)}
                className="text-xs py-1.5 px-3 min-h-[36px] w-full"
              >
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Photo Slot 2 */}
        <div className="p-4 bg-surface-alt border border-border-strong rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">
              Image 2 {photos[1] ? '✓ Uploaded' : '(Secondary / Reference)'}
            </span>
            {photos[1] && (
              <button
                type="button"
                onClick={() => handleRemovePhoto(1)}
                className="text-xs text-error font-semibold hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          {photos[1] ? (
            <div className="relative w-full h-44 rounded-lg overflow-hidden border border-border bg-surface">
              <img
                src={photos[1]}
                alt="Uploaded item preview 2"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-44 rounded-lg border-2 border-dashed border-border-strong flex flex-col items-center justify-center p-4 text-center bg-surface">
              <input
                ref={fileInputRef2}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                id="photo-upload-2"
                onChange={(e) => handleFileChange(e.target.files?.[0], 1)}
              />
              <svg
                className="w-8 h-8 text-text-muted mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <label
                htmlFor="photo-upload-2"
                className="text-xs font-semibold text-accent hover:text-accent-hover underline cursor-pointer py-1"
              >
                Choose file (JPG / PNG)
              </label>
              <p className="text-[11px] text-text-muted mt-1">Up to 5MB</p>
            </div>
          )}

          {errors[1] && (
            <div className="p-3 bg-red-50 border border-error/20 rounded-lg space-y-2">
              <p className="text-xs text-error font-medium">{errors[1]}</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleRetry(1)}
                className="text-xs py-1.5 px-3 min-h-[36px] w-full"
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-surface-alt rounded-lg border border-border text-xs text-text-secondary">
        💡 <strong className="text-text-primary">Helper tip:</strong> Don&apos;t have a photo of your exact item? A similar reference image (e.g. same model or color) still helps our matching.
      </div>
    </BentoCard>
  );
}

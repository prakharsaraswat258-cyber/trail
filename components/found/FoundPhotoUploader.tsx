import React, { useRef, useState } from "react";
import { Camera, Image as ImageIcon, X, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { compressAndStripExif } from "@/lib/utils/imageCompression";

interface PhotoItem {
  id: string;
  dataUrl: string;
  sizeBytes: number;
  fileName: string;
  status: "idle" | "compressing" | "ready" | "error";
  errorMsg?: string;
  originalFile?: File;
}

interface FoundPhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  onUploadSuccess?: () => void;
  error?: string;
}

export const FoundPhotoUploader: React.FC<FoundPhotoUploaderProps> = ({
  photos,
  onChange,
  onUploadSuccess,
  error,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Maintain detailed local state for retry / compression statuses
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>(() =>
    photos.map((url, idx) => ({
      id: `initial-${idx}-${Date.now()}`,
      dataUrl: url,
      sizeBytes: Math.round((url.length * 3) / 4),
      fileName: `Photo ${idx + 1}`,
      status: "ready",
    }))
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - photoItems.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setIsProcessing(true);

    const newItems: PhotoItem[] = filesToProcess.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      dataUrl: "",
      sizeBytes: 0,
      fileName: f.name,
      status: "compressing",
      originalFile: f,
    }));

    setPhotoItems((prev) => [...prev, ...newItems]);

    const updatedItems = [...photoItems, ...newItems];

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      const targetIndex = updatedItems.findIndex((x) => x.id === item.id);
      if (!item.originalFile) continue;

      try {
        const compressed = await compressAndStripExif(item.originalFile);
        updatedItems[targetIndex] = {
          ...item,
          dataUrl: compressed.dataUrl,
          sizeBytes: compressed.sizeBytes,
          status: "ready",
          errorMsg: undefined,
        };
      } catch (err: any) {
        updatedItems[targetIndex] = {
          ...item,
          status: "error",
          errorMsg: err?.message || "Upload failed",
        };
      }
    }

    setPhotoItems([...updatedItems]);
    setIsProcessing(false);

    const readyUrls = updatedItems.filter((x) => x.status === "ready").map((x) => x.dataUrl);
    onChange(readyUrls);

    if (readyUrls.length > 0 && onUploadSuccess) {
      onUploadSuccess();
    }

    // Reset inputs
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleRetryItem = async (itemId: string) => {
    const targetItem = photoItems.find((x) => x.id === itemId);
    if (!targetItem || !targetItem.originalFile) return;

    setPhotoItems((prev) =>
      prev.map((x) => (x.id === itemId ? { ...x, status: "compressing", errorMsg: undefined } : x))
    );

    try {
      const compressed = await compressAndStripExif(targetItem.originalFile);
      const nextList = photoItems.map((x) =>
        x.id === itemId
          ? {
              ...x,
              dataUrl: compressed.dataUrl,
              sizeBytes: compressed.sizeBytes,
              status: "ready" as const,
              errorMsg: undefined,
            }
          : x
      );
      setPhotoItems(nextList);
      const readyUrls = nextList.filter((x) => x.status === "ready").map((x) => x.dataUrl);
      onChange(readyUrls);
      if (readyUrls.length > 0 && onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      setPhotoItems((prev) =>
        prev.map((x) =>
          x.id === itemId
            ? { ...x, status: "error" as const, errorMsg: err?.message || "Upload failed" }
            : x
        )
      );
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const updated = photoItems.filter((x) => x.id !== itemId);
    setPhotoItems(updated);
    const readyUrls = updated.filter((x) => x.status === "ready").map((x) => x.dataUrl);
    onChange(readyUrls);
  };

  return (
    <div className="w-full space-y-3" id="photo-upload-section">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-1">
          <span>Item Photos</span>
          <span className="text-accent">*</span>
          <span className="text-xs font-normal text-text-secondary ml-1">
            ({photoItems.length}/3 photos — 1 required)
          </span>
        </label>
        {photoItems.length > 0 && (
          <span className="text-xs text-text-muted">EXIF & GPS stripped</span>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label="Capture item photo with camera"
        onChange={(e) => processFiles(e.target.files)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-label="Select item photos from gallery"
        onChange={(e) => processFiles(e.target.files)}
      />

      {/* Primary Action Trigger Buttons (Large touch targets >= 44px, visually dominant) */}
      {photoItems.length < 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-3 p-4 min-h-[56px] rounded-lg border-2 border-dashed border-accent/40 bg-accent-light/40 hover:bg-accent-light text-text-primary transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Take Photo with Camera"
          >
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-semibold text-text-primary">Take Photo</span>
              <span className="block text-xs text-text-secondary">Open camera directly</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-3 p-4 min-h-[56px] rounded-lg border-2 border-dashed border-border-strong hover:border-accent/60 bg-surface-alt hover:bg-surface-raised text-text-primary transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Choose from Gallery"
          >
            <div className="w-10 h-10 rounded-full bg-surface border border-border-strong text-text-secondary flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-semibold text-text-primary">Choose from Gallery</span>
              <span className="block text-xs text-text-secondary">Select image files</span>
            </div>
          </button>
        </div>
      )}

      {/* Empty State Prompt if no photos */}
      {photoItems.length === 0 && (
        <div className="p-4 rounded-lg bg-surface-alt/60 border border-border text-center">
          <p className="text-xs text-text-secondary leading-relaxed">
            Add a clear photo of the item — this is the fastest way to get it matched. Images are automatically compressed (&le;1MB) and stripped of GPS metadata.
          </p>
        </div>
      )}

      {/* Thumbnail Previews Grid */}
      {photoItems.length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-1">
          {photoItems.map((item, index) => (
            <div
              key={item.id}
              className={`relative group aspect-square rounded-lg border overflow-hidden bg-surface-alt flex flex-col items-center justify-center ${
                item.status === "error"
                  ? "border-error bg-red-50/50"
                  : "border-border"
              }`}
            >
              {item.status === "ready" && (
                <>
                  {/* local blob preview, not optimized by next/image */}
                  <img
                    src={item.dataUrl}
                    alt={`Found item preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-text-primary/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-none">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-1 right-1 w-7 h-7 rounded-full bg-text-primary/75 text-white flex items-center justify-center hover:bg-error transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}

              {item.status === "compressing" && (
                <div className="p-2 text-center flex flex-col items-center gap-1.5">
                  <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                  <span className="text-[11px] font-medium text-text-secondary">Compressing...</span>
                </div>
              )}

              {item.status === "error" && (
                <div className="p-2 text-center flex flex-col items-center justify-center gap-1.5 w-full h-full">
                  <AlertCircle className="w-5 h-5 text-error" />
                  <span className="text-[11px] font-medium text-error leading-tight">
                    Upload failed
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRetryItem(item.id)}
                    className="text-[11px] font-semibold text-accent underline hover:text-accent-hover mt-1 focus:outline-none"
                  >
                    Retry Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-surface text-text-secondary border border-border flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                    aria-label="Remove failed upload"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Inline Validation Error */}
      {error && (
        <p className="text-[13px] font-medium text-error flex items-center gap-1" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

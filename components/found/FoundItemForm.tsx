import React, { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, WifiOff, RefreshCw, X, ArrowUp } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { Button } from "@/components/ui/Button";
import { FoundPhotoUploader } from "./FoundPhotoUploader";
import { ItemInfoFields } from "./ItemInfoFields";
import { LocationFields } from "./LocationFields";
import { DateTimeFields } from "./DateTimeFields";
import { DescriptionField } from "./DescriptionField";
import { ItemStatusToggle } from "./ItemStatusToggle";
import { ContactMethodFields } from "./ContactMethodFields";
import {
  FoundItemFormData,
  FoundItemPayload,
  FoundItemResponse,
} from "@/lib/types/foundItem";
import {
  saveFoundDraft,
  getFoundDraft,
  clearFoundDraft,
  formatRelativeTime,
  enqueueOfflineReport,
} from "@/lib/draft/foundDraftStorage";
import { submitFoundItem } from "@/lib/api/foundItems";

interface FormErrors {
  photos?: string;
  itemName?: string;
  category?: string;
  building?: string;
  dateFound?: string;
  description?: string;
  handoffDesk?: string;
  contactDetail?: string;
}

interface FoundItemFormProps {
  onSuccess: (response: FoundItemResponse, payload: FoundItemPayload) => void;
}

export const FoundItemForm: React.FC<FoundItemFormProps> = ({ onSuccess }) => {
  const categorySelectRef = useRef<HTMLSelectElement>(null);

  const getInitialToday = () => new Date().toISOString().split("T")[0];
  const getInitialCurrentTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  // Form State
  const [formData, setFormData] = useState<FoundItemFormData>({
    itemName: "",
    category: "",
    photos: [],
    location: {
      building: "",
      floor: "",
      landmarkOrRoom: "",
      geoDetected: false,
    },
    dateFound: getInitialToday(),
    timeFound: getInitialCurrentTime(),
    timePeriod: "afternoon",
    useCoarseTime: false,
    description: "",
    status: "with_finder",
    handoffDesk: "",
    handoffDeskOther: "",
    hideDetails: false,
    contactMethod: "in_app_chat",
    contactDetail: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftBanner, setDraftBanner] = useState<{ relativeTime: string; data: FoundItemFormData } | null>(null);
  const [offlineToast, setOfflineToast] = useState(false);

  // Check for saved draft on mount
  useEffect(() => {
    const draft = getFoundDraft();
    if (draft && draft.formData) {
      // Check if draft contains meaningful content
      const hasContent =
        draft.formData.itemName ||
        draft.formData.category ||
        (draft.formData.photos && draft.formData.photos.length > 0) ||
        draft.formData.location.building ||
        draft.formData.description;

      if (hasContent) {
        setDraftBanner({
          relativeTime: formatRelativeTime(draft.savedAt),
          data: draft.formData,
        });
      }
    }
  }, []);

  // Autosave draft debounced every ~3s while typing or on change
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasContent =
        formData.itemName ||
        formData.category ||
        formData.photos.length > 0 ||
        formData.location.building ||
        formData.description;

      if (hasContent) {
        saveFoundDraft(formData);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Handle rehydrating draft
  const handleResumeDraft = () => {
    if (draftBanner) {
      setFormData(draftBanner.data);
      setDraftBanner(null);
    }
  };

  // Handle clearing draft
  const handleStartOver = () => {
    clearFoundDraft();
    setDraftBanner(null);
  };

  // Autofocus category field after photo upload
  const handlePhotoUploadSuccess = useCallback(() => {
    if (categorySelectRef.current) {
      categorySelectRef.current.focus();
    }
  }, []);

  // Validation logic with specific messages
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.photos.length === 0) {
      newErrors.photos = "Please add at least one photo of the item.";
    }

    if (!formData.itemName.trim()) {
      newErrors.itemName = "Please enter the item name (e.g. Black JanSport backpack).";
    }

    if (!formData.category) {
      newErrors.category = "Please select an item category.";
    }

    if (!formData.location.building.trim()) {
      newErrors.building = "Please select the campus building where you found this.";
    }

    if (!formData.dateFound) {
      newErrors.dateFound = "Please specify the date found.";
    }

    if (formData.description.trim().length < 10) {
      newErrors.description =
        "Please add a short description so we can match this item (minimum 10 characters).";
    }

    if (formData.status === "handed_over") {
      if (!formData.handoffDesk) {
        newErrors.handoffDesk = "Please select where you handed over the item.";
      } else if (formData.handoffDesk === "Other" && !formData.handoffDeskOther?.trim()) {
        newErrors.handoffDesk = "Please specify the staff desk or handoff location.";
      }
    }

    if (formData.contactMethod === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.contactDetail?.trim()) {
        newErrors.contactDetail = "Please enter your student email address.";
      } else if (!emailRegex.test(formData.contactDetail.trim())) {
        newErrors.contactDetail = "Please enter a valid email address (e.g. student@school.edu).";
      }
    }

    if (formData.contactMethod === "phone") {
      const phoneDigits = (formData.contactDetail || "").replace(/\D/g, "");
      if (!formData.contactDetail?.trim()) {
        newErrors.contactDetail = "Please enter your phone number.";
      } else if (phoneDigits.length < 7) {
        newErrors.contactDetail = "Please enter a valid phone number.";
      }
    }

    setErrors(newErrors);

    // Scroll to & focus first invalid field
    if (Object.keys(newErrors).length > 0) {
      const errorKeys = Object.keys(newErrors) as (keyof FormErrors)[];
      const firstError = errorKeys[0];
      const elementMap: Record<keyof FormErrors, string> = {
        photos: "photo-upload-section",
        itemName: "item-name-input",
        category: "item-category-select",
        building: "building-combobox",
        dateFound: "date-found-input",
        description: "item-description-textarea",
        handoffDesk: "handoff-desk-select",
        contactDetail:
          formData.contactMethod === "email" ? "finder-email-input" : "finder-phone-input",
      };

      const targetEl = document.getElementById(elementMap[firstError]);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        if ("focus" in targetEl) {
          (targetEl as HTMLElement).focus();
        }
      }
      return false;
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload: FoundItemPayload = {
      itemName: formData.itemName.trim(),
      category: formData.category,
      photos: formData.photos,
      location: {
        building: formData.location.building.trim(),
        floor: formData.location.floor?.trim() || undefined,
        landmarkOrRoom: formData.location.landmarkOrRoom?.trim() || undefined,
        geoDetected: formData.location.geoDetected,
      },
      dateFound: formData.dateFound,
      timeFound: !formData.useCoarseTime ? formData.timeFound : undefined,
      timePeriod: formData.useCoarseTime ? formData.timePeriod : undefined,
      description: formData.description.trim(),
      status: formData.status,
      handoffDesk:
        formData.status === "handed_over"
          ? formData.handoffDesk === "Other"
            ? `Other: ${formData.handoffDeskOther?.trim()}`
            : formData.handoffDesk
          : undefined,
      hideDetails: formData.hideDetails,
      contactMethod: formData.contactMethod,
      contactDetail:
        formData.contactMethod !== "in_app_chat" ? formData.contactDetail?.trim() : undefined,
    };

    // Check offline status
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueOfflineReport(payload);
      setOfflineToast(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitFoundItem(payload);
      clearFoundDraft();
      onSuccess(response, payload);
    } catch (err: any) {
      console.error('Submit found item error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        enqueueOfflineReport(payload);
        setOfflineToast(true);
      } else {
        alert(err?.message || 'Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Listen for online reconnection to retry queued reports
  useEffect(() => {
    const handleOnline = async () => {
      if (offlineToast) {
        setOfflineToast(false);
        // Automatically submit current payload
        handleSubmit({ preventDefault: () => {} } as any);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [offlineToast, formData]);

  return (
    <div className="w-full max-w-[640px] mx-auto pb-24 md:pb-12 space-y-5">
      {/* Hero Section */}
      <div className="text-center space-y-1.5 pt-2 pb-1">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Report a Found Item
        </h1>
        <p className="text-sm text-text-secondary max-w-lg mx-auto leading-6">
          Thank you for helping return this to its owner — it takes less than a minute.
        </p>
      </div>

      {/* Offline Alert Toast */}
      {offlineToast && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-lg bg-surface border-2 border-accent text-xs text-text-primary shadow-lg flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-accent flex-shrink-0" />
            <span>
              You&apos;re offline — your report is safely saved and we&apos;ll submit it as soon as you&apos;re back online.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOfflineToast(false)}
            className="text-text-muted hover:text-text-primary p-1"
            aria-label="Dismiss offline notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Draft Resume Banner */}
      {draftBanner && (
        <div
          role="region"
          aria-live="polite"
          aria-label="Unsaved draft notification"
          className="p-4 rounded-lg bg-surface-alt border border-border-strong flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="text-xs text-text-secondary">
            You have an unsaved report from <strong className="text-text-primary">{draftBanner.relativeTime}</strong>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleResumeDraft}
              className="px-3 py-1.5 text-xs font-semibold bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={handleStartOver}
              className="px-3 py-1.5 text-xs font-medium bg-surface text-text-secondary border border-border rounded-md hover:bg-surface-raised transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Main Single-Column Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Section 1: Photo (Prominent, First, Required) */}
        <BentoCard hasError={Boolean(errors.photos)}>
          <FoundPhotoUploader
            photos={formData.photos}
            onChange={(newPhotos) => {
              setFormData((prev) => ({ ...prev, photos: newPhotos }));
              if (errors.photos) setErrors((prev) => ({ ...prev, photos: undefined }));
            }}
            onUploadSuccess={handlePhotoUploadSuccess}
            error={errors.photos}
          />
        </BentoCard>

        {/* Section 2: Item Name & Category */}
        <BentoCard hasError={Boolean(errors.itemName || errors.category)}>
          <ItemInfoFields
            ref={categorySelectRef}
            itemName={formData.itemName}
            category={formData.category}
            onItemNameChange={(val) => {
              setFormData((prev) => ({ ...prev, itemName: val }));
              if (errors.itemName) setErrors((prev) => ({ ...prev, itemName: undefined }));
            }}
            onCategoryChange={(val) => {
              setFormData((prev) => ({ ...prev, category: val }));
              if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
            }}
            nameError={errors.itemName}
            categoryError={errors.category}
          />
        </BentoCard>

        {/* Section 3: Location Found */}
        <BentoCard hasError={Boolean(errors.building)}>
          <LocationFields
            location={formData.location}
            onChange={(newLoc) => {
              setFormData((prev) => ({ ...prev, location: newLoc }));
              if (errors.building) setErrors((prev) => ({ ...prev, building: undefined }));
            }}
            buildingError={errors.building}
          />
        </BentoCard>

        {/* Section 4: Date & Time Found */}
        <BentoCard hasError={Boolean(errors.dateFound)}>
          <DateTimeFields
            dateFound={formData.dateFound}
            timeFound={formData.timeFound}
            timePeriod={formData.timePeriod}
            useCoarseTime={formData.useCoarseTime}
            onDateChange={(val) => {
              setFormData((prev) => ({ ...prev, dateFound: val }));
              if (errors.dateFound) setErrors((prev) => ({ ...prev, dateFound: undefined }));
            }}
            onTimeChange={(val) => setFormData((prev) => ({ ...prev, timeFound: val }))}
            onTimePeriodChange={(val) => setFormData((prev) => ({ ...prev, timePeriod: val }))}
            onToggleCoarseTime={(val) => setFormData((prev) => ({ ...prev, useCoarseTime: val }))}
            dateError={errors.dateFound}
          />
        </BentoCard>

        {/* Section 5: Description */}
        <BentoCard hasError={Boolean(errors.description)}>
          <DescriptionField
            value={formData.description}
            onChange={(val) => {
              setFormData((prev) => ({ ...prev, description: val }));
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            error={errors.description}
          />
        </BentoCard>

        {/* Section 6: Current Item Status & Privacy Toggle */}
        <BentoCard hasError={Boolean(errors.handoffDesk)}>
          <ItemStatusToggle
            status={formData.status}
            handoffDesk={formData.handoffDesk}
            handoffDeskOther={formData.handoffDeskOther}
            hideDetails={formData.hideDetails}
            onStatusChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
            onHandoffDeskChange={(val) => {
              setFormData((prev) => ({ ...prev, handoffDesk: val }));
              if (errors.handoffDesk) setErrors((prev) => ({ ...prev, handoffDesk: undefined }));
            }}
            onHandoffDeskOtherChange={(val) =>
              setFormData((prev) => ({ ...prev, handoffDeskOther: val }))
            }
            onHideDetailsChange={(val) => setFormData((prev) => ({ ...prev, hideDetails: val }))}
            handoffError={errors.handoffDesk}
          />
        </BentoCard>

        {/* Section 7: Contact Method */}
        <BentoCard hasError={Boolean(errors.contactDetail)}>
          <ContactMethodFields
            method={formData.contactMethod}
            detail={formData.contactDetail || ""}
            onMethodChange={(val) => {
              setFormData((prev) => ({ ...prev, contactMethod: val }));
              if (errors.contactDetail) setErrors((prev) => ({ ...prev, contactDetail: undefined }));
            }}
            onDetailChange={(val) => {
              setFormData((prev) => ({ ...prev, contactDetail: val }));
              if (errors.contactDetail) setErrors((prev) => ({ ...prev, contactDetail: undefined }));
            }}
            error={errors.contactDetail}
          />
        </BentoCard>

        {/* Desktop Submit Button */}
        <div className="hidden sm:block pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            fullWidth
            className="text-base py-3.5 shadow-md"
          >
            Submit Found Report
          </Button>
        </div>

        {/* Sticky Mobile Submit Footer (visible on mobile viewport) */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-canvas/95 border-t border-border-strong sm:hidden z-30 shadow-lg">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            fullWidth
            className="py-3 shadow-md"
          >
            Submit Found Report
          </Button>
        </div>
      </form>
    </div>
  );
};

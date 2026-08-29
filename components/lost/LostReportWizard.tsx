'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import WizardProgress from './WizardProgress';
import ItemDetailsStep from './steps/ItemDetailsStep';
import DescriptionStep from './steps/DescriptionStep';
import DateLocationStep from './steps/DateLocationStep';
import PhotoStep from './steps/PhotoStep';
import ContactStep from './steps/ContactStep';
import ReviewStep from './steps/ReviewStep';
import { Button } from '../ui/Button';
import {
  saveDraft,
  loadDraft,
  clearDraft,
  getDraftTimeFormatted,
  LostWizardFormData,
  LostWizardDraft,
} from '../../lib/draft/lostWizardDraftStorage';
import { submitLostReport } from '../../lib/api/lostItems';
import MatchResultsDrawer, { MatchResultItem } from './MatchResultsDrawer';
import ItemDetailDrawer from '../ItemDetailDrawer';
import { Sparkles, Loader2 } from 'lucide-react';

const INITIAL_FORM_DATA: LostWizardFormData = {
  category: '',
  itemName: '',
  description: '',
  dateLost: new Date().toISOString().split('T')[0],
  timeLost: '',
  timePeriod: 'morning',
  isTimeExact: false,
  building: '',
  area: '',
  photos: [],
  contact: {
    fullName: '',
    phone: '',
    email: '',
    studentId: '',
  },
  notificationPreferences: {
    email: true,
    sms: true,
    inApp: true,
  },
};

interface LostReportWizardProps {
  onBackToSearch?: () => void;
}

export default function LostReportWizard({ onBackToSearch }: LostReportWizardProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LostWizardFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStatusText, setSubmittingStatusText] = useState('');

  // Match results state
  const [matchResults, setMatchResults] = useState<MatchResultItem[]>([]);
  const [isMatchDrawerOpen, setIsMatchDrawerOpen] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string>('');
  const [selectedCandidateItem, setSelectedCandidateItem] = useState<any>(null);
  const [isCandidateDetailOpen, setIsCandidateDetailOpen] = useState(false);

  // Draft banner state
  const [existingDraft, setExistingDraft] = useState<LostWizardDraft | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Network connection state
  const [isOnline, setIsOnline] = useState(true);
  const [showNetworkBanner, setShowNetworkBanner] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Heading ref to autofocus on step change
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Check for saved draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.data.itemName || draft.data.description || draft.step > 1)) {
      setExistingDraft(draft);
      setShowDraftBanner(true);
    }
  }, []);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNetworkBanner(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNetworkBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingAction]);

  // Autosave draft every 3 seconds while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(currentStep, formData);
    }, 3000);
    return () => clearTimeout(timer);
  }, [formData, currentStep]);

  // Focus heading on step change for accessibility
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [currentStep]);

  // Resume draft handler
  const handleResumeDraft = () => {
    if (existingDraft) {
      setFormData(existingDraft.data);
      setCurrentStep(existingDraft.step || 1);
      setShowDraftBanner(false);
    }
  };

  // Discard draft handler
  const handleDiscardDraft = () => {
    clearDraft();
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setShowDraftBanner(false);
  };

  // Form field update handlers
  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      saveDraft(currentStep, next);
      return next;
    });

    // Clear field-specific error
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateContactField = (field: string, value: string) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      };
      saveDraft(currentStep, next);
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateNotificationField = (field: string, value: boolean) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [field]: value,
        },
      };
      saveDraft(currentStep, next);
      return next;
    });
  };

  // Validation per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.category) {
        newErrors.category = 'Please select a category for your item.';
      }
      if (!formData.itemName.trim()) {
        newErrors.itemName = 'Please enter the item name.';
      }
    } else if (step === 2) {
      if (!formData.description.trim()) {
        newErrors.description = 'Please describe the item.';
      } else if (formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters for effective matching.';
      }
    } else if (step === 3) {
      if (!formData.dateLost) {
        newErrors.dateLost = 'Please specify the date you lost the item.';
      } else {
        const today = new Date().toISOString().split('T')[0];
        if (formData.dateLost > today) {
          newErrors.dateLost = 'Date lost cannot be in the future.';
        }
      }
      if (!formData.building) {
        newErrors.building = 'Please specify the last known location building.';
      }
    } else if (step === 4) {
      // Photo is optional
    } else if (step === 5) {
      if (!formData.contact.fullName.trim()) {
        newErrors.fullName = 'Full name is required.';
      }
      if (!formData.contact.phone.trim()) {
        newErrors.phone = 'Phone number is required for tracking updates.';
      } else if (!/^[0-9+()\-.\s]{7,20}$/.test(formData.contact.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number format.';
      }
      if (!formData.contact.email.trim()) {
        newErrors.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email.trim())) {
        newErrors.email = 'Please enter a valid email address format.';
      }
      if (!formData.contact.studentId.trim()) {
        newErrors.studentId = 'Student or User ID is required.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const errorMsg = newErrors[firstKey];
      setLiveAnnouncement(`Error: ${errorMsg}`);

      // Auto-focus and scroll to first error
      setTimeout(() => {
        const element =
          document.getElementById(`lost-item-${firstKey}`) ||
          document.getElementById(`lost-${firstKey}`) ||
          document.getElementById(`lost-building-select`) ||
          document.querySelector(`[name="${firstKey}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (element as HTMLElement).focus();
        }
      }, 50);

      return false;
    }

    setLiveAnnouncement('');
    return true;
  };

  // Next Step Handler
  const handleNext = () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setShowNetworkBanner(true);
      setPendingAction(() => handleNext);
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < 6) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveDraft(nextStep, formData);
    } else {
      handleSubmitFinalReport();
    }
  };

  // Back Step Handler
  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setErrors({});
      saveDraft(prevStep, formData);
    } else if (onBackToSearch) {
      onBackToSearch();
    }
  };

  // Skip photo handler
  const handleSkipPhoto = () => {
    setCurrentStep(5);
    saveDraft(5, formData);
  };

  // Jump to specific step from Review
  const handleJumpToStep = (step: number) => {
    setCurrentStep(step);
    saveDraft(step, formData);
  };

  // Final Submit Report
  const handleSubmitFinalReport = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setShowNetworkBanner(true);
      setPendingAction(() => handleSubmitFinalReport);
      return;
    }

    // Full validation across all steps
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmittingStatusText('AI Match Engine scanning recent campus found records...');
    try {
      const res = await submitLostReport({
        category: formData.category,
        itemName: formData.itemName,
        description: formData.description,
        dateLost: formData.dateLost,
        timeLost: formData.timeLost,
        timePeriod: formData.timePeriod,
        location: {
          building: formData.building,
          area: formData.area,
        },
        photos: formData.photos,
        contact: formData.contact,
        notificationPreferences: formData.notificationPreferences,
      });

      // Clear draft on successful submission per spec
      clearDraft();

      // If matches were found, present the Match Results Drawer/Sheet
      if (res.matches && res.matches.length > 0) {
        setSubmittedTicketId(res.ticketId);
        setMatchResults(res.matches);
        setIsMatchDrawerOpen(true);
      } else {
        // Zero matches: proceed directly to normal ticket tracking
        router.push(`/lost/${res.ticketId}`);
      }
    } catch (err: any) {
      console.error('Submission failed', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setShowNetworkBanner(true);
        setPendingAction(() => handleSubmitFinalReport);
      } else {
        alert(err?.message || 'Submission failed. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
      setSubmittingStatusText('');
    }
  };

  const handleSelectCandidate = (candidate: MatchResultItem) => {
    // Map candidate to the ItemDetailDrawer item shape
    setSelectedCandidateItem({
      id: candidate.found_item_id,
      itemName: candidate.item_name,
      category: candidate.category,
      description: candidate.ai_reasoning || 'Turned in by campus finder.',
      type: 'found',
      dateFound: candidate.date_found,
      locationSummary: candidate.location_found,
      matchConfidence: candidate.confidence_label,
      confidenceScore: candidate.confidence_score,
      status: 'AVAILABLE',
    });
    setIsCandidateDetailOpen(true);
  };

  const handleProceedToTracking = () => {
    setIsMatchDrawerOpen(false);
    if (submittedTicketId) {
      router.push(`/lost/${submittedTicketId}`);
    }
  };

  // Handle Enter keypress for fast form advancement (excluding textarea)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto space-y-6"
      onKeyDown={handleKeyDown}
      onBlur={() => saveDraft(currentStep, formData)}
    >
      {/* Network drop banner */}
      {showNetworkBanner && (
        <div
          className="p-4 bg-red-50 border border-error/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-error animate-fade-in"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="font-semibold">
              Connection lost. Tap to retry submission
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="text-xs py-1.5 px-4 min-h-[36px] border-error/40 text-error hover:bg-red-100 whitespace-nowrap"
            onClick={() => {
              if (pendingAction) pendingAction();
              setShowNetworkBanner(false);
            }}
          >
            Tap to retry submission
          </Button>
        </div>
      )}

      {/* Resume Draft Banner */}
      {showDraftBanner && existingDraft && (
        <div
          className="p-4 bg-accent-light border border-accent/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm animate-fade-in"
          role="region"
          aria-label="Unfinished draft restoration"
        >
          <div className="space-y-0.5">
            <span className="font-bold text-text-primary block">
              Continue your unfinished report from {getDraftTimeFormatted(existingDraft.savedAt)}?
            </span>
            <span className="text-xs text-text-secondary block">
              Step {existingDraft.step} • {existingDraft.data.itemName || 'Untitled item'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              type="button"
              variant="primary"
              onClick={handleResumeDraft}
              className="text-xs py-2 px-4 min-h-[38px]"
            >
              Resume
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleDiscardDraft}
              className="text-xs py-2 px-4 min-h-[38px]"
            >
              Start Over
            </Button>
          </div>
        </div>
      )}

      {/* Wizard Progress Stepper */}
      <div className="bg-surface p-4 sm:p-5 rounded-lg border border-border shadow-sm">
        <WizardProgress currentStep={currentStep} totalSteps={6} />
      </div>

      {/* Screen Reader Error Announcement */}
      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Active Step Bento Card */}
      <div className="transition-all duration-200">
        {currentStep === 1 && (
          <ItemDetailsStep
            formData={{ category: formData.category, itemName: formData.itemName }}
            errors={errors}
            onChange={updateFormField}
            headingRef={headingRef}
          />
        )}

        {currentStep === 2 && (
          <DescriptionStep
            description={formData.description}
            error={errors.description}
            onChange={(val) => updateFormField('description', val)}
            headingRef={headingRef}
          />
        )}

        {currentStep === 3 && (
          <DateLocationStep
            formData={{
              dateLost: formData.dateLost,
              timeLost: formData.timeLost,
              timePeriod: formData.timePeriod,
              isTimeExact: formData.isTimeExact,
              building: formData.building,
              area: formData.area,
            }}
            errors={errors}
            onChange={updateFormField}
            headingRef={headingRef}
          />
        )}

        {currentStep === 4 && (
          <PhotoStep
            photos={formData.photos}
            onChange={(photos) => updateFormField('photos', photos)}
            headingRef={headingRef}
          />
        )}

        {currentStep === 5 && (
          <ContactStep
            contact={formData.contact}
            notificationPreferences={formData.notificationPreferences}
            errors={errors}
            onContactChange={updateContactField}
            onNotificationChange={updateNotificationField}
            headingRef={headingRef}
          />
        )}

        {currentStep === 6 && (
          <ReviewStep
            formData={formData}
            onJumpToStep={handleJumpToStep}
            headingRef={headingRef}
          />
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              ← Back
            </Button>
          ) : (
            onBackToSearch && (
              <Button
                type="button"
                variant="ghost"
                onClick={onBackToSearch}
                className="text-text-secondary"
              >
                ← Back
              </Button>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentStep === 4 && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkipPhoto}
              disabled={isSubmitting}
              className="text-text-secondary text-xs sm:text-sm"
            >
              Skip this step
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            isLoading={isSubmitting}
            className="px-8 min-h-[44px]"
          >
            {currentStep === 6 ? (isSubmitting ? 'Scanning Matches...' : 'Submit Report') : 'Next →'}
          </Button>
        </div>
      </div>

      {/* AI Matching Submitting Loading Overlay */}
      {isSubmitting && submittingStatusText && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4 animate-fade-in border border-black/7">
            <div className="w-12 h-12 rounded-full bg-[rgba(5,150,105,0.08)] flex items-center justify-center text-[#047857]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1C1B18]">Submitting & Matching</h3>
              <p className="text-xs text-[#6E6B5F] leading-relaxed">
                {submittingStatusText}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#047857]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing descriptions & location data</span>
            </div>
          </div>
        </div>
      )}

      {/* Match Results Drawer / Bottom Sheet */}
      <MatchResultsDrawer
        isOpen={isMatchDrawerOpen}
        matches={matchResults}
        ticketId={submittedTicketId}
        onSelectCandidate={handleSelectCandidate}
        onProceedToTracking={handleProceedToTracking}
      />

      {/* Existing ItemDetailDrawer for Claiming matched item */}
      {selectedCandidateItem && (
        <ItemDetailDrawer
          isOpen={isCandidateDetailOpen}
          item={selectedCandidateItem}
          onClose={() => setIsCandidateDetailOpen(false)}
        />
      )}
    </div>
  );
}

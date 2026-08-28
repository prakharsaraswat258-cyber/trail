"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { sampleItems, getItemById } from "./mock-item";

function ItemDetailsView() {
  const params = useParams();
  const router = useRouter();
  const currentId = params?.id || "itm_001";

  // State
  const [item, setItem] = useState(() => getItemById(currentId));
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Claim Form Modal / Drawer State
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimStep, setClaimStep] = useState(1); // 1: Ownership Proof, 2: Claimant Identity, 3: Result Pass
  const [selectedProofType, setSelectedProofType] = useState("challenge");
  const [proofFileUploaded, setProofFileUploaded] = useState(false);
  const [proofFileName, setProofFileName] = useState("");

  const [claimForm, setClaimForm] = useState({
    challengeAnswer: "",
    hiddenFeatures: "",
    lossLocation: "",
    lossDate: "",
    claimantName: "",
    studentId: "",
    contactPhone: "",
    contactEmail: "",
    affirmed: false,
  });

  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [claimResult, setClaimResult] = useState(null); // { verified: boolean, code: string, type: 'instant' | 'review' }

  // Update item when route param changes
  useEffect(() => {
    const loadedItem = getItemById(currentId);
    setItem(loadedItem);
    setSelectedPhotoIndex(0);
    setImageError(false);
    setIsClaimOpen(false);
    setClaimStep(1);
    setClaimResult(null);
    setAttempts(0);
    setIsLocked(false);
  }, [currentId]);

  // Format Found Date
  const formattedDate = new Date(item.foundAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Handle mock file upload for proof
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileUploaded(true);
      setProofFileName(file.name);
    }
  };

  // Step 1 validation
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!claimForm.challengeAnswer.trim()) {
      setErrorMessage("Please answer the security ownership challenge.");
      return;
    }
    if (!claimForm.hiddenFeatures.trim() && !proofFileUploaded) {
      setErrorMessage("Please describe unique identifying features or upload a proof document.");
      return;
    }
    setErrorMessage("");
    setClaimStep(2);
  };

  // Step 2 submission & verification engine
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!claimForm.claimantName.trim() || !claimForm.studentId.trim() || !claimForm.contactPhone.trim()) {
      setErrorMessage("Please fill in all required identity details.");
      return;
    }
    if (!claimForm.affirmed) {
      setErrorMessage("You must affirm that you are the rightful owner of this item.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    setTimeout(() => {
      setIsProcessing(false);
      const answer = claimForm.challengeAnswer.toLowerCase();
      const secret = item.verificationChallenge?.secretKeyword?.toLowerCase() || "";
      const altKeywords = item.verificationChallenge?.alternativeKeywords || [];

      // Check if claimant verified the secret challenge
      const isInstantMatch =
        answer.includes(secret) ||
        altKeywords.some((kw) => answer.includes(kw.toLowerCase())) ||
        claimForm.hiddenFeatures.toLowerCase().includes(secret) ||
        proofFileUploaded;

      if (isInstantMatch) {
        const otpPass = "PK-" + Math.floor(100000 + Math.random() * 900000);
        setItem((prev) => ({
          ...prev,
          status: "ready_for_pickup",
          statusLabel: "Ready for Pickup (Verified Pass)",
        }));
        setClaimResult({
          verified: true,
          type: "instant",
          code: otpPass,
          title: "Ownership Verified & Authorized",
          subtitle: "Digital Collection Pass Active",
          instructions: `Your ownership proof matched our inventory security records. Present this 6-digit OTP pass and your Student ID at ${item.holdingLocation} to collect your item.`,
        });
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);

        if (nextAttempts >= 2) {
          setIsLocked(true);
          setClaimResult({
            verified: false,
            type: "locked",
            code: "FRAUD-ALERT",
            title: "Security Lockout",
            subtitle: "Verification Failed",
            instructions: `Multiple verification attempts did not match. For security reasons, this online claim session is locked. Please visit ${item.holdingLocation} in person with physical proof of purchase or valid identification.`,
          });
        } else {
          const claimRef = "REV-" + Math.floor(100000 + Math.random() * 900000);
          setItem((prev) => ({
            ...prev,
            status: "claim_under_review",
            statusLabel: "Claim Under Desk Review",
          }));
          setClaimResult({
            verified: false,
            type: "review",
            code: claimRef,
            title: "Claim Submitted for Desk Review",
            subtitle: "Manual Verification Required",
            instructions: `Your details have been logged. The staff at ${item.holdingLocation} will physically verify your description and identification before releasing the item.`,
          });
        }
      }

      setClaimStep(3);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-canvas text-text-primary">
      <div className="max-w-[460px] mx-auto p-4 flex flex-col gap-3.5 pb-24">
        {/* Top Header & Item Selector */}
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-border">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-[14px] font-medium py-2 px-1 min-h-[44px]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back</span>
          </Link>

          {/* Quick Item Switcher for demonstration */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-text-muted font-medium">Switch Item:</span>
            <select
              value={item.id}
              onChange={(e) => router.push(`/item/${e.target.value}`)}
              className="bg-surface text-text-primary text-[12px] font-medium px-2 py-1 rounded-md border border-border outline-none cursor-pointer"
            >
              {sampleItems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.category}: {s.title.substring(0, 18)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1. Item Photo & Status Card */}
        <section className="bg-surface rounded-2xl border border-border p-4 flex flex-col gap-3 shadow-subtle">
          {/* Main Photo */}
          <div className="w-full aspect-[16/10] bg-surface-raised rounded-xl overflow-hidden relative border border-border flex items-center justify-center">
            {item.photos && item.photos.length > 0 && !imageError ? (
              <img
                src={item.photos[selectedPhotoIndex] || item.photos[0]}
                alt={item.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center text-text-muted">
                <svg className="w-12 h-12 text-text-muted/60 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-[12px] font-medium">Item Photo Preview</span>
              </div>
            )}

            {/* Status Pill */}
            <div className="absolute top-2.5 right-2.5 bg-surface/95 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-semibold text-text-primary border border-border shadow-sm flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  item.status === "ready_for_pickup"
                    ? "bg-success"
                    : item.status === "claim_under_review"
                    ? "bg-amber-500"
                    : "bg-accent"
                }`}
              />
              <span>{item.statusLabel || "In Custody"}</span>
            </div>
          </div>

          {/* Photo Thumbnails if multiple */}
          {item.photos && item.photos.length > 1 && !imageError && (
            <div className="flex gap-2">
              {item.photos.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border transition-all ${
                    selectedPhotoIndex === idx
                      ? "border-accent ring-2 ring-accent-light scale-95"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={photo} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 p-2 bg-surface-alt rounded-lg border border-border text-[12px] text-text-secondary">
            <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Confidential details & serials are hidden until ownership is verified.</span>
          </div>

          {/* Title & Description */}
          <div>
            <span className="text-[12px] font-bold text-accent uppercase tracking-wider">
              {item.category}
            </span>
            <h1 className="text-[20px] font-bold text-text-primary mt-0.5 leading-snug">
              {item.title}
            </h1>
            <p className="text-[14px] text-text-secondary mt-1.5 leading-relaxed">
              {item.description}
            </p>
          </div>
        </section>

        {/* 2. Found Location & Custody Details */}
        <section className="bg-surface rounded-2xl border border-border p-4 flex flex-col gap-3 shadow-subtle">
          <h2 className="text-[15px] font-bold text-text-primary">
            Custody & Location
          </h2>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Found Location */}
            <div className="flex items-start gap-3 p-3 bg-surface-alt rounded-xl border border-border">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-muted font-semibold uppercase">Found Location</span>
                <span className="text-[14px] font-semibold text-text-primary">
                  {item.location.building}, {item.location.floor}
                </span>
                <span className="text-[12px] text-text-secondary">{item.location.room}</span>
              </div>
            </div>

            {/* Found Time & Condition */}
            <div className="flex items-start gap-3 p-3 bg-surface-alt rounded-xl border border-border">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-muted font-semibold uppercase">Found Time</span>
                <span className="text-[14px] font-semibold text-text-primary">{formattedDate}</span>
                <span className="text-[12px] text-text-secondary">Condition: {item.condition}</span>
              </div>
            </div>

            {/* Holding Desk */}
            <div className="flex items-start gap-3 p-3 bg-surface-alt rounded-xl border border-border">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-muted font-semibold uppercase">Holding Location</span>
                <span className="text-[14px] font-semibold text-text-primary">{item.holdingLocation}</span>
                <span className="text-[12px] text-text-secondary">Operating Hours: {item.operatingHours}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Item Specifics Table */}
        <section className="bg-surface rounded-2xl border border-border p-4 flex flex-col gap-2.5 shadow-subtle">
          <h2 className="text-[15px] font-bold text-text-primary">
            Public Specifications
          </h2>

          <div className="divide-y divide-border">
            {Object.entries(item.specifics).map(([key, val]) => (
              <div key={key} className="py-2.5 flex items-center justify-between text-[13px]">
                <span className="text-text-secondary font-medium">{key}</span>
                <span className="text-text-primary font-semibold text-right max-w-[60%]">{val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Security Verification & Claim Action Card */}
        <section className="bg-accent-light rounded-2xl border border-accent/30 p-4 flex flex-col gap-3 shadow-subtle">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-text-primary">
                Are you the rightful owner?
              </h3>
              <p className="text-[13px] text-text-secondary mt-0.5 leading-relaxed">
                Provide proof of ownership and verify secret identifying markers to receive your secure pickup pass.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsClaimOpen(true);
              setClaimStep(1);
              setErrorMessage("");
            }}
            className="w-full min-h-[48px] bg-accent hover:bg-accent-hover text-white text-[15px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Verify & Claim Ownership</span>
          </button>
        </section>
      </div>

      {/* Structured Security & Ownership Verification Drawer */}
      {isClaimOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-[460px] bg-surface rounded-t-[24px] p-5 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  <h2 className="text-[17px] font-bold text-text-primary">
                    {claimStep === 1
                      ? "Step 1 of 2: Proof of Ownership"
                      : claimStep === 2
                      ? "Step 2 of 2: Claimant Identity"
                      : "Verification Authorization"}
                  </h2>
                </div>
                <p className="text-[12px] text-text-secondary mt-0.5">
                  {claimStep === 1
                    ? "Verify confidential details known only to the true owner"
                    : claimStep === 2
                    ? "Enter legal claimant identity and pickup credentials"
                    : "Security verification summary"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsClaimOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-alt -mr-2"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* STEP 1: Proof of Ownership & Security Challenge */}
            {claimStep === 1 && (
              <form onSubmit={handleNextStep} className="flex flex-col gap-3.5">
                {/* Security Challenge Card */}
                <div className="flex flex-col gap-1.5 bg-surface-alt p-3.5 rounded-xl border border-border">
                  <div className="flex items-center gap-1.5 text-accent text-[12px] font-bold uppercase tracking-wider">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Security Challenge Question</span>
                  </div>
                  <p className="text-[14px] font-bold text-text-primary mt-0.5">
                    {item.verificationChallenge?.question}
                  </p>
                  <span className="text-[11px] text-text-muted">
                    Hint: {item.verificationChallenge?.hint}
                  </span>
                </div>

                {/* Challenge Answer */}
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-text-primary">
                    Your Answer to Challenge *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter secret answer, initials, or matching detail..."
                    value={claimForm.challengeAnswer}
                    onChange={(e) =>
                      setClaimForm((prev) => ({
                        ...prev,
                        challengeAnswer: e.target.value,
                      }))
                    }
                    className="w-full min-h-[44px] px-3.5 text-[14px] bg-surface rounded-xl border border-border focus:border-accent outline-none"
                  />
                </div>

                {/* Proof Type Method */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-text-primary">
                    Additional Ownership Proof
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProofType("challenge")}
                      className={`p-2.5 rounded-xl border text-[12px] font-semibold text-left transition-all ${
                        selectedProofType === "challenge"
                          ? "border-accent bg-accent-light text-text-primary"
                          : "border-border bg-surface text-text-secondary"
                      }`}
                    >
                      ✍️ Describe Markings
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProofType("upload")}
                      className={`p-2.5 rounded-xl border text-[12px] font-semibold text-left transition-all ${
                        selectedProofType === "upload"
                          ? "border-accent bg-accent-light text-text-primary"
                          : "border-border bg-surface text-text-secondary"
                      }`}
                    >
                      📎 Upload Receipt / ID
                    </button>
                  </div>
                </div>

                {selectedProofType === "challenge" ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-text-secondary">
                      Describe Hidden Features / Contents *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe specific scratches, stickers, brand engravings, or internal contents..."
                      value={claimForm.hiddenFeatures}
                      onChange={(e) =>
                        setClaimForm((prev) => ({
                          ...prev,
                          hiddenFeatures: e.target.value,
                        }))
                      }
                      className="w-full p-3 text-[13px] bg-surface rounded-xl border border-border focus:border-accent outline-none resize-none"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-3 bg-surface-alt rounded-xl border border-dashed border-border-strong text-center">
                    <span className="text-[12px] text-text-secondary">
                      Upload purchase invoice, photo of you with the item, or Find My screenshot:
                    </span>
                    <input
                      type="file"
                      id="proof-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="proof-upload"
                      className="cursor-pointer mx-auto px-4 py-2 bg-surface rounded-lg border border-border text-[12px] font-bold text-accent hover:bg-surface-raised transition-colors"
                    >
                      {proofFileUploaded ? `✓ Attached: ${proofFileName}` : "Select File to Upload"}
                    </label>
                  </div>
                )}

                {errorMessage && (
                  <p className="text-[12px] text-error font-medium">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-accent hover:bg-accent-hover text-white text-[15px] font-bold rounded-xl flex items-center justify-center transition-colors shadow-md mt-1"
                >
                  Continue to Claimant Details →
                </button>
              </form>
            )}

            {/* STEP 2: Claimant Identity & Legal Affirmation */}
            {claimStep === 2 && (
              <form onSubmit={handleFinalSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-text-primary">
                    Full Legal / Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={claimForm.claimantName}
                    onChange={(e) =>
                      setClaimForm((prev) => ({
                        ...prev,
                        claimantName: e.target.value,
                      }))
                    }
                    className="w-full min-h-[44px] px-3.5 text-[14px] bg-surface rounded-xl border border-border focus:border-accent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-bold text-text-primary">
                      Student ID / Roll No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STU-84920"
                      value={claimForm.studentId}
                      onChange={(e) =>
                        setClaimForm((prev) => ({
                          ...prev,
                          studentId: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] px-3 text-[13px] bg-surface rounded-xl border border-border focus:border-accent outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-bold text-text-primary">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 555-0192"
                      value={claimForm.contactPhone}
                      onChange={(e) =>
                        setClaimForm((prev) => ({
                          ...prev,
                          contactPhone: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] px-3 text-[13px] bg-surface rounded-xl border border-border focus:border-accent outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-text-secondary">
                      Approx Date Lost
                    </label>
                    <input
                      type="date"
                      value={claimForm.lossDate}
                      onChange={(e) =>
                        setClaimForm((prev) => ({
                          ...prev,
                          lossDate: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] px-3 text-[13px] bg-surface rounded-xl border border-border focus:border-accent outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-text-secondary">
                      Where did you lose it?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2nd Floor Study"
                      value={claimForm.lossLocation}
                      onChange={(e) =>
                        setClaimForm((prev) => ({
                          ...prev,
                          lossLocation: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] px-3 text-[13px] bg-surface rounded-xl border border-border focus:border-accent outline-none"
                    />
                  </div>
                </div>

                {/* Legal Affirmation */}
                <div className="p-3 bg-surface-alt rounded-xl border border-border flex items-start gap-2.5 mt-1">
                  <input
                    type="checkbox"
                    id="affirmation"
                    required
                    checked={claimForm.affirmed}
                    onChange={(e) =>
                      setClaimForm((prev) => ({
                        ...prev,
                        affirmed: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 mt-0.5 rounded border-border text-accent focus:ring-accent cursor-pointer shrink-0"
                  />
                  <label htmlFor="affirmation" className="text-[11px] text-text-secondary leading-snug cursor-pointer">
                    I solemnly declare under penalty of campus disciplinary record that I am the genuine rightful owner of this item and all provided proof is accurate.
                  </label>
                </div>

                {errorMessage && (
                  <p className="text-[12px] text-error font-medium">{errorMessage}</p>
                )}

                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setClaimStep(1)}
                    className="w-1/3 min-h-[48px] bg-surface-raised hover:bg-surface-alt text-text-primary text-[14px] font-bold rounded-xl flex items-center justify-center transition-colors border border-border"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 min-h-[48px] bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-[15px] font-bold rounded-xl flex items-center justify-center transition-colors shadow-md"
                  >
                    {isProcessing ? "Verifying Proof..." : "Submit & Authorize Claim"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Verification Result & Official Pass */}
            {claimStep === 3 && claimResult && (
              <div className="flex flex-col items-center gap-3.5 py-2 text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    claimResult.verified ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                  }`}
                >
                  {claimResult.verified ? (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                </div>

                {/* Digital Pass / Code Box */}
                <div className="w-full bg-surface-alt p-4 rounded-2xl border border-border flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {claimResult.verified ? "Official Security Pickup OTP" : "Claim Tracking Reference"}
                  </span>
                  <span className="text-[28px] font-mono font-extrabold text-accent tracking-widest bg-surface px-4 py-1.5 rounded-xl border border-border">
                    {claimResult.code}
                  </span>
                  <span className="text-[12px] text-text-secondary">
                    Claimant: <strong className="text-text-primary">{claimForm.claimantName}</strong> ({claimForm.studentId})
                  </span>
                </div>

                <p className="text-[13px] text-text-secondary leading-relaxed px-1">
                  {claimResult.instructions}
                </p>

                {/* Collection Directions Box */}
                <div className="w-full bg-surface-alt p-3.5 rounded-xl text-left text-[12px] flex flex-col gap-1 border border-border">
                  <span className="font-bold text-text-primary">Desk Collection Checklist:</span>
                  <span className="text-text-secondary">📍 Desk: {item.holdingLocation}</span>
                  <span className="text-text-secondary">🕒 Hours: {item.operatingHours}</span>
                  <span className="text-text-primary font-medium mt-1">
                    ✓ Bring Student ID Card: <span className="underline">{claimForm.studentId}</span>
                  </span>
                  <span className="text-text-primary font-medium">
                    ✓ Show this OTP: <span className="font-mono font-bold text-accent">{claimResult.code}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsClaimOpen(false)}
                  className="w-full min-h-[46px] bg-accent hover:bg-accent-hover text-white text-[15px] font-bold rounded-xl flex items-center justify-center transition-colors mt-2"
                >
                  Done & Close Pass
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function ItemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas p-4" />}>
      <ItemDetailsView />
    </Suspense>
  );
}

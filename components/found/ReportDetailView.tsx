import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Edit3,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Shield,
  MessageSquare,
  Mail,
  Phone,
  Building,
  Check,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { FoundItemRecord, FoundItemFormData, FoundItemPayload } from "@/lib/types/foundItem";
import { BentoCard } from "@/components/ui/BentoCard";
import { Button } from "@/components/ui/Button";
import { KarmaBadge } from "./KarmaBadge";
import { FoundPhotoUploader } from "./FoundPhotoUploader";
import { ItemInfoFields } from "./ItemInfoFields";
import { LocationFields } from "./LocationFields";
import { DateTimeFields } from "./DateTimeFields";
import { DescriptionField } from "./DescriptionField";
import { ItemStatusToggle } from "./ItemStatusToggle";
import { ContactMethodFields } from "./ContactMethodFields";
import { updateFoundItem, markItemAsReturned } from "@/lib/api/foundItems";

interface ReportDetailViewProps {
  initialReport: FoundItemRecord;
}

export const ReportDetailView: React.FC<ReportDetailViewProps> = ({ initialReport }) => {
  const [report, setReport] = useState<FoundItemRecord>(initialReport);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmReturn, setShowConfirmReturn] = useState(false);
  const [isMarkingReturned, setIsMarkingReturned] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState<FoundItemFormData>({
    itemName: initialReport.itemName,
    category: initialReport.category as any,
    photos: initialReport.photos,
    location: initialReport.location,
    dateFound: initialReport.dateFound,
    timeFound: initialReport.timeFound || "",
    timePeriod: initialReport.timePeriod || "afternoon",
    useCoarseTime: Boolean(initialReport.timePeriod && !initialReport.timeFound),
    description: initialReport.description,
    status: initialReport.status,
    handoffDesk: initialReport.handoffDesk?.startsWith("Other: ")
      ? "Other"
      : initialReport.handoffDesk || "",
    handoffDeskOther: initialReport.handoffDesk?.startsWith("Other: ")
      ? initialReport.handoffDesk.replace("Other: ", "")
      : "",
    hideDetails: initialReport.hideDetails,
    contactMethod: initialReport.contactMethod,
    contactDetail: initialReport.contactDetail || "",
  });

  const isReturned = report.currentStatus === "returned";

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates: Partial<FoundItemPayload> = {
        itemName: editData.itemName.trim(),
        category: editData.category,
        photos: editData.photos,
        location: {
          building: editData.location.building.trim(),
          floor: editData.location.floor?.trim() || undefined,
          landmarkOrRoom: editData.location.landmarkOrRoom?.trim() || undefined,
        },
        dateFound: editData.dateFound,
        timeFound: !editData.useCoarseTime ? editData.timeFound : undefined,
        timePeriod: editData.useCoarseTime ? editData.timePeriod : undefined,
        description: editData.description.trim(),
        status: editData.status,
        handoffDesk:
          editData.status === "handed_over"
            ? editData.handoffDesk === "Other"
              ? `Other: ${editData.handoffDeskOther?.trim()}`
              : editData.handoffDesk
            : undefined,
        hideDetails: editData.hideDetails,
        contactMethod: editData.contactMethod,
        contactDetail:
          editData.contactMethod !== "in_app_chat" ? editData.contactDetail?.trim() : undefined,
      };

      const updated = await updateFoundItem(report.id, updates);
      setReport(updated);
      setIsEditing(false);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err) {
      console.error("Save edit failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReturn = async () => {
    setIsMarkingReturned(true);
    try {
      const res = await markItemAsReturned(report.id);
      setReport((prev) => ({
        ...prev,
        currentStatus: "returned",
        returnedAt: res.returnedAt,
      }));
      setShowConfirmReturn(false);
    } catch (err) {
      console.error("Failed to mark returned:", err);
    } finally {
      setIsMarkingReturned(false);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto pb-16 space-y-5">
      {/* Navigation Header */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/found"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary p-1 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Report Form</span>
        </Link>
        <KarmaBadge label="Campus Hero" points={10} />
      </div>

      {/* Save Success Notice */}
      {saveSuccessNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-success/30 text-xs text-success font-medium flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>Your changes have been saved successfully.</span>
        </div>
      )}

      {/* Main Header Bento Card */}
      <BentoCard className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Reference Code
            </span>
            <span className="font-mono text-lg font-bold text-text-primary tracking-wider">
              {report.referenceCode}
            </span>
          </div>

          <div>
            {isReturned ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Returned to Owner</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-accent-light text-accent border border-accent/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Found Report</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        {!isReturned && !isEditing && (
          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              className="gap-1.5 text-xs py-2 flex-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Report</span>
            </Button>

            {!showConfirmReturn ? (
              <Button
                variant="secondary"
                onClick={() => setShowConfirmReturn(true)}
                className="gap-1.5 text-xs py-2 flex-1 border-success/30 hover:bg-emerald-50 text-success"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Returned</span>
              </Button>
            ) : (
              <div className="flex-1 p-2 rounded-lg bg-surface-alt border border-border flex items-center justify-between gap-2 text-xs">
                <span className="text-text-primary font-medium">Close report?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleConfirmReturn}
                    disabled={isMarkingReturned}
                    className="px-2.5 py-1 bg-success text-white rounded font-semibold text-xs hover:bg-emerald-700"
                  >
                    {isMarkingReturned ? "..." : "Yes, Return"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReturn(false)}
                    className="px-2 py-1 bg-surface border border-border text-text-secondary rounded text-xs hover:bg-surface-raised"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isReturned && (
          <div className="p-3 bg-emerald-50 border border-success/20 rounded-md text-xs text-success font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>This item was marked as returned. Thank you for making campus better!</span>
          </div>
        )}
      </BentoCard>

      {/* Editing Mode */}
      {isEditing && (
        <form onSubmit={handleSaveEdit} className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-text-primary">Edit Report Details</h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-text-secondary hover:text-text-primary underline"
            >
              Cancel Edit
            </button>
          </div>

          <BentoCard>
            <FoundPhotoUploader
              photos={editData.photos}
              onChange={(photos) => setEditData((prev) => ({ ...prev, photos }))}
            />
          </BentoCard>

          <BentoCard>
            <ItemInfoFields
              itemName={editData.itemName}
              category={editData.category}
              onItemNameChange={(val) => setEditData((prev) => ({ ...prev, itemName: val }))}
              onCategoryChange={(val) => setEditData((prev) => ({ ...prev, category: val }))}
            />
          </BentoCard>

          <BentoCard>
            <LocationFields
              location={editData.location}
              onChange={(location) => setEditData((prev) => ({ ...prev, location }))}
            />
          </BentoCard>

          <BentoCard>
            <DateTimeFields
              dateFound={editData.dateFound}
              timeFound={editData.timeFound}
              timePeriod={editData.timePeriod}
              useCoarseTime={editData.useCoarseTime}
              onDateChange={(val) => setEditData((prev) => ({ ...prev, dateFound: val }))}
              onTimeChange={(val) => setEditData((prev) => ({ ...prev, timeFound: val }))}
              onTimePeriodChange={(val) => setEditData((prev) => ({ ...prev, timePeriod: val }))}
              onToggleCoarseTime={(val) => setEditData((prev) => ({ ...prev, useCoarseTime: val }))}
            />
          </BentoCard>

          <BentoCard>
            <DescriptionField
              value={editData.description}
              onChange={(val) => setEditData((prev) => ({ ...prev, description: val }))}
            />
          </BentoCard>

          <BentoCard>
            <ItemStatusToggle
              status={editData.status}
              handoffDesk={editData.handoffDesk}
              handoffDeskOther={editData.handoffDeskOther}
              hideDetails={editData.hideDetails}
              onStatusChange={(val) => setEditData((prev) => ({ ...prev, status: val }))}
              onHandoffDeskChange={(val) => setEditData((prev) => ({ ...prev, handoffDesk: val }))}
              onHandoffDeskOtherChange={(val) =>
                setEditData((prev) => ({ ...prev, handoffDeskOther: val }))
              }
              onHideDetailsChange={(val) =>
                setEditData((prev) => ({ ...prev, hideDetails: val }))
              }
            />
          </BentoCard>

          <BentoCard>
            <ContactMethodFields
              method={editData.contactMethod}
              detail={editData.contactDetail || ""}
              onMethodChange={(val) => setEditData((prev) => ({ ...prev, contactMethod: val }))}
              onDetailChange={(val) => setEditData((prev) => ({ ...prev, contactDetail: val }))}
            />
          </BentoCard>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" isLoading={isSaving} fullWidth>
              Save Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Read-Only Display Mode (Same Bento grouping) */}
      {!isEditing && (
        <div className="space-y-4">
          {/* Photos */}
          <BentoCard>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Item Photos ({report.photos.length})
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {report.photos.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg border border-border overflow-hidden bg-surface-alt"
                >
                  <Image
                    src={src}
                    alt={`Found item photo ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 33vw, 150px"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Item Name & Category */}
          <BentoCard className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                Item Name & Category
              </span>
              <h2 className="text-xl font-bold text-text-primary">{report.itemName}</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-surface-alt border border-border text-text-primary">
              <span>Category:</span>
              <strong className="text-accent">{report.category}</strong>
            </div>
          </BentoCard>

          {/* Location */}
          <BentoCard className="space-y-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Location Found
            </span>
            <div className="flex items-start gap-2.5 text-sm text-text-primary">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">{report.location.building}</span>
                {(report.location.floor || report.location.landmarkOrRoom) && (
                  <span className="text-xs text-text-secondary block mt-0.5">
                    {[report.location.floor, report.location.landmarkOrRoom]
                      .filter(Boolean)
                      .join(" • ")}
                  </span>
                )}
              </div>
            </div>
          </BentoCard>

          {/* Date & Time */}
          <BentoCard className="space-y-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Date & Time Found
            </span>
            <div className="flex items-center gap-4 text-sm text-text-primary">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent" />
                <span>{report.dateFound}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent" />
                <span className="capitalize">
                  {report.timeFound || report.timePeriod || "Not specified"}
                </span>
              </div>
            </div>
          </BentoCard>

          {/* Description */}
          <BentoCard className="space-y-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Description
            </span>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </BentoCard>

          {/* Status & Privacy */}
          <BentoCard className="space-y-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Current Possession & Privacy
            </span>
            <div className="flex items-center gap-2 text-sm text-text-primary">
              <Building className="w-4 h-4 text-accent" />
              <span>
                {report.status === "with_finder"
                  ? "Finder currently has the item"
                  : `Handed over to: ${report.handoffDesk || "Campus Desk"}`}
              </span>
            </div>

            {report.hideDetails && (
              <div className="p-3 rounded-md bg-accent-light/40 border border-accent/20 text-xs text-text-primary flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Sensitive details are hidden from public preview.</span>
              </div>
            )}
          </BentoCard>

          {/* Contact Method */}
          <BentoCard className="space-y-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Contact Method
            </span>
            <div className="flex items-center gap-2 text-sm text-text-primary">
              {report.contactMethod === "in_app_chat" && (
                <>
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <span>In-app Anonymous Chat</span>
                </>
              )}
              {report.contactMethod === "email" && (
                <>
                  <Mail className="w-4 h-4 text-accent" />
                  <span>{report.contactDetail || "Email specified"}</span>
                </>
              )}
              {report.contactMethod === "phone" && (
                <>
                  <Phone className="w-4 h-4 text-accent" />
                  <span>{report.contactDetail || "Phone specified"}</span>
                </>
              )}
            </div>
          </BentoCard>
        </div>
      )}
    </div>
  );
};

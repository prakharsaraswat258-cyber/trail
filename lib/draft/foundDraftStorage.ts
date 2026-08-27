import { FoundItemFormData, FoundItemPayload } from "../types/foundItem";

const DRAFT_STORAGE_KEY = "penga:found-draft";
const OFFLINE_QUEUE_KEY = "penga:found-offline-queue";

export interface FoundDraft {
  formData: FoundItemFormData;
  savedAt: number;
}

export function saveFoundDraft(formData: FoundItemFormData): void {
  if (typeof window === "undefined") return;
  try {
    const draft: FoundDraft = {
      formData,
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.warn("Failed to save draft to localStorage:", error);
  }
}

export function getFoundDraft(): FoundDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FoundDraft;
    if (parsed && parsed.formData) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn("Failed to retrieve draft from localStorage:", error);
    return null;
  }
}

export function clearFoundDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear draft:", error);
  }
}

export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
}

// Offline queue helpers
export function enqueueOfflineReport(payload: FoundItemPayload): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const list: FoundItemPayload[] = raw ? JSON.parse(raw) : [];
    list.push(payload);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(list));
  } catch (error) {
    console.warn("Failed to enqueue offline report:", error);
  }
}

export function getOfflineQueue(): FoundItemPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.warn("Failed to clear offline queue:", error);
  }
}

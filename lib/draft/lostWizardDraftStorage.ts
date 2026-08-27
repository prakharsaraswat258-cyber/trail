export interface LostWizardFormData {
  category: string;
  itemName: string;
  description: string;
  dateLost: string;
  timeLost?: string;
  timePeriod?: 'morning' | 'afternoon' | 'evening' | 'night';
  isTimeExact: boolean;
  building: string;
  area?: string;
  photos: string[];
  contact: {
    fullName: string;
    phone: string;
    email: string;
    studentId: string;
  };
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

export interface LostWizardDraft {
  step: number;
  data: LostWizardFormData;
  savedAt: string;
}

const STORAGE_KEY = 'penga:lost-draft';

export function saveDraft(step: number, data: LostWizardFormData): void {
  if (typeof window === 'undefined') return;
  try {
    const draft: LostWizardDraft = {
      step,
      data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    console.error('Failed to save draft to localStorage', err);
  }
}

export function loadDraft(): LostWizardDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return null;
    return JSON.parse(item) as LostWizardDraft;
  } catch (err) {
    console.error('Failed to parse draft from localStorage', err);
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to remove draft from localStorage', err);
  }
}

export function hasDraft(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_KEY);
}

export function getDraftTimeFormatted(savedAt?: string): string {
  if (!savedAt) return 'recently';
  try {
    const now = new Date().getTime();
    const then = new Date(savedAt).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return new Date(savedAt).toLocaleDateString();
  } catch {
    return 'recently';
  }
}

import { ItemCategory } from "../constants/itemCategories";

export type TimePeriod = "morning" | "afternoon" | "evening" | "night";
export type FoundItemStatus = "with_finder" | "handed_over" | "returned";
export type ContactMethod = "in_app_chat" | "email" | "phone";

export interface FoundLocation {
  building: string;
  floor?: string;
  landmarkOrRoom?: string;
  geoDetected?: boolean;
}

export interface FoundItemFormData {
  itemName: string;
  category: ItemCategory | "";
  photos: string[];
  location: FoundLocation;
  dateFound: string; // YYYY-MM-DD
  timeFound?: string; // HH:MM
  timePeriod?: TimePeriod;
  useCoarseTime: boolean;
  description: string;
  status: "with_finder" | "handed_over";
  handoffDesk?: string;
  handoffDeskOther?: string;
  hideDetails: boolean;
  contactMethod: ContactMethod;
  contactDetail?: string;
}

export interface FoundItemPayload {
  itemName: string;
  category: string;
  photos: string[];
  location: {
    building: string;
    floor?: string;
    landmarkOrRoom?: string;
    geoDetected?: boolean;
  };
  dateFound: string;
  timeFound?: string;
  timePeriod?: TimePeriod;
  description: string;
  status: "with_finder" | "handed_over";
  handoffDesk?: string;
  hideDetails: boolean;
  contactMethod: ContactMethod;
  contactDetail?: string;
}

export interface FoundItemResponse {
  id: string;
  referenceCode: string;
  createdAt: string;
  immediateMatchFound: boolean;
  matchCount?: number;
  report?: FoundItemRecord;
}

export interface FoundItemRecord extends FoundItemPayload {
  id: string;
  referenceCode: string;
  createdAt: string;
  updatedAt?: string;
  currentStatus: FoundItemStatus;
  returnedAt?: string;
}

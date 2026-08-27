import { LostWizardFormData } from '../draft/lostWizardDraftStorage';

export interface FoundSearchResult {
  id: string;
  itemName: string;
  category: string;
  thumbnailUrl?: string;
  foundLocationSummary: string;
  foundDate: string;
}

export interface SubmitLostReportPayload {
  category: string;
  itemName: string;
  description: string;
  dateLost: string;
  timeLost?: string;
  timePeriod?: 'morning' | 'afternoon' | 'evening' | 'night';
  location: { building: string; area?: string };
  photos?: string[];
  contact: {
    fullName: string;
    phone: string;
    email: string;
    studentId: string;
  };
  notificationPreferences: { email: boolean; sms: boolean; inApp: boolean };
}

export interface SubmitLostReportResponse {
  id: string;
  ticketId: string;
  createdAt: string;
  status: 'submitted';
  trackingUrl: string;
}

export interface TicketStatusResponse {
  ticketId: string;
  status: 'submitted' | 'under_review' | 'potential_match' | 'resolved';
  summary: {
    itemName: string;
    category: string;
    description: string;
    location: string;
    dateLost: string;
  };
  contact?: {
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
  createdAt: string;
  updatedAt: string;
}

// Mock seed found items for quick search
const MOCK_FOUND_SEARCH_DATABASE: FoundSearchResult[] = [
  {
    id: 'f-1',
    itemName: 'Apple iPhone 15 Pro (Titanium Blue)',
    category: 'Electronics',
    thumbnailUrl: '',
    foundLocationSummary: 'Central Library 2nd Floor Study Room',
    foundDate: '2026-08-26',
  },
  {
    id: 'f-2',
    itemName: 'Brown Leather Bifold Wallet',
    category: 'Wallet',
    thumbnailUrl: '',
    foundLocationSummary: 'Campus Dining Hall near table 14',
    foundDate: '2026-08-26',
  },
  {
    id: 'f-3',
    itemName: 'Hydro Flask 32oz Water Bottle (Olive Green)',
    category: 'Water Bottle',
    thumbnailUrl: '',
    foundLocationSummary: 'Athletic Center Bleachers',
    foundDate: '2026-08-25',
  },
  {
    id: 'f-4',
    itemName: 'AirPods Pro 2 in Matte Black Case',
    category: 'Electronics',
    thumbnailUrl: '',
    foundLocationSummary: 'Science Complex Room 102',
    foundDate: '2026-08-27',
  },
  {
    id: 'f-5',
    itemName: 'Student ID & Key Lanyard (Red Ribbon)',
    category: 'ID/Card',
    thumbnailUrl: '',
    foundLocationSummary: 'Student Union Information Desk',
    foundDate: '2026-08-27',
  },
  {
    id: 'f-6',
    itemName: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics',
    thumbnailUrl: '',
    foundLocationSummary: 'Arts & Humanities Building Lobby',
    foundDate: '2026-08-24',
  },
];

const TICKETS_STORAGE_KEY = 'penga:submitted-tickets';

function getStoredTickets(): Record<string, TicketStatusResponse> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredTicket(ticket: TicketStatusResponse) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredTickets();
    current[ticket.ticketId] = ticket;
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save ticket in storage', err);
  }
}

/**
 * Quick search debounced query against found items
 * TODO: replace mock with live API (GET /api/found-items/search?q=...)
 */
export async function searchFoundItems(query: string): Promise<{ results: FoundSearchResult[] }> {
  // Simulate brief network latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return { results: [] };
  }

  // Filter mock database
  const matches = MOCK_FOUND_SEARCH_DATABASE.filter((item) => {
    return (
      item.itemName.toLowerCase().includes(cleanQuery) ||
      item.category.toLowerCase().includes(cleanQuery) ||
      item.foundLocationSummary.toLowerCase().includes(cleanQuery)
    );
  }).slice(0, 5);

  return { results: matches };
}

/**
 * Submit lost item report
 * TODO: replace mock with live API (POST /api/lost-items)
 */
export async function submitLostReport(
  payload: SubmitLostReportPayload
): Promise<SubmitLostReportResponse> {
  // Simulate brief network latency
  await new Promise((resolve) => setTimeout(resolve, 200));

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const ticketId = `LST-2026-${randomDigits}`;
  const now = new Date().toISOString();
  const id = `lost-${Date.now()}`;

  const locationStr = payload.location.area
    ? `${payload.location.building} (${payload.location.area})`
    : payload.location.building;

  const ticketData: TicketStatusResponse = {
    ticketId,
    status: 'submitted',
    summary: {
      itemName: payload.itemName,
      category: payload.category,
      description: payload.description,
      location: locationStr,
      dateLost: payload.dateLost,
    },
    contact: payload.contact,
    notificationPreferences: payload.notificationPreferences,
    createdAt: now,
    updatedAt: now,
  };

  saveStoredTicket(ticketData);

  return {
    id,
    ticketId,
    createdAt: now,
    status: 'submitted',
    trackingUrl: `/lost/${ticketId}`,
  };
}

/**
 * Fetch ticket status for tracking
 * TODO: replace mock with live API (GET /api/lost-items/:ticketId)
 */
export async function getTicketStatus(ticketId: string): Promise<TicketStatusResponse> {
  // Simulate brief network latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  const tickets = getStoredTickets();
  if (tickets[ticketId]) {
    return tickets[ticketId];
  }

  // Fallback demo ticket if loaded directly without prior submission in session
  const fallbackTicket: TicketStatusResponse = {
    ticketId,
    status: 'under_review',
    summary: {
      itemName: 'Apple iPhone 15 Pro',
      category: 'Electronics',
      description: 'Titanium Blue, clear case with Golden Retriever dog sticker on back.',
      location: 'Central Library (2nd Floor Study Room)',
      dateLost: '2026-08-26',
    },
    contact: {
      fullName: 'Alex Mercer',
      phone: '+1 (555) 234-5678',
      email: 'alex.mercer@campus.edu',
      studentId: 'STU-98214',
    },
    notificationPreferences: {
      email: true,
      sms: true,
      inApp: true,
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  };

  return fallbackTicket;
}

/**
 * Update notification preferences
 * TODO: replace mock with live API (PATCH /api/lost-items/:ticketId/notifications)
 */
export async function updateNotificationPreferences(
  ticketId: string,
  preferences: { email: boolean; sms: boolean; inApp: boolean }
): Promise<{ success: boolean; preferences: { email: boolean; sms: boolean; inApp: boolean } }> {
  // Simulate brief network latency
  await new Promise((resolve) => setTimeout(resolve, 150));

  const tickets = getStoredTickets();
  if (tickets[ticketId]) {
    tickets[ticketId].notificationPreferences = preferences;
    tickets[ticketId].updatedAt = new Date().toISOString();
    saveStoredTicket(tickets[ticketId]);
  }

  return { success: true, preferences };
}

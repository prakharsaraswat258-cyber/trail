import { LostWizardFormData } from '../draft/lostWizardDraftStorage';

export interface FoundSearchResult {
  id: string;
  itemName: string;
  category: string;
  itemType?: string;
  color?: string;
  brand?: string;
  description?: string;
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

// Mock seed found items for quick search with rich attributes (Item Name, Brand, Type, Color, Location)
const MOCK_FOUND_SEARCH_DATABASE: FoundSearchResult[] = [
  {
    id: 'f-mac-1',
    itemName: 'Apple MacBook Pro 96W USB-C Power Adapter',
    category: 'Electronics',
    itemType: 'Laptop Charger',
    color: 'White',
    brand: 'Apple',
    description: 'White Apple 96W USB-C power brick with standard 2m USB-C charging cable.',
    thumbnailUrl: '',
    foundLocationSummary: 'Central Library 2nd Floor Study Desk 14',
    foundDate: '2026-08-28',
  },
  {
    id: 'f-mac-2',
    itemName: 'Apple MagSafe 3 MacBook Air Charger (Space Gray)',
    category: 'Electronics',
    itemType: 'Laptop Charger',
    color: 'Space Gray',
    brand: 'Apple',
    description: 'Braided Space Gray MagSafe 3 charging cable attached to 35W Dual USB-C port adapter.',
    thumbnailUrl: '',
    foundLocationSummary: 'Science Complex Room 204 Computer Lab',
    foundDate: '2026-08-27',
  },
  {
    id: 'f-mac-3',
    itemName: 'Anker 67W 3-Port USB-C Fast Charger',
    category: 'Electronics',
    itemType: 'Laptop Charger',
    color: 'Black',
    brand: 'Anker',
    description: 'Compact black GaN charger suitable for MacBook Air/Pro, with black nylon braided cable.',
    thumbnailUrl: '',
    foundLocationSummary: 'Campus Dining Hall near Booth 8',
    foundDate: '2026-08-27',
  },
  {
    id: 'f-mac-4',
    itemName: 'Apple MacBook Pro 14" (Space Gray)',
    category: 'Electronics',
    itemType: 'Laptop',
    color: 'Space Gray',
    brand: 'Apple',
    description: 'M2 MacBook Pro in matte protective case with programming stickers.',
    thumbnailUrl: '',
    foundLocationSummary: 'Engineering & Technology Hall Room 302',
    foundDate: '2026-08-26',
  },
  {
    id: 'f-1',
    itemName: 'Apple iPhone 15 Pro (Titanium Blue)',
    category: 'Electronics',
    itemType: 'Smartphone',
    color: 'Titanium Blue',
    brand: 'Apple',
    description: 'Blue titanium finish with clear silicone protective bumper case.',
    thumbnailUrl: '',
    foundLocationSummary: 'Central Library 2nd Floor Study Room',
    foundDate: '2026-08-26',
  },
  {
    id: 'f-2',
    itemName: 'Brown Leather Bifold Wallet',
    category: 'Wallet',
    itemType: 'Wallet',
    color: 'Brown',
    brand: 'Fossil',
    description: 'Distressed brown leather bifold wallet with campus card slot.',
    thumbnailUrl: '',
    foundLocationSummary: 'Campus Dining Hall near table 14',
    foundDate: '2026-08-26',
  },
  {
    id: 'f-3',
    itemName: 'Hydro Flask 32oz Water Bottle (Olive Green)',
    category: 'Water Bottle',
    itemType: 'Water Bottle',
    color: 'Olive Green',
    brand: 'Hydro Flask',
    description: 'Olive green powder coated bottle with flex straw cap and national park decal.',
    thumbnailUrl: '',
    foundLocationSummary: 'Athletic Center Bleachers',
    foundDate: '2026-08-25',
  },
  {
    id: 'f-4',
    itemName: 'AirPods Pro 2 in Matte Black Case',
    category: 'Electronics',
    itemType: 'Headphones',
    color: 'Black',
    brand: 'Apple',
    description: 'AirPods Pro 2nd Gen inside a Spigen matte black rugged silicone sleeve.',
    thumbnailUrl: '',
    foundLocationSummary: 'Science Complex Room 102',
    foundDate: '2026-08-27',
  },
  {
    id: 'f-5',
    itemName: 'Student ID & Key Lanyard (Red Ribbon)',
    category: 'ID/Card',
    itemType: 'ID Card / Keys',
    color: 'Red',
    brand: 'Campus Union',
    description: 'Red lanyard with 2 brass keys, bicycle lock key, and plastic ID badge holder.',
    thumbnailUrl: '',
    foundLocationSummary: 'Student Union Information Desk',
    foundDate: '2026-08-27',
  },
  {
    id: 'f-6',
    itemName: 'Sony WH-1000XM5 Wireless Headphones (Silver/White)',
    category: 'Electronics',
    itemType: 'Headphones',
    color: 'White',
    brand: 'Sony',
    description: 'Silver/Off-White noise canceling over-ear headphones in original gray zipper case.',
    thumbnailUrl: '',
    foundLocationSummary: 'Arts & Humanities Building Lobby',
    foundDate: '2026-08-24',
  },
  {
    id: 'f-7',
    itemName: 'Dell 65W Type-C AC Power Adapter',
    category: 'Electronics',
    itemType: 'Laptop Charger',
    color: 'Black',
    brand: 'Dell',
    description: 'Standard black Dell Type-C laptop charger with rubber strap.',
    thumbnailUrl: '',
    foundLocationSummary: 'Main Academic Hall Room 110',
    foundDate: '2026-08-28',
  },
  {
    id: 'f-8',
    itemName: 'ASUS ROG Gaming Backpack (Black/Red)',
    category: 'Bag',
    itemType: 'Backpack',
    color: 'Black',
    brand: 'ASUS',
    description: 'Black backpack with red trim, containing notebook and USB cables.',
    thumbnailUrl: '',
    foundLocationSummary: 'Athletic Center Locker Room Hallway',
    foundDate: '2026-08-25',
  }
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
 * Quick search query against found items with multi-keyword, color, type, and brand filtering
 */
export async function searchFoundItems(
  query: string,
  selectedCategory?: string,
  selectedColor?: string
): Promise<{ results: FoundSearchResult[] }> {
  // Simulate brief network latency
  await new Promise((resolve) => setTimeout(resolve, 80));

  const cleanQuery = query.trim().toLowerCase();
  const tokens = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

  if (tokens.length === 0 && (!selectedCategory || selectedCategory === 'All') && (!selectedColor || selectedColor === 'All')) {
    return { results: [] };
  }

  // Filter mock database using multi-token and attribute search
  const matches = MOCK_FOUND_SEARCH_DATABASE.filter((item) => {
    // Check Category filter
    if (
      selectedCategory &&
      selectedCategory !== 'All' &&
      item.category.toLowerCase() !== selectedCategory.toLowerCase() &&
      item.itemType?.toLowerCase() !== selectedCategory.toLowerCase()
    ) {
      return false;
    }

    // Check Color filter
    if (
      selectedColor &&
      selectedColor !== 'All' &&
      (!item.color || !item.color.toLowerCase().includes(selectedColor.toLowerCase()))
    ) {
      return false;
    }

    // If no text query but filters match
    if (tokens.length === 0) {
      return true;
    }

    // Combine all item attributes into a single searchable string
    const searchableContent = [
      item.itemName,
      item.category,
      item.itemType || '',
      item.color || '',
      item.brand || '',
      item.description || '',
      item.foundLocationSummary
    ].join(' ').toLowerCase();

    // Check that every token typed is matched in the item's attributes
    return tokens.every((token) => searchableContent.includes(token));
  });

  // Sort by relevance (exact phrase match or title match at top)
  matches.sort((a, b) => {
    const aText = `${a.itemName} ${a.color || ''} ${a.itemType || ''}`.toLowerCase();
    const bText = `${b.itemName} ${b.color || ''} ${b.itemType || ''}`.toLowerCase();

    const aExact = cleanQuery && aText.includes(cleanQuery);
    const bExact = cleanQuery && bText.includes(cleanQuery);

    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });

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

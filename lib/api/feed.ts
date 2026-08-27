import { ItemCategory } from '../constants/itemCategories';

export type ReportType = 'lost' | 'found';
export type MatchStatus = 'none' | 'maybe' | 'matched';

export interface FeedPost {
  id: string;
  type: ReportType;
  ticketId?: string; // present for lost reports
  category: ItemCategory;
  itemName: string;
  descriptionSnippet: string;
  photoUrl?: string;
  location: string;
  timestamp: string; // ISO string or relative
  matchStatus?: MatchStatus;
  matchConfidence?: number; // 0-100
}

export interface FeedResponse {
  posts: FeedPost[];
  nextCursor?: string;
}

export interface FeedQueryParams {
  type?: 'all' | 'lost' | 'found';
  category?: string;
  q?: string;
  cursor?: string;
  limit?: number;
}

// TODO: replace mock with live API
const MOCK_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    type: 'found',
    category: 'Electronics',
    itemName: 'Space Grey AirPods Pro (2nd Gen)',
    descriptionSnippet: 'Found in charging case near 2nd floor silent study carrels. Has a small scuff on the hinge.',
    photoUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80',
    location: 'Main Library 2F',
    timestamp: '2026-08-27T21:45:00Z',
    matchStatus: 'matched',
    matchConfidence: 94,
  },
  {
    id: 'post-2',
    type: 'lost',
    ticketId: 'PNG-84920',
    category: 'Keys',
    itemName: 'Brass Carabiner with 4 Keys & Blue Tag',
    descriptionSnippet: 'Lost between Engineering Quad and Student Union. Attached to a matte black Nite Ize S-biner.',
    location: 'Engineering Quad',
    timestamp: '2026-08-27T20:15:00Z',
    matchStatus: 'maybe',
    matchConfidence: 68,
  },
  {
    id: 'post-3',
    type: 'found',
    category: 'Wallet',
    itemName: 'Brown Leather Bifold Wallet',
    descriptionSnippet: 'Found on bench outside Science Lecture Hall B. Contains cards under name Alex M.',
    location: 'Science Lecture Hall B',
    timestamp: '2026-08-27T19:30:00Z',
    matchStatus: 'none',
  },
  {
    id: 'post-4',
    type: 'lost',
    ticketId: 'PNG-84918',
    category: 'Bag',
    itemName: 'Black Patagonia 28L Refugio Backpack',
    descriptionSnippet: 'Left in Room 304 after 3 PM CS lecture. Contains a spiral notebook and water bottle.',
    photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
    location: 'Computer Science Hall Room 304',
    timestamp: '2026-08-27T17:00:00Z',
    matchStatus: 'matched',
    matchConfidence: 88,
  },
  {
    id: 'post-5',
    type: 'found',
    category: 'Water Bottle',
    itemName: '32oz Sage Green Hydro Flask',
    descriptionSnippet: 'Found on the treadmill console in the fitness center. Has several national park stickers.',
    photoUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80',
    location: 'Campus Recreation Gym',
    timestamp: '2026-08-27T15:20:00Z',
    matchStatus: 'none',
  },
  {
    id: 'post-6',
    type: 'lost',
    ticketId: 'PNG-84915',
    category: 'ID/Card',
    itemName: 'Student ID Card & Metro Pass',
    descriptionSnippet: 'Lost around the campus shuttle stop near North Gate. Name starts with Sarah K.',
    location: 'North Gate Transit Hub',
    timestamp: '2026-08-27T14:10:00Z',
    matchStatus: 'maybe',
    matchConfidence: 62,
  },
  {
    id: 'post-7',
    type: 'found',
    category: 'Clothing',
    itemName: 'Navy Blue Arc\'teryx Windbreaker (Size M)',
    descriptionSnippet: 'Left on the back of a chair at the campus cafe patio table.',
    location: 'University Center Cafe',
    timestamp: '2026-08-27T12:00:00Z',
    matchStatus: 'none',
  },
  {
    id: 'post-8',
    type: 'lost',
    ticketId: 'PNG-84909',
    category: 'Jewelry',
    itemName: 'Silver Chain Bracelet with Small Star Charm',
    descriptionSnippet: 'Sentimental value! Slipped off wrist either during lab or walking across central lawn.',
    location: 'Central Lawn / Biology Lab',
    timestamp: '2026-08-27T10:30:00Z',
    matchStatus: 'none',
  },
  {
    id: 'post-9',
    type: 'found',
    category: 'Notebook',
    itemName: 'Black Leuchtturm1917 Dot Grid Journal',
    descriptionSnippet: 'Found in Design Studio A. Front cover has gold foil initials "J.D." and project notes.',
    location: 'Design Studio A',
    timestamp: '2026-08-26T22:15:00Z',
    matchStatus: 'maybe',
    matchConfidence: 75,
  },
  {
    id: 'post-10',
    type: 'lost',
    ticketId: 'PNG-84898',
    category: 'Electronics',
    itemName: 'iPad Air 5th Gen (Starlight) with Apple Pencil',
    descriptionSnippet: 'In a magnetic navy folio case. Left on table 4 at the main floor cafe.',
    photoUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&auto=format&fit=crop&q=80',
    location: 'Ground Floor Coffee Shop',
    timestamp: '2026-08-26T18:40:00Z',
    matchStatus: 'matched',
    matchConfidence: 92,
  },
  {
    id: 'post-11',
    type: 'found',
    category: 'Keys',
    itemName: 'Toyota Car Key Fob with Red Lanyard',
    descriptionSnippet: 'Handed to parking booth attendant at Lot C after evening classes.',
    location: 'Parking Structure Lot C',
    timestamp: '2026-08-26T16:20:00Z',
    matchStatus: 'none',
  },
  {
    id: 'post-12',
    type: 'lost',
    ticketId: 'PNG-84880',
    category: 'Other',
    itemName: 'TI-84 Plus CE Graphing Calculator',
    descriptionSnippet: 'Mint green color with name etched faintly on back panel. Needed for upcoming midterm.',
    location: 'Math & Stats Hall Rm 112',
    timestamp: '2026-08-26T13:00:00Z',
    matchStatus: 'none',
  },
];

export async function fetchFeed(params: FeedQueryParams = {}): Promise<FeedResponse> {
  const { type = 'all', category = '', q = '', cursor, limit = 5 } = params;

  // Simulate realistic network delay
  await new Promise((resolve) => setTimeout(resolve, 350));

  let filtered = [...MOCK_POSTS];

  // Filter by Type
  if (type !== 'all') {
    filtered = filtered.filter((post) => post.type === type);
  }

  // Filter by Category
  if (category && category !== 'All' && category !== 'All Categories') {
    filtered = filtered.filter((post) => post.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by Search Query
  if (q.trim()) {
    const query = q.toLowerCase().trim();
    filtered = filtered.filter(
      (post) =>
        post.itemName.toLowerCase().includes(query) ||
        post.descriptionSnippet.toLowerCase().includes(query) ||
        post.location.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
    );
  }

  // Pagination logic using cursor (index-based cursor for mock)
  const startIndex = cursor ? parseInt(cursor, 10) : 0;
  const endIndex = startIndex + limit;
  const paginatedPosts = filtered.slice(startIndex, endIndex);
  const nextCursor = endIndex < filtered.length ? endIndex.toString() : undefined;

  return {
    posts: paginatedPosts,
    nextCursor,
  };
}

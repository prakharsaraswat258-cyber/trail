export interface BrowseItem {
  id: string;
  ticketId?: string;
  title: string;
  category: string;
  zone: string;
  timeAgo: string;
  photoUrl: string;
  type: 'lost' | 'found';
  matchConfidence: 'strong' | 'possible' | 'weak' | null;
  status: 'active' | 'claimed' | 'resolved';
  description?: string;
}

export const MOCK_ITEMS: BrowseItem[] = [
  {
    id: 'item-1',
    title: 'Hydro Flask 32oz Wide Mouth (Cobalt Blue)',
    category: 'Bottles & Tumblers',
    zone: 'Student Center · 2nd Floor',
    timeAgo: '20m ago',
    photoUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    type: 'found',
    matchConfidence: 'strong',
    status: 'active',
  },
  {
    id: 'item-2',
    title: 'Apple AirPods Pro Gen 2 in MagSafe Case',
    category: 'Audio & Tech',
    zone: 'Library · 3rd Floor Quiet Study',
    timeAgo: '45m ago',
    photoUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    type: 'lost',
    matchConfidence: 'strong',
    status: 'active',
  },
  {
    id: 'item-3',
    title: 'Set of 3 Keys with Red Carabiner & Bike Key',
    category: 'Keys & IDs',
    zone: 'Engineering Quad · Bike Racks',
    timeAgo: '1h ago',
    photoUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    type: 'found',
    matchConfidence: 'possible',
    status: 'active',
  },
  {
    id: 'item-4',
    title: 'Black Leather Bifold Wallet with Student ID',
    category: 'Wallets & Bags',
    zone: 'Dining Commons · North Booth',
    timeAgo: '3h ago',
    photoUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    type: 'lost',
    matchConfidence: 'possible',
    status: 'claimed',
  },
  {
    id: 'item-5',
    title: 'TI-84 Plus CE Graphing Calculator (Black)',
    category: 'Electronics',
    zone: 'Math Building · Room 204',
    timeAgo: '5h ago',
    photoUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    type: 'found',
    matchConfidence: 'weak',
    status: 'active',
  },
  {
    id: 'item-6',
    title: 'North Face Puffer Jacket (Charcoal Gray, M)',
    category: 'Clothing & Apparel',
    zone: 'Recreation Center · Locker Room',
    timeAgo: '8h ago',
    photoUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
    type: 'lost',
    matchConfidence: 'weak',
    status: 'resolved',
  },
  {
    id: 'item-7',
    title: 'Tortoise Shell Prescription Glasses in Brown Case',
    category: 'Accessories',
    zone: 'Chemistry Lab · Hallway Bench',
    timeAgo: '1d ago',
    photoUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
    type: 'found',
    matchConfidence: null,
    status: 'active',
  },
  {
    id: 'item-8',
    title: 'Graphite Pencil Pouch with Prismacolor Pens',
    category: 'Art & Stationery',
    zone: 'Architecture Studio · Studio A',
    timeAgo: '2d ago',
    photoUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
    type: 'lost',
    matchConfidence: null,
    status: 'claimed',
  },
  {
    id: 'item-9',
    title: 'Patec USB-C 65W Laptop Charger',
    category: 'Electronics',
    zone: 'Science Center · Café Corner',
    timeAgo: '3d ago',
    photoUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    type: 'found',
    matchConfidence: null,
    status: 'resolved',
  },
];

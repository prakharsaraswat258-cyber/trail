export const ITEM_CATEGORIES = [
  'Electronics',
  'Bag',
  'ID/Card',
  'Clothing',
  'Jewelry',
  'Keys',
  'Water Bottle',
  'Notebook',
  'Wallet',
  'Other',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

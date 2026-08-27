/**
 * Shared Item Categories Enum & List
 * MUST BE IDENTICAL to the categories used across Penga (e.g. /lost)
 * Matching engine weights Category Alignment at 25%.
 */
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

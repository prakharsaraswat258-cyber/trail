/**
 * Shared Item Categories Enum & List
 * MUST BE IDENTICAL to the categories used across LPU Find (e.g. /lost)
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

export interface CategoryInfo {
  id: ItemCategory;
  label: string;
  iconName: string;
}

export const CATEGORY_DETAILS: Record<ItemCategory, { label: string; iconName: string }> = {
  Electronics: { label: 'Electronics', iconName: 'Laptop' },
  Bag: { label: 'Bag', iconName: 'Briefcase' },
  'ID/Card': { label: 'ID / Card', iconName: 'CreditCard' },
  Clothing: { label: 'Clothing', iconName: 'Shirt' },
  Jewelry: { label: 'Jewelry', iconName: 'Watch' },
  Keys: { label: 'Keys', iconName: 'Key' },
  'Water Bottle': { label: 'Water Bottle', iconName: 'Coffee' },
  Notebook: { label: 'Notebook', iconName: 'BookOpen' },
  Wallet: { label: 'Wallet', iconName: 'Wallet' },
  Other: { label: 'Other', iconName: 'Package' },
};

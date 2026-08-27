export const CAMPUS_BUILDINGS = [
  'Central Library',
  'Science Complex',
  'Student Union Information Desk',
  'Athletic Center',
  'Main Academic Hall',
  'Arts & Humanities Building',
  'Engineering & Technology Hall',
  'Campus Dining Hall',
  'North Campus Study Center',
  'Security Desk 1 (Main Entrance)',
  'Security Desk 2 (North Gate)',
  'Administration Center',
] as const;

export type CampusBuilding = (typeof CAMPUS_BUILDINGS)[number];

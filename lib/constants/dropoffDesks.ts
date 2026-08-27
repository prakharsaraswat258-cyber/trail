export const DROPOFF_DESKS = [
  "Library Helpdesk",
  "Security Post / Public Safety",
  "Campus Center Info Desk",
  "Recreation Center Front Desk",
  "Dining Commons Supervisor Desk",
  "Department Main Office",
  "Other",
] as const;

export type DropoffDesk = (typeof DROPOFF_DESKS)[number];

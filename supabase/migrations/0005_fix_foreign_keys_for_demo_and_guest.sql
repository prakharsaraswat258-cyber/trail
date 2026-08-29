-- Migration 0005: Ensure lost_reports and found_items allow guest and demo user submissions without foreign key failure
alter table public.lost_reports alter column user_id drop not null;
alter table public.found_items alter column user_id drop not null;

-- Drop foreign key constraint on user_id so client-side demo users or guest submissions never trigger fkey violation
alter table public.lost_reports drop constraint if exists lost_reports_user_id_fkey;
alter table public.found_items drop constraint if exists found_items_user_id_fkey;

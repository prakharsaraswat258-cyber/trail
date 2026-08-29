-- Migration 0009: Ensure claims table allows guest and demo user submissions without foreign key failure on claimant_id
alter table public.claims alter column claimant_id drop not null;
alter table public.claims drop constraint if exists claims_claimant_id_fkey;


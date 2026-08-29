-- Migration 0002: Enable public search, guest submissions, and ticket lookups safely

-- 1. Make user_id nullable for guest submissions
alter table public.found_items alter column user_id drop not null;
alter table public.lost_reports alter column user_id drop not null;

-- 2. Allow submissions
drop policy if exists "found_items_insert_own" on public.found_items;
drop policy if exists "found_items_insert_all" on public.found_items;
create policy "found_items_insert_all" on public.found_items for insert with check (true);

drop policy if exists "lost_reports_insert_own" on public.lost_reports;
drop policy if exists "lost_reports_insert_all" on public.lost_reports;
create policy "lost_reports_insert_all" on public.lost_reports for insert with check (true);

-- 3. Allow public searching and viewing of lost and found reports
drop policy if exists "lost_reports_select_own" on public.lost_reports;
drop policy if exists "lost_reports_select_all" on public.lost_reports;
create policy "lost_reports_select_all" on public.lost_reports for select using (true);

drop policy if exists "found_items_select_all" on public.found_items;
create policy "found_items_select_all" on public.found_items for select using (true);

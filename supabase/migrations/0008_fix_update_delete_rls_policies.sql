-- Migration 0008: Enable UPDATE and DELETE permissions on found_items, lost_reports, claims, matches, and notifications
-- Fixes permission denied errors when editing, deleting, resolving, or bumping posts in demo / guest / client sessions.

-- 1. found_items: Allow UPDATE and DELETE
drop policy if exists "found_items_update_own" on public.found_items;
drop policy if exists "found_items_update_all" on public.found_items;
create policy "found_items_update_all" on public.found_items for update using (true);

drop policy if exists "found_items_delete_own" on public.found_items;
drop policy if exists "found_items_delete_all" on public.found_items;
create policy "found_items_delete_all" on public.found_items for delete using (true);

-- 2. lost_reports: Allow UPDATE and DELETE
drop policy if exists "lost_reports_update_own" on public.lost_reports;
drop policy if exists "lost_reports_update_all" on public.lost_reports;
create policy "lost_reports_update_all" on public.lost_reports for update using (true);

drop policy if exists "lost_reports_delete_own" on public.lost_reports;
drop policy if exists "lost_reports_delete_all" on public.lost_reports;
create policy "lost_reports_delete_all" on public.lost_reports for delete using (true);

-- 3. claims: Allow SELECT, INSERT, UPDATE, and DELETE
drop policy if exists "claims_select_involved" on public.claims;
drop policy if exists "claims_select_all" on public.claims;
create policy "claims_select_all" on public.claims for select using (true);

drop policy if exists "claims_insert_own" on public.claims;
drop policy if exists "claims_insert_all" on public.claims;
create policy "claims_insert_all" on public.claims for insert with check (true);

drop policy if exists "claims_update_item_owner" on public.claims;
drop policy if exists "claims_update_all" on public.claims;
create policy "claims_update_all" on public.claims for update using (true);

drop policy if exists "claims_delete_all" on public.claims;
create policy "claims_delete_all" on public.claims for delete using (true);

-- 4. matches: Allow SELECT, INSERT, UPDATE, and DELETE
drop policy if exists "matches_select_involved" on public.matches;
drop policy if exists "matches_select_all" on public.matches;
create policy "matches_select_all" on public.matches for select using (true);

drop policy if exists "matches_insert_all" on public.matches;
create policy "matches_insert_all" on public.matches for insert with check (true);

drop policy if exists "matches_update_all" on public.matches;
create policy "matches_update_all" on public.matches for update using (true);

drop policy if exists "matches_delete_all" on public.matches;
create policy "matches_delete_all" on public.matches for delete using (true);

-- 5. notifications: Allow SELECT, INSERT, UPDATE, and DELETE
drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "notifications_select_all" on public.notifications;
create policy "notifications_select_all" on public.notifications for select using (true);

drop policy if exists "notifications_insert_all" on public.notifications;
create policy "notifications_insert_all" on public.notifications for insert with check (true);

drop policy if exists "notifications_update_own" on public.notifications;
drop policy if exists "notifications_update_all" on public.notifications;
create policy "notifications_update_all" on public.notifications for update using (true);

drop policy if exists "notifications_delete_all" on public.notifications;
create policy "notifications_delete_all" on public.notifications for delete using (true);

-- Migration 0002: Allow public search and viewing of lost reports so ticket IDs and community feed work
drop policy if exists "lost_reports_select_own" on public.lost_reports;
create policy "lost_reports_select_all" on public.lost_reports for select using (true);

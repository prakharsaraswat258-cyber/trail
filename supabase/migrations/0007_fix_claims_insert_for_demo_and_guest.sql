-- Allow claim submissions for guest and demo users where server-side auth.uid() is null (mirrors migration 0002 for found_items/lost_reports)
drop policy if exists "claims_insert_own" on public.claims;
create policy "claims_insert_own" on public.claims for insert with check (true);

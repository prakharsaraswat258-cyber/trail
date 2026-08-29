-- LPU Find — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor, on a fresh or existing project.
-- Order matters: run top to bottom in one go.

create extension if not exists "pgcrypto";

-- =========================================================
-- 1. PROFILES (extends auth.users)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  student_id text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- 2. FOUND ITEMS  (mirrors FoundItemPayload / FoundItemRecord)
-- =========================================================
create table public.found_items (
  id uuid primary key default gen_random_uuid(),
  reference_code text unique not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_name text not null,
  category text not null check (category in ('Electronics','Bag','ID/Card','Clothing','Jewelry','Keys','Water Bottle','Notebook','Wallet','Other')),
  photos text[] not null default '{}',
  location_building text not null,
  location_floor text,
  location_landmark_or_room text,
  location_geo_detected boolean not null default false,
  date_found date not null,
  time_found time,
  time_period text check (time_period in ('morning','afternoon','evening','night')),
  description text not null,
  status text not null default 'with_finder'
    check (status in ('with_finder','handed_over','returned')),
  handoff_desk text,
  handoff_desk_other text,
  hide_details boolean not null default false,
  contact_method text not null check (contact_method in ('in_app_chat','email','phone')),
  contact_detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  returned_at timestamptz
);

create index found_items_category_idx on public.found_items(category);
create index found_items_status_idx on public.found_items(status);
create index found_items_created_at_idx on public.found_items(created_at desc);
create index found_items_user_id_idx on public.found_items(user_id);

-- =========================================================
-- 3. LOST REPORTS  (mirrors SubmitLostReportPayload / TicketStatusResponse)
-- =========================================================
create table public.lost_reports (
  id uuid primary key default gen_random_uuid(),
  ticket_id text unique not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('Electronics','Bag','ID/Card','Clothing','Jewelry','Keys','Water Bottle','Notebook','Wallet','Other')),
  item_name text not null,
  description text not null,
  date_lost date not null,
  time_lost time,
  time_period text check (time_period in ('morning','afternoon','evening','night')),
  location_building text not null,
  location_area text,
  photos text[] not null default '{}',
  contact_full_name text not null,
  contact_phone text not null,
  contact_email text not null,
  contact_student_id text not null,
  notify_email boolean not null default true,
  notify_sms boolean not null default true,
  notify_in_app boolean not null default true,
  status text not null default 'submitted'
    check (status in ('submitted','under_review','potential_match','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lost_reports_user_id_idx on public.lost_reports(user_id);
create index lost_reports_ticket_id_idx on public.lost_reports(ticket_id);
create index lost_reports_status_idx on public.lost_reports(status);

-- =========================================================
-- 4. MATCHES  (replaces the Math.random() stub)
-- =========================================================
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  lost_report_id uuid not null references public.lost_reports(id) on delete cascade,
  found_item_id uuid not null references public.found_items(id) on delete cascade,
  confidence_score int not null check (confidence_score between 0 and 100),
  status text not null default 'suggested'
    check (status in ('suggested','confirmed','dismissed')),
  created_at timestamptz not null default now(),
  unique (lost_report_id, found_item_id)
);

create index matches_lost_report_idx on public.matches(lost_report_id);
create index matches_found_item_idx on public.matches(found_item_id);

-- band thresholds match the existing FeedPostCard logic exactly:
-- >=80 -> 'strong' (High Match), 50-79 -> 'possible' (Potential Match), <50 -> 'weak' (Low Match)

-- =========================================================
-- 5. CLAIMS  (mirrors ClaimModal + MyPostRecord.claim_requests)
-- =========================================================
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  found_item_id uuid not null references public.found_items(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  contact text not null,
  proof text not null,
  status text not null default 'PENDING'
    check (status in ('PENDING','APPROVED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index claims_found_item_idx on public.claims(found_item_id);
create index claims_claimant_idx on public.claims(claimant_id);

-- =========================================================
-- 6. NOTIFICATIONS
-- =========================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx on public.notifications(user_id, read);

-- =========================================================
-- 7. updated_at auto-touch trigger (shared)
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger found_items_set_updated_at
  before update on public.found_items
  for each row execute procedure public.set_updated_at();

create trigger lost_reports_set_updated_at
  before update on public.lost_reports
  for each row execute procedure public.set_updated_at();

create trigger claims_set_updated_at
  before update on public.claims
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- 8. UNIFIED FEED VIEW  (powers /browse and /my-posts)
-- =========================================================
create or replace view public.posts_feed as
select
  f.id,
  'found'::text as type,
  f.user_id,
  f.item_name as title,
  f.category,
  f.location_building || coalesce(', ' || f.location_floor, '') as location_summary,
  f.photos,
  case
    when f.status = 'returned' then 'RESOLVED'
    when exists (select 1 from public.claims c where c.found_item_id = f.id and c.status = 'PENDING') then 'IN_CLAIM'
    else 'OPEN'
  end as display_status,
  f.description,
  f.created_at,
  f.updated_at
from public.found_items f
union all
select
  l.id,
  'lost'::text as type,
  l.user_id,
  l.item_name as title,
  l.category,
  l.location_building || coalesce(', ' || l.location_area, '') as location_summary,
  l.photos,
  case
    when l.status = 'resolved' then 'RESOLVED'
    when l.status = 'potential_match' then 'IN_CLAIM'
    else 'OPEN'
  end as display_status,
  l.description,
  l.created_at,
  l.updated_at
from public.lost_reports l;

-- =========================================================
-- 9. ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles enable row level security;
alter table public.found_items enable row level security;
alter table public.lost_reports enable row level security;
alter table public.matches enable row level security;
alter table public.claims enable row level security;
alter table public.notifications enable row level security;

-- profiles: everyone can read display info, only self can edit
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- found_items: publicly browsable (this is the whole point of Lost & Found),
-- but only the owner can create/edit/delete their own report.
-- NOTE: contact_detail can still be read by anyone with table access — see
-- found_items_public below for the version the frontend should actually query
-- when hide_details = true or contactMethod != 'in_app_chat'.
create policy "found_items_select_all" on public.found_items for select using (true);
create policy "found_items_insert_own" on public.found_items for insert with check (auth.uid() = user_id);
create policy "found_items_update_own" on public.found_items for update using (auth.uid() = user_id);
create policy "found_items_delete_own" on public.found_items for delete using (auth.uid() = user_id);

-- lost_reports: PII-heavy (full name, phone, email, student ID) — owner-only, full stop.
create policy "lost_reports_select_own" on public.lost_reports for select using (auth.uid() = user_id);
create policy "lost_reports_insert_own" on public.lost_reports for insert with check (auth.uid() = user_id);
create policy "lost_reports_update_own" on public.lost_reports for update using (auth.uid() = user_id);
create policy "lost_reports_delete_own" on public.lost_reports for delete using (auth.uid() = user_id);

-- matches: visible to whoever owns either side of the match
create policy "matches_select_involved" on public.matches for select using (
  auth.uid() in (
    select user_id from public.lost_reports where id = lost_report_id
    union
    select user_id from public.found_items where id = found_item_id
  )
);

-- claims: claimant sees their own claims, found-item owner sees claims on their item
create policy "claims_select_involved" on public.claims for select using (
  auth.uid() = claimant_id
  or auth.uid() in (select user_id from public.found_items where id = found_item_id)
);
create policy "claims_insert_own" on public.claims for insert with check (auth.uid() = claimant_id);

-- only the found-item owner can approve/reject a claim
create policy "claims_update_item_owner" on public.claims for update using (
  auth.uid() in (select user_id from public.found_items where id = found_item_id)
);

-- notifications: strictly own
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);

-- =========================================================
-- 10. PUBLIC SAFE VIEW for found_items (strips contact_detail)
--     Frontend should query THIS for browse/feed/search — not the raw table —
--     whenever it's showing an item to someone who isn't the owner.
-- =========================================================
create or replace view public.found_items_public as
select
  id, reference_code, user_id, item_name, category, photos,
  location_building, location_floor, location_landmark_or_room, location_geo_detected,
  date_found, time_found, time_period, description, status,
  handoff_desk, hide_details, contact_method,
  case when hide_details then null else contact_detail end as contact_detail,
  created_at, updated_at, returned_at
from public.found_items;

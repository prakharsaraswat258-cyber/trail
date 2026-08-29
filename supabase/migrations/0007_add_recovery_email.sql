-- Migration 0007: Add recovery email, student_id unique constraint, and update trigger for registration numbers
-- 1. Add recovery_email column to public.profiles
alter table public.profiles add column if not exists recovery_email text;

-- 2. Enforce student_id (registration number) uniqueness
alter table public.profiles drop constraint if exists profiles_student_id_unique;
alter table public.profiles add constraint profiles_student_id_unique unique (student_id);

-- 3. Extend handle_new_user trigger to populate student_id and recovery_email from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, student_id, recovery_email)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'student_id',
    coalesce(new.raw_user_meta_data ->> 'recovery_email', new.email)
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    student_id = coalesce(excluded.student_id, public.profiles.student_id),
    recovery_email = coalesce(excluded.recovery_email, public.profiles.recovery_email);
  return new;
end;
$$ language plpgsql security definer;

-- 4. Update seed demo user student_id to 'DEMO0001'
update public.profiles
set student_id = 'DEMO0001',
    recovery_email = 'demo@lpu.in',
    full_name = 'Prakhar Saraswat'
where email = 'demo@lpu.in' or id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

update auth.users
set raw_user_meta_data = jsonb_set(
  coalesce(raw_user_meta_data, '{}'::jsonb),
  '{student_id}',
  '"DEMO0001"'
)
where email = 'demo@lpu.in' or id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

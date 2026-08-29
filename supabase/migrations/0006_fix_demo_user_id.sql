-- Migration 0006: Fix seed demo user ID to a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
-- Ensures the standard demo user ID documented across the repo exists in auth.users and public.profiles.

do $$
declare
  target_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  old_id uuid := 'c9468c25-6a4b-44e5-8ad9-ee89304cde7d';
begin
  -- 1. If old randomly-generated demo user exists and target does not, update id
  if exists (select 1 from auth.users where id = old_id) and not exists (select 1 from auth.users where id = target_id) then
    update public.profiles set id = target_id where id = old_id;
    update auth.identities set id = target_id::text, user_id = target_id where user_id = old_id;
    update auth.users set id = target_id, email_confirmed_at = coalesce(email_confirmed_at, now()) where id = old_id;
  elsif not exists (select 1 from auth.users where id = target_id) then
    -- 2. Insert fresh pre-confirmed demo user
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      target_id,
      'authenticated',
      'authenticated',
      'demo@lpu.in',
      crypt('Password@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Prakhar Saraswat"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      target_id::text,
      target_id,
      json_build_object('sub', target_id::text, 'email', 'demo@lpu.in'),
      'email',
      now(),
      now(),
      now()
    )
    on conflict (provider, id) do nothing;
  end if;

  -- 3. Ensure profile row exists in public.profiles for target_id
  insert into public.profiles (id, email, full_name, student_id, phone)
  values (
    target_id,
    'demo@lpu.in',
    'Prakhar Saraswat',
    '12345678',
    '+91 9876543210'
  )
  on conflict (id) do update
  set full_name = 'Prakhar Saraswat', email = 'demo@lpu.in', student_id = '12345678', phone = '+91 9876543210';
end $$;

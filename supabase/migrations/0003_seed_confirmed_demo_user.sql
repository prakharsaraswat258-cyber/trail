-- Migration 0003: Seed pre-confirmed demo user in Supabase Auth
-- This bypasses email rate limits and enables instant password sign-in.

do $$
declare
  demo_user_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
begin
  -- 1. If demo@lpu.in already exists, update and confirm it with the password
  if exists (select 1 from auth.users where email = 'demo@lpu.in') then
    update auth.users
    set
      encrypted_password = crypt('Password@123', gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now(),
      raw_user_meta_data = '{"full_name":"Prakhar Saraswat"}'::jsonb,
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb
    where email = 'demo@lpu.in';
  else
    -- 2. Otherwise insert fresh pre-confirmed demo user
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
      demo_user_id,
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

    -- Ensure identity record exists for email provider
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      demo_user_id,
      demo_user_id,
      json_build_object('sub', demo_user_id::text, 'email', 'demo@lpu.in'),
      'email',
      now(),
      now(),
      now()
    )
    on conflict (provider, id) do nothing;
  end if;

  -- 3. Ensure profile row exists in public.profiles
  insert into public.profiles (id, email, full_name, student_id, phone)
  select
    u.id,
    u.email,
    'Prakhar Saraswat',
    '12345678',
    '+91 9876543210'
  from auth.users u
  where u.email = 'demo@lpu.in'
  on conflict (id) do update
  set full_name = 'Prakhar Saraswat', email = 'demo@lpu.in';
end $$;

/**
 * ============================================================================
 * WARNING: NEVER import this file from any 'use client' component or any code
 * that ships to the browser. This file initializes a Supabase client with the
 * service_role key, which bypasses Row Level Security (RLS) with full admin
 * privileges. Server-route use only.
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

export function createServiceRoleClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY — check your server environment variables or .env.local'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

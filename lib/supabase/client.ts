import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umnntiasrtqamgjfxzit.supabase.co';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbm50aWFzcnRxYW1namZ4eml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NDMzODYsImV4cCI6MjEwMzMxOTM4Nn0.rX-rFsom7sQLPCT6pV1frEOz86k8QjxUzTtluP4CtFw';

  return createBrowserClient(url, key);
}

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umnntiasrtqamgjfxzit.supabase.co';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbm50aWFzcnRxYW1namZ4eml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NDMzODYsImV4cCI6MjEwMzMxOTM4Nn0.rX-rFsom7sQLPCT6pV1frEOz86k8QjxUzTtluP4CtFw';

  const client = createBrowserClient(url, key);

  if (typeof window !== 'undefined') {
    const originalGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = async (jwt?: string) => {
      const demoUserStr = localStorage.getItem('lpu_find_demo_user');
      if (demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr);
          return { data: { user: demoUser }, error: null } as any;
        } catch {}
      }
      return originalGetUser(jwt);
    };

    const originalSignOut = client.auth.signOut.bind(client.auth);
    client.auth.signOut = async (options?: any) => {
      localStorage.removeItem('lpu_find_demo_user');
      return originalSignOut(options);
    };
  }

  return client;
}


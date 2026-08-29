import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL — check your .env.local');
  }
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY — check your .env.local');
  }

  const client = createBrowserClient(url, key);

  if (typeof window !== 'undefined') {
    const originalGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = async (jwt?: string) => {
      const demoUserStr = localStorage.getItem('lpu_find_demo_user');
      if (demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr);
          const isUuid = demoUser.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(demoUser.id);
          if (!isUuid) {
            demoUser.id = 'c9468c25-6a4b-44e5-8ad9-ee89304cde7d';
            localStorage.setItem('lpu_find_demo_user', JSON.stringify(demoUser));
          }
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


import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const mockUser = {
    id: '9ba3e989-4f80-4ad5-819e-056dff1d59de',
    email: 'chinmay@test.com',
    user_metadata: {
      full_name: 'Chinmay',
    },
    role: 'authenticated',
    aud: 'authenticated',
    app_metadata: {},
    created_at: new Date().toISOString(),
  };

  const mockSession = {
    access_token: 'mock-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: mockUser,
  };

  const mockAuth = {
    getUser: async () => ({ data: { user: mockUser }, error: null }),
    getSession: async () => ({ data: { session: mockSession }, error: null }),
    signInWithPassword: async () => ({ data: { user: mockUser, session: mockSession }, error: null }),
    signUp: async () => ({ data: { user: mockUser, session: mockSession }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: any) => {
      setTimeout(() => callback('SIGNED_IN', mockSession), 0);
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  };

  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === 'auth') {
        return { ...target.auth, ...mockAuth };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}


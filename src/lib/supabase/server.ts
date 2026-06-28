import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
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

export async function createServiceClient() {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

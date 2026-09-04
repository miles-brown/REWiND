import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseServerConfigured = Boolean(
  supabaseUrl && (supabaseAnonKey || serviceRoleKey)
);

/**
 * Creates a server-side Supabase client for Server Components, Server Actions,
 * and Route Handlers with automatic cookie handling.
 */
export async function createClient() {
  if (!isSupabaseServerConfigured) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, supabaseAnonKey || serviceRoleKey, {
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
            // Ignored when called in read-only Server Component contexts
          }
        },
      },
    });
  } catch {
    // In background scripts, tests, or non-request contexts where cookies() is unavailable
    return createServerClient(supabaseUrl, supabaseAnonKey || serviceRoleKey, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}

/**
 * Creates a privileged admin Supabase client using the service role key.
 * Strictly server-only. NEVER expose service_role in NEXT_PUBLIC_ variables.
 */
export function createAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Compatibility helper for existing server client calls.
 */
export function getSupabaseServerClient() {
  if (!isSupabaseServerConfigured) return null;
  return createServerClient(supabaseUrl, supabaseAnonKey || serviceRoleKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Compatibility alias for legacy rewind-scoped client calls.
 */
export function getRewindServerClient() {
  return getSupabaseServerClient();
}


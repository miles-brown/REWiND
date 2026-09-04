import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function isValidSupabaseUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === "https:") return true;
    if (
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const isSupabaseServerConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && isValidSupabaseUrl(supabaseUrl)
);

/**
 * Creates a server-side Supabase client for Server Components, Server Actions,
 * and Route Handlers with automatic cookie handling using public credentials.
 */
export async function createClient() {
  if (!isSupabaseServerConfigured) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, supabaseAnonKey, {
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
    return createServerClient(supabaseUrl, supabaseAnonKey, {
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
  if (!isValidSupabaseUrl(supabaseUrl) || !serviceRoleKey) {
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
 * Compatibility helper for existing server client calls using public credentials.
 */
export function getSupabaseServerClient() {
  if (!isSupabaseServerConfigured) return null;
  return createServerClient(supabaseUrl, supabaseAnonKey, {
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

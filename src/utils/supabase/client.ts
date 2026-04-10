import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabaseClient";

/**
 * Creates a typed Supabase browser client for use in Client Components.
 * Uses cookie-based session storage for compatibility with Server Components.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

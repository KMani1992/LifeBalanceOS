import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a typed Supabase server client for use in Server Components, Server Actions, and Route Handlers.
 * Reads and writes cookies via the Next.js cookies() API to keep the session current.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component. Ignored if middleware refreshes sessions.
          }
        },
      },
    },
  );
}

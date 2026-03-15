import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Patched: Function must be async in Next.js 15
export async function createClient() {
  // Patched: cookies() must be awaited
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Patched: Replaced deprecated 'get' with 'getAll'
        getAll() {
          return cookieStore.getAll()
        },
        // Patched: Added 'setAll' to satisfy the new Supabase SSR requirements
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
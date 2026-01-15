import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Fix for Next.js 15+: cookies() returns a Promise<ReadonlyRequestCookies>, so handlers must be async
        async get(name: string) {
          const resolvedStore = await cookieStore
          return resolvedStore.get(name)?.value
        },
        // Fix for Next.js 15+: cookies() returns a Promise<ReadonlyRequestCookies>, so handlers must be async
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const resolvedStore = await cookieStore
            // @ts-ignore - .set() is not available on ReadonlyRequestCookies in Server Components, but catch handles failure
            resolvedStore.set({ name, value, ...options })
          } catch (error) {
            // Ignorado se chamado de um Server Component
          }
        },
        // Fix for Next.js 15+: cookies() returns a Promise<ReadonlyRequestCookies>, so handlers must be async
        async remove(name: string, options: CookieOptions) {
          try {
            const resolvedStore = await cookieStore
            // @ts-ignore - .set() is not available on ReadonlyRequestCookies in Server Components, but catch handles failure
            resolvedStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignorado se chamado de um Server Component
          }
        },
      },
    }
  )
}

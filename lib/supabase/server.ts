import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { ENV } from '../env.ts';

/**
 * Cria uma instância do cliente Supabase para operações que exigem contexto de servidor.
 * Prioriza chaves do objeto ENV.
 */
export function createClient() {
  const SUPABASE_URL = ENV.SUPABASE_URL;
  const SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Server Client Error: Missing Supabase Credentials in lib/env.ts.');
  }

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`));
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          let cookieString = `${name}=${encodeURIComponent(value)}`;
          if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
          if (options.path) cookieString += `; Path=${options.path}`;
          if (options.domain) cookieString += `; Domain=${options.domain}`;
          if (options.secure) cookieString += `; Secure`;
          if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
          document.cookie = cookieString;
        },
        remove(name: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; Max-Age=0; Path=${options.path || '/'}`;
        },
      },
    }
  )
}
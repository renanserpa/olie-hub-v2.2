
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Cria uma instância do cliente Supabase para operações que exigem contexto de servidor.
 * Sincronizado com as configurações dinâmicas do OlieHub.
 */
export function createClient() {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_key') : null;

  const DEFAULT_URL = 'https://ijheukynkppcswgtrnwd.supabase.co';
  const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4';

  const SUPABASE_URL = storedUrl || DEFAULT_URL;
  const SUPABASE_ANON_KEY = storedKey || DEFAULT_KEY;

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

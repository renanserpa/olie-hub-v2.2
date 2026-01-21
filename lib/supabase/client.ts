
import { createBrowserClient } from '@supabase/ssr'

/**
 * OlieHub V2 - Dynamic Client Initializer
 */
export function createClient() {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_key') : null;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || storedUrl;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || storedKey;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('OlieHub: Configuração do Supabase pendente.');
    return null;
  }

  try {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Falha ao instanciar cliente Supabase:', err);
    return null;
  }
}

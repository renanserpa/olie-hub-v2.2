
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Global Instance Manager - Production Ready
 */
const getCredentials = () => {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_key') : null;

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || storedUrl || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || storedKey || ''
  };
};

const createNewClient = () => {
  const { url, key } = getCredentials();
  
  if (!url || !key) {
    console.warn("[OlieHub] Supabase aguardando credenciais de ambiente ou Settings.");
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

const globalAny = globalThis as any;
export const supabase = globalAny.__supabaseInstance || createNewClient();

if (!globalAny.__supabaseInstance) {
  globalAny.__supabaseInstance = supabase;
}

export const resetSupabaseClient = () => {
  globalAny.__supabaseInstance = createNewClient();
  return globalAny.__supabaseInstance;
};

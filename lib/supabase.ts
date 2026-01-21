
import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const isBrowser = typeof window !== 'undefined';
  const env = (isBrowser && (window as any).process?.env) ? (window as any).process.env : {};
  
  const url = env.NEXT_PUBLIC_SUPABASE_URL || localStorage.getItem('olie_supabase_url') || '';
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || localStorage.getItem('olie_supabase_key') || '';

  if (!url || !key || url.length < 10) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error("[OlieHub] Erro ao criar cliente Supabase:", err);
    return null;
  }
};

// Exportamos a constante para compatibilidade, mas ela pode ser null no primeiro momento
export const supabase = getSupabase();

export const resetSupabaseClient = () => {
  supabaseInstance = null;
  return getSupabase();
};

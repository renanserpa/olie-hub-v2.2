
import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.ts';

/**
 * Supabase Global Instance Manager
 * Centraliza a conexão para evitar múltiplas instâncias e vazamentos de memória.
 */
const getCredentials = () => {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_key') : null;

  return {
    url: ENV.SUPABASE_URL || storedUrl || '',
    key: ENV.SUPABASE_ANON_KEY || storedKey || ''
  };
};

const createNewClient = () => {
  const { url, key } = getCredentials();
  
  if (!url || !key) {
    console.warn("[OlieHub] Supabase aguardando credenciais em Settings.");
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

// Singleton persistente no objeto global para HMR e consistência
const globalAny = globalThis as any;
export const supabase = globalAny.__supabaseInstance || createNewClient();

if (!globalAny.__supabaseInstance) {
  globalAny.__supabaseInstance = supabase;
}

/**
 * Força a reinicialização do cliente (útil após salvar novas chaves em Settings)
 */
export const resetSupabaseClient = () => {
  globalAny.__supabaseInstance = createNewClient();
  return globalAny.__supabaseInstance;
};


import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Global Instance Manager - OlieHub V2.5
 * Centraliza a lógica de credenciais (Env Vars ou LocalStorage) de forma resiliente.
 */
const getCredentials = () => {
  const isBrowser = typeof window !== 'undefined';
  const env = (isBrowser && (window as any).process?.env) ? (window as any).process.env : {};
  
  const storedUrl = isBrowser ? localStorage.getItem('olie_supabase_url') : null;
  const storedKey = isBrowser ? localStorage.getItem('olie_supabase_key') : null;

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL || storedUrl || '',
    key: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || storedKey || ''
  };
};

const createNewClient = () => {
  const { url, key } = getCredentials();
  
  // Se não houver URL ou Chave, não tentamos criar o cliente
  if (!url || !key || url.length < 5) {
    console.warn("[OlieHub] Supabase: Credenciais ausentes. O sistema operará em modo offline.");
    return null;
  }

  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error("[OlieHub] Erro crítico ao criar cliente Supabase:", err);
    return null;
  }
};

// Singleton Management
const globalAny = globalThis as any;
if (!globalAny.__supabaseInstance) {
  globalAny.__supabaseInstance = createNewClient();
}

/**
 * Instância exportada do Supabase. Pode ser nula se não configurada.
 * Os hooks devem verificar a existência antes de usar.
 */
export const supabase = globalAny.__supabaseInstance;

/**
 * Força a reinicialização do cliente (ex.: após salvar configurações no Settings)
 */
export const resetSupabaseClient = () => {
  globalAny.__supabaseInstance = createNewClient();
  return globalAny.__supabaseInstance;
};

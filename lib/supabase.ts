
import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const isBrowser = typeof window !== 'undefined';
  
  // No ambiente de simulação, process.env pode não estar disponível globalmente
  // tentamos ler de múltiplas fontes para garantir o carregamento
  const url = (isBrowser ? localStorage.getItem('olie_supabase_url') : '') || 
              (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '') || '';
              
  const key = (isBrowser ? localStorage.getItem('olie_supabase_key') : '') || 
              (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') || '';

  if (!url || !key || url.length < 10) {
    console.warn("[OlieHub] Configurações de Banco de Dados não detectadas.");
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
    console.error("[OlieHub] Erro na criação do cliente Supabase:", err);
    return null;
  }
};

export const supabase = getSupabase();

export const resetSupabaseClient = () => {
  supabaseInstance = null;
  return getSupabase();
};

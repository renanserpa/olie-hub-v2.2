
import { createBrowserClient } from '@supabase/ssr'
import { ENV } from '../env.ts';

/**
 * OlieHub V2 - Dynamic Client Initializer
 * Recupera credenciais do arquivo ENV centralizado ou fallback para localStorage.
 */
export function createClient() {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('olie_supabase_key') : null;

  // Prioridade: 1. ENV.ts (Injeção Manual), 2. LocalStorage
  const SUPABASE_URL = ENV.SUPABASE_URL || storedUrl;
  const SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY || storedKey;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('OlieHub: Configuração do Supabase pendente no Workspace.');
    return null;
  }

  try {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Falha ao instanciar cliente Supabase:', err);
    return null;
  }
}

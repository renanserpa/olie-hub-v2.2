
import { createBrowserClient } from '@supabase/ssr'

/**
 * OlieHub V2 - Dynamic Client Initializer
 * Recupera credenciais do localStorage para permitir configuração sem redeploy.
 * Inclui fallbacks para evitar erros de inicialização do SDK do Supabase.
 */
export function createClient() {
  const storedUrl = localStorage.getItem('olie_supabase_url');
  const storedKey = localStorage.getItem('olie_supabase_key');

  // Chave padrão do projeto OlieHub (Demo)
  const DEFAULT_URL = 'https://ijheukynkppcswgtrnwd.supabase.co';
  const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4';

  const SUPABASE_URL = storedUrl || DEFAULT_URL;
  const SUPABASE_ANON_KEY = storedKey || DEFAULT_KEY;

  // O SDK exige que ambos os parâmetros sejam strings não vazias
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

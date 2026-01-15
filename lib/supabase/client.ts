import { createBrowserClient } from '@supabase/ssr'

// Configurações centralizadas com fallback seguro para ambiente de navegador
const SUPABASE_URL = 'https://ijheukynkppcswgtrnwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4';

let supabaseInstance: any = null;

export function createClient() {
  if (!supabaseInstance) {
    // No navegador, não usamos process.env diretamente para evitar ReferenceError
    supabaseInstance = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
}
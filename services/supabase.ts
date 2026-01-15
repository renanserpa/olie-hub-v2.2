import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas pelo usuário
const SUPABASE_URL = 'https://ijheukynkppcswgtrnwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper para simular roles enquanto o login real não é efetuado via Auth UI
export const mockGetUserRole = (email: string): 'dev' | 'admin' | 'user' => {
  if (email.includes('dev')) return 'dev';
  if (email.includes('admin')) return 'admin';
  return 'user';
};

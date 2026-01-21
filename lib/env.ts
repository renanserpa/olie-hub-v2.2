
/**
 * OlieHub V2 - Environment Injection Manager
 * Este arquivo centraliza as credenciais para garantir funcionamento imediato
 * em ambientes de preview onde process.env pode não ser recarregado.
 */

export const ENV = {
  // SUPABASE CONFIG
  SUPABASE_URL: "https://ijheukynkppcswgtrnwd.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGV1a3lua3BwY3N3Z3RybndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDM3OTEsImV4cCI6MjA3ODAxOTc5MX0.6t0sHi76ORNE_aEaanLYoPNuIGGkyKaCNooYBjDBMM4",

  // TINY ERP CONFIG
  TINY_API_TOKEN: "7d4aa26376b3d76897b3b3c9d03cc0790c7039882d71f49fc56d0ee0fe17ec7d",
  TINY_PARTNER_ID: "10159",
  TINY_SHIPPING_TOKEN: "7d4aa26376b3d76897b3b3c9d03cc0790c7039882d71f49fc56d0ee0fe17ec7d",

  // META API CONFIG (WhatsApp Business)
  META_ACCESS_TOKEN: "", // Inserir token Meta se disponível
  META_PHONE_ID: "",

  // VNDA CONFIG
  VNDA_TOKEN: "",
  VNDA_API_HOST: "https://api.vnda.com.br",

  // APP FLAGS
  USE_MOCK: false
} as const;

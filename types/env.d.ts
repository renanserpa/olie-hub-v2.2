
declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase (Navegador e Servidor)
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

    // Tiny ERP (Apenas Servidor)
    TINY_API_TOKEN: string;
    TINY_PARTNER_ID: string;
    TINY_SHIPPING_TOKEN: string;

    // Meta API (Apenas Servidor)
    META_ACCESS_TOKEN: string;
    META_PHONE_ID: string;

    // VNDA (Apenas Servidor)
    VNDA_TOKEN: string;
    VNDA_API_HOST: string;
    VNDA_WEBHOOK_SECRET: string;

    // Gemini AI
    API_KEY: string;

    // Flags
    NEXT_PUBLIC_USE_MOCK: string;
  }
}

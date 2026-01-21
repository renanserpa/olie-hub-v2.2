
import { NextResponse } from 'next/server';

/**
 * API Segura para verificação de variáveis de ambiente.
 * Apenas verifica a existência, nunca retorna o valor real.
 */
export async function GET() {
  const vars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', scope: 'Public' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', scope: 'Public' },
    { key: 'TINY_API_TOKEN', scope: 'Private' },
    { key: 'TINY_PARTNER_ID', scope: 'Private' },
    { key: 'VNDA_TOKEN', scope: 'Private' },
    { key: 'VNDA_WEBHOOK_SECRET', scope: 'Private' },
    { key: 'API_KEY', scope: 'Private (Gemini)' },
  ];

  const status = vars.map(v => ({
    ...v,
    exists: !!process.env[v.key as any],
    length: process.env[v.key as any]?.length || 0
  }));

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: status
  });
}

import { NextResponse } from 'next/server';
import { ENV } from '../../../lib/env.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Prioridade: 1. Token no body (teste manual), 2. Token no lib/env.ts, 3. process.env
    const token = body.token || ENV.VNDA_TOKEN || process.env.VNDA_TOKEN;
    const apiHost = ENV.VNDA_API_HOST || process.env.VNDA_API_HOST || 'https://api.vnda.com.br';

    if (!token || token.trim().length < 5) {
      return NextResponse.json({ 
        status: 'unconfigured', 
        message: 'Chave VNDA não configurada em lib/env.ts.' 
      });
    }

    const response = await fetch(`${apiHost}/api/v2/variants?per_page=1`, {
      headers: {
        'Authorization': `Token token=${token.trim()}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ 
        status: 'invalid', 
        message: 'A API da VNDA recusou as credenciais fornecidas.' 
      });
    }

    return NextResponse.json({ 
      status: 'healthy', 
      message: 'E-commerce VNDA: Conexão validada e pronta para vendas.' 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Erro na ponte VNDA: ' + error.message 
    }, { status: 500 });
  }
}
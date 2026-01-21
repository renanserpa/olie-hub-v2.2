
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const token = body.token || process.env.VNDA_TOKEN;
    const apiHost = process.env.VNDA_API_HOST || 'https://api.vnda.com.br';

    if (!token || token.trim().length < 5) {
      return NextResponse.json({ 
        status: 'unconfigured', 
        message: 'Chave VNDA não configurada no servidor.' 
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
      message: 'E-commerce VNDA: Conexão validada.' 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Erro na ponte VNDA: ' + error.message 
    }, { status: 500 });
  }
}

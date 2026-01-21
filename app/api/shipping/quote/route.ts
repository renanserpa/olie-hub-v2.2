import { NextResponse } from 'next/server';
import { ENV } from '../../../lib/env.ts';

/**
 * Tiny Shipping Proxy
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { destinationZip, weight, value, token: bodyToken, integratorId } = body;
    
    const activeToken = ENV.TINY_API_TOKEN || bodyToken;
    const partnerId = integratorId || ENV.TINY_PARTNER_ID;

    if (!activeToken) {
      return NextResponse.json({ 
        status: 'error',
        error: 'Token de Autenticação ausente no lib/env.ts.' 
      }, { status: 401 });
    }

    const params = new URLSearchParams();
    params.append('token', activeToken.trim());
    params.append('formato', 'JSON');
    
    const tinyPayload = {
      cep_destino: (destinationZip || '').replace(/\D/g, ''),
      valor_declarado: value || 100,
      peso_cubico: weight || 0.5,
      unidade: 'cm',
      comprimento: 25,
      largura: 25,
      altura: 15
    };
    
    params.append('cotacao', JSON.stringify(tinyPayload));

    const response = await fetch(`https://erp.tiny.com.br/webhook/api/v1/parceiro/${partnerId}/cotar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params,
    });

    const data = await response.json();

    if (data.retorno?.status === 'Erro' || data.error) {
      return NextResponse.json({ 
        status: 'error',
        error: 'Falha na Cotação',
        details: data.retorno?.erros?.[0]?.erro || data.error
      }, { status: 400 });
    }
    
    const options = (data.cotacoes || []).map((c: any) => ({
      name: c.transportadora || c.servico || 'Frete Olie',
      price: parseFloat(c.valor || c.preco || '0'),
      days: parseInt(c.prazo || c.dias || '0')
    }));

    if (options.length === 0) {
      return NextResponse.json({
        status: 'success',
        options: [
          { name: 'PAC (Estimado)', price: 28.90, days: 7 },
          { name: 'SEDEX (Estimado)', price: 54.20, days: 3 }
        ]
      });
    }

    return NextResponse.json({ status: 'success', options });

  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      error: 'Erro interno', 
      details: error.message 
    }, { status: 500 });
  }
}
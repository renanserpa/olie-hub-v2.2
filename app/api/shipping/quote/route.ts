
import { NextResponse } from 'next/server';

/**
 * Tiny Shipping Proxy
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { destinationZip, weight, value, token: bodyToken, integratorId } = body;
    
    // Prioridade para variáveis de ambiente (Servidor)
    const activeToken = process.env.TINY_API_TOKEN || bodyToken;
    const partnerId = integratorId || process.env.TINY_PARTNER_ID || '10159';

    if (!activeToken) {
      return NextResponse.json({ 
        status: 'error',
        error: 'Token de Autenticação não configurado no servidor.' 
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

    return NextResponse.json({ status: 'success', options });

  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      error: 'Erro interno', 
      details: error.message 
    }, { status: 500 });
  }
}

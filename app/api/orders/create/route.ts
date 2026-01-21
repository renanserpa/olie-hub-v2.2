
import { NextResponse } from 'next/server';
import { CartItem } from '../../../types/index.ts';
import { ENV } from '../../../lib/env.ts';

const TINY_API_URL = 'https://api.tiny.com.br/api2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, token: bodyToken, integratorId } = body;

    // Prioridade para dados injetados via UI (Configurações), fallback para ENV
    const activeToken = (bodyToken && bodyToken.trim().length > 5) ? bodyToken : ENV.TINY_API_TOKEN;
    const activeIntegratorId = integratorId || ENV.TINY_PARTNER_ID;

    if (!activeToken || activeToken.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Erro de Autenticação',
        details: 'Token do Tiny ERP não configurado ou inválido.'
      }, { status: 401 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const tinyPayload = {
      pedido: {
        data_pedido: formattedDate,
        id_integrador: activeIntegratorId,
        cliente: {
          nome: customer?.name || 'Cliente OlieHub',
          email: customer?.email || '',
          tipo_pessoa: 'F',
        },
        itens: items.map((item: CartItem) => {
          const cfg = item.configuration;
          const specs = [];
          if (cfg.color) specs.push(`Cor: ${cfg.color}`);
          if (cfg.hardware) specs.push(`Metais: ${cfg.hardware}`);
          if (cfg.personalization_text) specs.push(`Gravação: ${cfg.personalization_text}`);
          
          const richDescription = specs.length > 0 
            ? `${item.name} | ${specs.join(' | ')}` 
            : item.name;
            
          return {
            item: {
              // Crucial: Usamos o SKU_BASE enviado pelo SmartOrderModal
              codigo: item.product_id || 'SKU-GENERIC',
              descricao: richDescription,
              unidade: 'UN',
              quantidade: item.quantity || 1,
              valor_unitario: item.unit_price || 0,
            },
          };
        }),
        obs: `[OlieHub V2] Integrador: ${activeIntegratorId}`
      },
    };

    const formParams = new URLSearchParams();
    formParams.append('token', activeToken.trim());
    formParams.append('formato', 'JSON');
    formParams.append('pedido', JSON.stringify(tinyPayload));

    const response = await fetch(`${TINY_API_URL}/pedido.incluir.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formParams,
    });

    const data = await response.json();

    if (data.retorno?.status === 'Erro') {
      return NextResponse.json({ 
        error: 'Falha no Tiny ERP',
        details: data.retorno.erros?.[0]?.erro
      }, { status: 400 });
    }

    const registro = data.retorno.registros?.[0]?.registro;
    return NextResponse.json({
      status: 'success',
      tiny_id: registro?.numero || registro?.id || 'OK',
      message: 'Pedido sincronizado com sucesso.'
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erro Interno no Proxy',
      details: error.message 
    }, { status: 500 });
  }
}

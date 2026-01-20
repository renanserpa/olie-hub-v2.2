
import { NextResponse } from 'next/server';
import { CartItem } from '../../../types/index.ts';

const TINY_API_URL = 'https://api.tiny.com.br/api2';
const DEFAULT_INTEGRATOR_ID = '10159'; // Identificação OlieHub no Tiny

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, token: bodyToken, integratorId } = body as { items: CartItem[], customer: any, token?: string, integratorId?: string };

    const activeToken = bodyToken || process.env.TINY_API_TOKEN;
    const activeIntegratorId = integratorId || DEFAULT_INTEGRATOR_ID;

    if (!activeToken || activeToken === 'undefined' || activeToken.length < 32) {
      return NextResponse.json(
        { error: 'Configuração do Tiny ERP pendente. Configure o token nas definições do sistema.' },
        { status: 401 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    // Formatação da data para o padrão dd/mm/aaaa exigido pela Tiny
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const tinyPayload = {
      pedido: {
        data_pedido: formattedDate,
        id_integrador: activeIntegratorId,
        cliente: {
          nome: customer?.name || 'Cliente Olie Concierge',
          email: customer?.email || '',
          tipo_pessoa: 'F',
        },
        itens: items.map((item) => ({
          item: {
            codigo: item.product_id,
            descricao: `${item.name}${item.configuration.personalization_text ? ` [Pers: ${item.configuration.personalization_text}]` : ''}`,
            unidade: 'UN',
            quantidade: item.quantity,
            valor_unitario: item.unit_price,
          },
        })),
        obs: `Pedido Gerado via OlieHub Concierge. Integrador: ${activeIntegratorId}`
      },
    };

    const params = new URLSearchParams();
    params.append('token', activeToken.trim());
    params.append('formato', 'json');
    params.append('pedido', JSON.stringify(tinyPayload));

    const response = await fetch(`${TINY_API_URL}/pedido.incluir.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = await response.json();

    if (data.retorno?.status === 'Erro') {
      const errorDetail = data.retorno.erros?.[0]?.erro || 'Erro na validação do Tiny.';
      return NextResponse.json(
        { error: 'O Tiny ERP recusou a inclusão', details: errorDetail },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'success',
      tiny_id: data.retorno.registros?.[0]?.registro?.numero || 'Pendente',
      tiny_response: data
    });

  } catch (error: any) {
    console.error('Tiny Order Creation Error:', error);
    return NextResponse.json(
      { error: 'Falha crítica na comunicação com o ERP: ' + error.message },
      { status: 500 }
    );
  }
}

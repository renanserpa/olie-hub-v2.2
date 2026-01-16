
import { NextResponse } from 'next/server';
import { CartItem } from '../../../types/index.ts';

const TINY_API_URL = process.env.TINY_API_BASE_URL || 'https://api.tiny.com.br/api2';
const TINY_TOKEN = process.env.TINY_API_TOKEN;

export async function POST(request: Request) {
  try {
    // 1. Security Check
    if (!TINY_TOKEN) {
      console.error('SERVER ERROR: TINY_API_TOKEN is missing in .env.local');
      return NextResponse.json(
        { error: 'Server misconfiguration: Missing API Token' },
        { status: 500 }
      );
    }

    // 2. Parse Incoming Payload
    const body = await request.json();
    const { items, customer } = body as { items: CartItem[], customer: any };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Validation Error: Cart is empty' },
        { status: 400 }
      );
    }

    // 3. Transform to Tiny ERP Structure
    // Documentation: https://tiny.com.br/ajuda/api/api2-pedidos-incluir
    const tinyPayload = {
      pedido: {
        data_pedido: new Date().toLocaleDateString('pt-BR'),
        cliente: {
          nome: customer?.name || 'Cliente Olie (Via Chat)',
          email: customer?.email || 'email@naoinformado.com',
          // In a real scenario, you would map CPF/CNPJ here
        },
        itens: items.map((item) => ({
          item: {
            codigo: item.product_id,
            descricao: item.name + (item.configuration.personalization_text ? ` (Pers: ${item.configuration.personalization_text})` : ''),
            unidade: 'UN',
            quantidade: item.quantity,
            valor_unitario: item.unit_price,
          },
        })),
        obs: `Pedido criado via OlieHub V2.\nConfigurações: ${items.map(i => `${i.name}: ${i.configuration.color}/${i.configuration.hardware}`).join('; ')}`
      },
    };

    // 4. Send to Tiny ERP
    // Tiny API requires the 'token' and 'pedido' (JSON string) as query or form params in some versions,
    // but the 'pedido.incluir.php' usually accepts POST with params.
    
    const params = new URLSearchParams();
    params.append('token', TINY_TOKEN);
    params.append('formato', 'json');
    params.append('pedido', JSON.stringify(tinyPayload));

    const response = await fetch(`${TINY_API_URL}/pedido.incluir.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();

    // 5. Handle Tiny Response
    if (data.retorno.status === 'Erro') {
      console.error('Tiny ERP Error:', data.retorno.erros);
      return NextResponse.json(
        { error: 'Tiny ERP Error', details: data.retorno.erros },
        { status: 400 }
      );
    }

    // Success
    return NextResponse.json({
      status: 'success',
      tiny_id: data.retorno.registros?.registro?.numero || 'N/A',
      tiny_response: data
    });

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

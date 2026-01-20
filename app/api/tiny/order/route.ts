
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, id } = await request.json();

    if (!token || token.trim().length < 32) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID do pedido necessário.' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('token', token.trim());
    params.append('formato', 'json');
    params.append('id', id);
    
    const response = await fetch('https://api.tiny.com.br/api2/pedido.obter.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = await response.json();

    if (data.retorno?.status === 'Erro') {
      return NextResponse.json({ error: data.retorno.erros?.[0]?.erro || 'Erro no Tiny' }, { status: 400 });
    }

    const p = data.retorno.pedido;
    const valor = parseFloat(p.valor_total || "0");

    // Mapeamento para o formato do Order de luxo do OlieHub
    return NextResponse.json({
      id: p.numero || p.id,
      tiny_id: p.id,
      name: p.cliente?.nome || 'Cliente Olie',
      customer_email: p.cliente?.email || '',
      status: p.situacao || 'Pendente',
      price: valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      date: p.data_pedido || '--/--/----',
      product: p.itens?.[0]?.item?.descricao || 'Produto Olie',
      items: p.itens?.map((i: any) => ({
        name: i.item.descricao,
        configuration: {
          color: 'Padrão', // A Tiny não separa atributos nativamente sem configurações extras
          hardware: 'Dourado',
          personalization_text: ''
        }
      })) || [],
      source: 'tiny'
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Falha na ponte: ' + error.message }, { status: 500 });
  }
}

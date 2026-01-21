
import { NextResponse } from 'next/server';
import { TinyClient } from '../tiny/client.ts';
import { getSupabase } from '../../../lib/supabase.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, integratorId } = body;

    // Se o token não for enviado no body, o TinyClient tentará usar o process.env.TINY_API_TOKEN internamente
    const client = new TinyClient(token);
    const result = await client.post('pedidos.pesquisa.php');
    
    const supabase = getSupabase();

    if (result.status === 'success' && supabase) {
      const tinyOrders = result.data.pedidos || [];
      
      // Sincronização Silenciosa com Supabase
      const upsertData = tinyOrders.map((o: any) => ({
        tiny_order_id: o.pedido.id.toString(),
        customer_name: o.pedido.nome,
        status_tiny: o.pedido.situacao,
        total_value: parseFloat(o.pedido.total || '0'),
        items: [],
        created_at: o.pedido.data_pedido,
        updated_at: new Date().toISOString()
      }));

      // Tentativa de upsert, mas não trava se falhar (o ERP é a fonte da verdade aqui)
      await supabase.from('orders').upsert(upsertData, { onConflict: 'tiny_order_id' }).catch(console.error);

      return NextResponse.json({ 
        status: 'success', 
        data: tinyOrders.map((o: any) => ({
          id: o.pedido.id,
          name: o.pedido.nome,
          status: o.pedido.situacao,
          price: `R$ ${o.pedido.total}`,
          date: o.pedido.data_pedido,
          product: `Pedido #${o.pedido.numero}`
        }))
      });
    }

    if (result.status === 'empty') {
      return NextResponse.json({ status: 'success', data: [] });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API_ORDERS_ERROR]", err);
    return NextResponse.json({ 
      status: 'error', 
      error: 'Erro na Ponte Tiny ERP',
      details: err.message 
    }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { TinyClient } from '../tiny/client.ts';
import { supabase } from '../../../lib/supabase.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, integratorId } = body;

    const client = new TinyClient(token);
    const result = await client.post('pedidos.pesquisa.php');
    
    if (result.status === 'success' && supabase) {
      const tinyOrders = result.data.pedidos || [];
      
      // Sincronização Inteligente
      const upsertData = tinyOrders.map((o: any) => ({
        tiny_order_id: o.pedido.id.toString(),
        customer_name: o.pedido.nome,
        status_tiny: o.pedido.situacao,
        total_value: parseFloat(o.pedido.total || '0'),
        items: [],
        created_at: o.pedido.data_pedido,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('orders').upsert(upsertData, { onConflict: 'tiny_order_id' });
      if (error) console.error("[SYNC_ORDER_ERROR]", error);

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

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

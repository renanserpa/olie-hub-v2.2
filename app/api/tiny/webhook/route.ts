
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase.ts';

/**
 * OlieHub Tiny Webhook Receiver
 * Suporta: Pedidos, Estoque, Preços, Rastreio e NF.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); 

  try {
    const contentType = request.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const jsonStr = formData.get('dados') as string;
      data = jsonStr ? JSON.parse(jsonStr) : {};
    } else {
      data = await request.json();
    }

    console.log(`[TINY_WEBHOOK] Tipo: ${type}`, data);

    const tinyId = data.idPedido || data.id || data.codigo;
    if (!tinyId) return NextResponse.json({ status: 'ignored' }, { status: 200 });

    if (!supabase) return NextResponse.json({ status: 'no_db' }, { status: 200 });

    switch (type) {
      case 'order':
        // Atualiza status do pedido
        await supabase
          .from('orders')
          .update({ 
            status_tiny: data.situacao || data.status,
            updated_at: new Date().toISOString()
          })
          .eq('tiny_order_id', tinyId.toString());
        break;

      case 'shipping':
        // Atualiza informações de rastreio
        await supabase
          .from('orders')
          .update({ 
            tracking_code: data.codigoRastreamento || data.rastreio,
            shipping_status: 'Objeto Postado',
            updated_at: new Date().toISOString()
          })
          .eq('tiny_order_id', tinyId.toString());
        break;

      case 'invoice':
        // Registra emissão de nota fiscal
        await supabase
          .from('orders')
          .update({ 
            invoice_status: 'Emitida',
            invoice_number: data.numeroNota,
            updated_at: new Date().toISOString()
          })
          .eq('tiny_order_id', tinyId.toString());
        break;

      case 'stock':
        // Atualiza saldo de estoque
        await supabase
          .from('products')
          .update({ stock_level: data.saldo })
          .eq('sku', data.codigo);
        break;

      case 'price':
        // Sincroniza alteração de preço
        await supabase
          .from('products')
          .update({ base_price: data.preco })
          .eq('sku', data.codigo);
        break;
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error: any) {
    console.error("[WEBHOOK_ERROR]", error.message);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active', gateway: 'OlieHub' });
}

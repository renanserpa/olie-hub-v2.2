
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase.ts';
import crypto from 'crypto';

/**
 * VNDA Webhook Integration - Production Gateway
 * Valida a autenticidade da requisição usando HMAC SHA256.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-vnda-signature');
    const secret = process.env.VNDA_WEBHOOK_SECRET;

    // Validação de Assinatura HMAC SHA256
    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(rawBody).digest('hex');
      
      if (digest !== signature) {
        console.error('[VNDA_SECURITY] Assinatura inválida detectada.');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data = JSON.parse(rawBody);
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    const resource = data.resource;
    const event = data.event;

    // Auditoria de Sincronia no DB
    await supabase.from('messages').insert([{
      content: `[VNDA] Webhook verificado: ${resource}.${event} (ID: ${data.id})`,
      direction: 'inbound',
      read: true,
      sender_type: 'client'
    }]).catch(e => console.error("Audit log failed", e));

    switch (resource) {
      case 'order':
        const { error: orderError } = await supabase
          .from('orders')
          .upsert({
            tiny_order_id: `VNDA-${data.id}`,
            customer_name: data.client?.name || 'VNDA Customer',
            total_value: parseFloat(data.total || '0'),
            status_tiny: mapVndaStatusToOlie(data.status),
            updated_at: new Date().toISOString()
          }, { onConflict: 'tiny_order_id' });

        if (orderError) throw orderError;
        break;

      case 'product':
      case 'variant':
        const sku = data.sku || data.code;
        if (sku) {
          const { error: prodError } = await supabase
            .from('products')
            .update({
              base_price: parseFloat(data.price || data.sale_price || '0'),
              stock_level: parseInt(data.quantity || '0'),
              updated_at: new Date().toISOString()
            })
            .eq('sku', sku);
          
          if (prodError) throw prodError;
        }
        break;
    }

    return NextResponse.json({ status: 'success', verified: true }, { status: 200 });

  } catch (error: any) {
    console.error(`[VNDA_WEBHOOK_ERROR]`, error.message);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
  }
}

function mapVndaStatusToOlie(vndaStatus: string) {
  const s = String(vndaStatus || '').toLowerCase();
  if (s === 'confirmed' || s === 'paid') return 'Aprovado';
  if (s === 'shipped') return 'Enviado';
  if (s === 'canceled') return 'Cancelado';
  return 'Aberto';
}

export async function GET() {
  return NextResponse.json({ status: 'active', gateway: 'OlieHub production' });
}

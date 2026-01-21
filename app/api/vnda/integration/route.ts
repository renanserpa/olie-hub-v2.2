
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase.ts';
import { ENV } from '../../../lib/env.ts';

/**
 * VNDA Webhook Integration Route
 * Handlers para sincronização de E-commerce -> OlieHub
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    
    // Log de auditoria para depuração no console do servidor
    console.log(`[VNDA_WEBHOOK] Evento recebido:`, {
      resource: data.resource,
      event: data.event,
      id: data.id
    });

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    // A VNDA envia webhooks estruturados por resource/event
    const resource = data.resource; // 'order' | 'product' | 'variant'
    const event = data.event;       // 'created' | 'updated' | 'confirmed'

    switch (resource) {
      case 'order':
        // Sincronização de Pedido VNDA -> OlieHub
        // O ID do pedido VNDA é salvo para referência cruzada
        const { error: orderError } = await supabase
          .from('orders')
          .upsert({
            id: data.id.toString(), // Usando o ID da VNDA como primário ou secundário dependendo do schema
            customer_name: data.client?.name,
            total_value: parseFloat(data.total || '0'),
            status_tiny: mapVndaStatusToOlie(data.status), // Reutilizando status_tiny para consistência de interface
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (orderError) throw orderError;
        break;

      case 'product':
      case 'variant':
        // Sincronização de Preço/Estoque VNDA -> OlieHub
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

      default:
        console.warn(`[VNDA_WEBHOOK] Recurso não suportado: ${resource}`);
    }

    return NextResponse.json({ 
      status: 'success', 
      received: true,
      timestamp: new Date().toISOString() 
    }, { status: 200 });

  } catch (error: any) {
    console.error(`[VNDA_WEBHOOK_ERROR]`, error.message);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 400 });
  }
}

/**
 * Tradutor de Status VNDA para o Fluxo Olie
 */
function mapVndaStatusToOlie(vndaStatus: string) {
  const s = String(vndaStatus || '').toLowerCase();
  if (s === 'confirmed' || s === 'paid') return 'Aprovado';
  if (s === 'shipped') return 'Enviado';
  if (s === 'canceled') return 'Cancelado';
  return 'Aberto';
}

/**
 * Health Check para o painel da VNDA
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'active', 
    service: 'OlieHub VNDA Gateway',
    version: '2.5.0'
  });
}

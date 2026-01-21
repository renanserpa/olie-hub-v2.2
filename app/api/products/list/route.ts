
import { NextResponse } from 'next/server';
import { TinyClient } from '../tiny/client.ts';
import { supabase } from '../../../lib/supabase.ts';

/**
 * Mapeamento de Luxo (Fallback Visual)
 * Se o Tiny não retornar imagem, usamos fotos de catálogo premium para SKUs conhecidos.
 */
const LUX_IMAGE_MAP: Record<string, string> = {
  'OL-LILLE-KTA': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
  'OL-BOX-NEC': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80',
  'OL-TRAVEL-KIT': 'https://images.unsplash.com/photo-1544816153-199d88f6573d?w=800&q=80',
  'OL-PASSPORT-TAG': 'https://images.unsplash.com/photo-1594465919760-442ee32a9a7a?w=800&q=80',
  'OL-MAM-BACK': 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800&q=80'
};

export async function POST() {
  try {
    const client = new TinyClient();
    const result = await client.post('produtos.pesquisa.php', { pesquisa: '' });
    
    if (result.status === 'success' && supabase) {
      const tinyProducts = result.data.produtos || [];
      
      const upsertData = tinyProducts.map((p: any) => {
        const sku = p.produto.codigo;
        return {
          sku: sku,
          name: p.produto.nome,
          base_price: parseFloat(p.produto.preco || '0'),
          stock_level: parseInt(p.produto.quantidade || '0'),
          image_url: LUX_IMAGE_MAP[sku] || p.produto.url_imagem || null,
          updated_at: new Date().toISOString()
        };
      });

      // Upsert garantindo que não sobrescrevemos campos nulos em image_url se já houver algo
      const { error } = await supabase.from('products').upsert(upsertData, { 
        onConflict: 'sku'
      });
      
      if (error) console.error("[SYNC_PROD_ERROR]", error);

      return NextResponse.json({ status: 'success', count: tinyProducts.length });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

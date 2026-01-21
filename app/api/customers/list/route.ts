
import { NextResponse } from 'next/server';
import { TinyClient } from '../tiny/client.ts';
import { supabase } from '../../../lib/supabase.ts';

export async function POST() {
  try {
    const client = new TinyClient();
    const result = await client.post('contatos.pesquisa.php', { tipoPessoa: 'F' });
    
    if (result.status === 'success' && supabase) {
      const tinyContacts = result.data.contatos || [];
      
      const upsertData = tinyContacts.map((c: any) => ({
        full_name: c.contato.nome,
        email: c.contato.email,
        phone: c.contato.fone || c.contato.celular,
        tiny_contact_id: c.contato.id.toString(),
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('customers').upsert(upsertData, { onConflict: 'phone' });
      if (error) console.error("[SYNC_CUST_ERROR]", error);

      return NextResponse.json({ status: 'success', count: tinyContacts.length });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

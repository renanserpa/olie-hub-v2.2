
import { NextResponse } from 'next/server';
import { TinyClient, errorResponse } from '../client.ts';

/**
 * Validação de conexão com o Tiny ERP
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token } = body;
    
    // Se o token vier no body, usa ele. Caso contrário, o TinyClient usará o process.env.TINY_API_TOKEN
    const client = new TinyClient(token);
    
    const result = await client.post('info.obter.php');
    const conta = result.data?.conta;

    return NextResponse.json({ 
      status: 'healthy', 
      message: `Tiny ERP: Conectado à conta "${conta?.nome || 'Olie'}"`,
      raw: result.data
    });
  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Token') ? 401 : 400);
  }
}

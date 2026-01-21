
import { NextResponse } from 'next/server';
import { TinyClient, errorResponse } from '../client.ts';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
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

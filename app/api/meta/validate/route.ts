
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const token = body.token || process.env.META_ACCESS_TOKEN;
    const phoneId = body.phoneId || process.env.META_PHONE_ID || 'me';

    if (!token || token.trim().length < 10) {
      return NextResponse.json({ 
        status: 'unconfigured', 
        message: 'Token Meta não configurado no servidor.' 
      });
    }

    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}?access_token=${token.trim()}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        status: 'invalid', 
        message: data.error?.message || 'Token Meta recusado pela Graph API.' 
      });
    }

    return NextResponse.json({ 
      status: 'healthy', 
      message: `Meta API Conectada: Canal "${data.name || 'WhatsApp Business'}" ativo.` 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Erro na ponte Meta: ' + error.message 
    }, { status: 500 });
  }
}

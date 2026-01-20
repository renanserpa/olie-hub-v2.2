
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token || token.trim().length < 10) {
      return NextResponse.json({ status: 'invalid', message: 'Token de integração ausente ou muito curto.' });
    }

    const cleanToken = token.trim();
    
    // Para validar, fazemos uma pesquisa simples de 1 registro
    const params = new URLSearchParams();
    params.append('token', cleanToken);
    params.append('formato', 'json');
    params.append('pagina', '1');

    const response = await fetch('https://api.tiny.com.br/api2/pedidos.pesquisa.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      return NextResponse.json({ 
        status: 'error', 
        message: `Tiny ERP retornou erro HTTP ${response.status}` 
      });
    }

    const data = await response.json();

    // A Tiny retorna status "Erro" dentro do objeto retorno se o token for inválido
    if (data.retorno?.status === 'Erro') {
      const errorMsg = data.retorno.erros?.[0]?.erro || 'Erro desconhecido';
      const isAuthError = errorMsg.toLowerCase().includes('token') || 
                         errorMsg.toLowerCase().includes('não autorizado') ||
                         errorMsg.toLowerCase().includes('permissão');
      
      return NextResponse.json({ 
        status: isAuthError ? 'invalid' : 'error', 
        message: errorMsg 
      });
    }

    if (data.retorno?.status === 'OK') {
      return NextResponse.json({ 
        status: 'healthy', 
        message: 'Conexão com Tiny ERP validada com sucesso.' 
      });
    }

    return NextResponse.json({ status: 'error', message: 'Resposta inesperada do Tiny ERP.' });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Falha na ponte de comunicação: ' + error.message 
    }, { status: 500 });
  }
}

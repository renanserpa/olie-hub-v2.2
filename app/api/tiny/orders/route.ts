
import { NextResponse } from 'next/server';

// Mapeamento de situações padrão da Tiny API v2 para o fluxo Olie
const TINY_SITUACOES: Record<string, string> = {
  '1': 'Aberto',
  '2': 'Aprovado',
  '3': 'Preparação',
  '4': 'Faturado',
  '5': 'Enviado',
  '6': 'Entregue',
  '7': 'Cancelado',
  '8': 'Perda',
  '9': 'Pendente'
};

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token || token.trim().length < 32) {
      return NextResponse.json({ error: 'Token do Tiny ERP inválido ou ausente.' }, { status: 401 });
    }

    const params = new URLSearchParams();
    params.append('token', token.trim());
    params.append('formato', 'json');
    
    const response = await fetch('https://api.tiny.com.br/api2/pedidos.pesquisa.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Tiny ERP Indisponível (HTTP ${response.status})` }, { status: response.status });
    }

    const data = await response.json();

    // Tratamento especial: Se não houver pedidos, a Tiny retorna Erro 20 (Situação não encontrada ou sem registros)
    if (data.retorno?.status === 'Erro') {
      const errorMsg = data.retorno.erros?.[0]?.erro || '';
      if (errorMsg.includes('não encontrado') || data.retorno.erros?.[0]?.codigo === '20') {
        return NextResponse.json([]); // Retorna array vazio em vez de erro
      }
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const tinyOrders = data.retorno.pedidos || [];
    
    const mappedOrders = tinyOrders.map((item: any) => {
      const p = item.pedido;
      const valor = parseFloat(p.valor_total || "0");
      const situacaoId = String(p.situacao || "");
      
      return {
        id: p.numero || p.id,
        tiny_id: p.id,
        name: p.nome || 'Cliente Olie',
        status: TINY_SITUACOES[situacaoId] || p.situacao_descricao || 'Pendente',
        price: valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        date: p.data_pedido || '--/--/----',
        product: p.descricao_itens || `Pedido #${p.numero}`,
        items: [], // Detalhes podem ser carregados sob demanda
        source: 'tiny'
      };
    });

    return NextResponse.json(mappedOrders);
  } catch (error: any) {
    console.error('Tiny Proxy Critical Failure:', error);
    return NextResponse.json({ error: 'Falha na ponte de comunicação: ' + error.message }, { status: 500 });
  }
}

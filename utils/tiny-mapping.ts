
import { ProductionStage } from '../types/index.ts';

/**
 * Mapeia o status do Tiny ERP para o estágio de manufatura do OlieHub.
 * OlieHub assume o controle da produção que o Tiny não possui nativamente.
 * 
 * @param status - O status retornado pela API do Tiny (string ou ID)
 * @returns ProductionStage - O estágio correspondente na bancada Olie
 */
export function getStageFromTinyStatus(status: string | number): ProductionStage {
  const s = String(status || '').toLowerCase();

  // 1. Bancada de CORTE: Pedidos novos ou aguardando pagamento
  if (s === '1' || s.includes('aberto') || s === '12' || s.includes('pagamento')) {
    return 'corte';
  }

  // 2. Bancada de COSTURA: Pedidos aprovados
  if (s === '2' || s.includes('aprovado')) {
    return 'costura';
  }

  // 3. Bancada de MONTAGEM: Pedidos em preparação física
  if (s === '4' || s.includes('preparação') || s.includes('separação')) {
    return 'montagem';
  }

  // 4. Bancada de ACABAMENTO: Pedidos faturados (NF emitida)
  if (s.includes('faturado') || s.includes('nota')) {
    return 'acabamento';
  }

  // 5. Bancada PRONTO/EXPEDIÇÃO: Pedidos enviados ou finalizados
  if (s === '3' || s.includes('enviado') || s.includes('finalizado') || s.includes('entregue')) {
    return 'pronto';
  }

  // Fallback de segurança: Novos pedidos sempre começam no corte
  return 'corte';
}

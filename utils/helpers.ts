
/**
 * OlieHub V2 - Helpers
 * Utilitários para transformação de dados do ERP para a interface.
 */

import { ProductionStage } from '../types/index.ts';

/**
 * Traduz os labels normalizados do Tiny ERP (via OrderService) para as etapas visuais do Kanban.
 * Utiliza o mapeamento customizado salvo no localStorage via SyncService.
 */
export const mapTinyStatusToColumn = (status: string): ProductionStage => {
  const s = status.toLowerCase();
  
  // Tenta buscar mapeamento customizado
  const storedMappings = typeof window !== 'undefined' ? localStorage.getItem('olie_status_mappings') : null;
  const mappings = storedMappings ? JSON.parse(storedMappings) : {
    'aberto': 'corte',
    'aguardando': 'corte',
    'aprovado': 'costura',
    'preparação': 'costura',
    'produção': 'montagem',
    'faturado': 'acabamento',
    'enviado': 'pronto',
    'finalizado': 'pronto'
  };

  // Retorna o mapeamento ou fallback 'corte'
  return (mappings[s] as ProductionStage) || 'corte';
};

/**
 * Legado para compatibilidade, aponta para o novo mapeador Tiny
 */
export const mapStatusToProductionStage = (status: string): ProductionStage => {
  return mapTinyStatusToColumn(status);
};

/**
 * Formata o CEP para exibição ou envio para API
 */
export const formatZipCode = (zip: string) => {
  return zip.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2');
};

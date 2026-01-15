
/**
 * OlieHub V2 - Service Adapter (The Universal Translator)
 * 
 * Este arquivo atua como a ponte entre a UI e as fontes de dados externas.
 * Permite alternar entre dados Mock e APIs Reais sem alterar os componentes.
 */

import { 
  Product, 
  CartItem, 
  Order, 
  Customer, 
  ChannelSource
} from '../types/index';
import { MOCK_PRODUCTS } from '../lib/constants';

// --- CONFIGURAÇÃO GLOBAL ---
// Alterne para false quando as APIs (TINY_TOKEN, etc) estiverem configuradas
const USE_MOCK = true;

/**
 * Utilitário para simular latência de rede e falhas randômicas.
 * @param errorChance - Probabilidade de 0 a 1 de disparar um erro.
 */
const simulateNetwork = async (errorChance = 0): Promise<void> => {
  const latency = 1000; // 1 segundo
  await new Promise(resolve => setTimeout(resolve, latency));
  
  if (Math.random() < errorChance) {
    throw new Error("Erro de Conexão: O servidor de integração não respondeu a tempo.");
  }
};

// --- SERVIÇO DE PEDIDOS (TINY ERP BRIDGE) ---
export const OrderService = {
  /**
   * Cria um pedido no ERP.
   * Implementa a transformação de "Luxury Config" para o campo de observações.
   */
  create: async (payload: CartItem[]): Promise<{ tiny_id: string; status: string }> => {
    console.log("[OrderService] Iniciando processamento de pedido...");

    if (USE_MOCK) {
      // Auditoria: 10% de chance de erro para testar spinners e avisos da UI
      await simulateNetwork(0.1); 

      // Transformação de "Lille Configuration" para string única de observação
      const formattedItems = payload.map(item => {
        const config = item.configuration;
        const obs = `Config: [COR: ${config.color}] [METAL: ${config.hardware}]${config.personalization_text ? ` [PERS: ${config.personalization_text}]` : ''}`;
        
        return {
          sku: item.product_id,
          quantidade: item.quantity,
          valor_unitario: item.unit_price,
          observacoes: obs
        };
      });

      console.debug("[MOCK ERP PAYLOAD]", formattedItems);

      return {
        tiny_id: (Math.floor(Math.random() * 90000) + 10000).toString(),
        status: 'success'
      };
    }

    // ESTRUTURA PARA API REAL (Futura Implementação)
    /*
    const response = await fetch(`${process.env.VITE_TINY_API_URL}/pedido.incluir.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: process.env.VITE_TINY_API_TOKEN!,
        formato: 'JSON',
        pedido: JSON.stringify({ ... })
      })
    });
    return response.json();
    */
    throw new Error("API Real do Tiny não configurada no ambiente.");
  }
};

// --- SERVIÇO DE CATÁLOGO (UNIFIED CATALOG) ---
export const CatalogService = {
  /**
   * Busca produtos. Pronto para merge Tiny + VNDA no futuro.
   */
  search: async (query: string): Promise<Product[]> => {
    console.log(`[CatalogService] Buscando por: "${query}"`);

    if (USE_MOCK) {
      await simulateNetwork(0); // Sem erro em busca de catálogo para fluidez
      const term = query.toLowerCase();
      
      return MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.sku_base.toLowerCase().includes(term)
      );
    }

    // No futuro: Promise.all([fetchTiny(), fetchVnda()]) e merge por SKU
    return [];
  }
};

// --- SERVIÇO DE CRM (HISTORY & LTV) ---
export const CrmService = {
  /**
   * Recupera histórico de compras do cliente.
   */
  getHistory: async (customerId: string): Promise<Order[]> => {
    console.log(`[CrmService] Recuperando histórico: ${customerId}`);

    if (USE_MOCK) {
      await simulateNetwork(0.05); // 5% de chance de erro

      // Auditoria: Handle 404 gracefully
      if (customerId === 'cust-not-found') {
        console.warn("[CRM] Cliente não possui registros históricos.");
        return [];
      }

      return [
        {
          id: 'TNY-44921',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 dias atrás
          total: 489.00,
          status: 'Entregue'
        },
        {
          id: 'TNY-55012',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 dias atrás
          total: 159.90,
          status: 'Processando'
        }
      ];
    }

    return [];
  }
};

// --- SERVIÇO OMNICHANNEL (META API ADAPTER) ---
export const OmnichannelService = {
  /**
   * Envia mensagens via APIs oficiais da Meta.
   */
  sendMessage: async (channel: ChannelSource, recipient: string, content: string): Promise<boolean> => {
    console.log(`[OmnichannelService] Canal: ${channel} | Para: ${recipient}`);

    if (USE_MOCK) {
      await simulateNetwork(0.02);

      // Diferenciação de lógica por canal (Audit)
      if (channel === 'whatsapp') {
        console.debug(`[SIMULAÇÃO META API] POST https://graph.facebook.com/v17.0/${process.env.VITE_META_PHONE_ID}/messages`);
      } else if (channel === 'instagram') {
        console.debug(`[SIMULAÇÃO GRAPH API] POST https://graph.facebook.com/v17.0/me/messages (Instagram Scope)`);
      }

      return true;
    }

    return false;
  }
};

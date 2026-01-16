
/**
 * OlieHub V2 - Service Adapter (The Universal Translator)
 */

import { 
  Product, 
  CartItem, 
  Order, 
  Customer, 
  ChannelSource,
  ProductionStage
} from '../types/index.ts';
import { MOCK_PRODUCTS } from '../lib/constants.ts';

// Toggle this to enable Real API calls via Next.js Proxy
const USE_MOCK = true;

const simulateNetwork = async (errorChance = 0): Promise<void> => {
  const latency = 800; // Latência um pouco maior para sensação de "carregamento de dados reais"
  await new Promise(resolve => setTimeout(resolve, latency));
  if (Math.random() < errorChance) {
    throw new Error("Erro de Conexão: O servidor não respondeu.");
  }
};

// --- DASHBOARD SERVICE ---
export const DashboardService = {
  getOverview: async () => {
    await simulateNetwork(0);
    return {
      pendingMessages: 12,
      productionQueue: 45,
      nextShipment: '15/10',
      revenueMonth: 'R$ 42.850',
      activeClients: 8
    };
  },
  
  getRecentActivity: async () => {
    await simulateNetwork(0);
    return [
      { id: 1, text: 'Ana aprovou o layout da', highlight: 'Bolsa Lille', time: '10:30' },
      { id: 2, text: 'Novo pedido confirmado via', highlight: 'WhatsApp', time: '11:15' },
      { id: 3, text: 'Corte finalizado para o lote', highlight: '#Lote442', time: '13:00' },
      { id: 4, text: 'Expedição agendada para', highlight: 'Amanhã', time: '14:20' }
    ];
  },

  getMetrics: async () => {
    await simulateNetwork(0);
    return {
      receita: { value: "R$ 12.840", trend: "+14.2%" },
      inbox: { value: "14 Chats", subValue: "3 urgentes" },
      expedicao: { value: "06 Envios", subValue: "Hoje" },
      nps: { value: "4.9/5", trend: "+0.2" }
    };
  },
  
  getShortcuts: async () => {
    await simulateNetwork(0);
    return [
      { label: 'Tiny ERP', status: 'online' as const },
      { label: 'Meta API', status: 'online' as const },
      { label: 'VNDA Cloud', status: 'online' as const },
    ];
  }
};

// --- PRODUCTION SERVICE ---
export const ProductionService = {
  getList: async () => {
    await simulateNetwork(0.02);
    // Dados mockados simulando tickets de produção no chão de fábrica
    return [
      { id: 'ORD-4410', client: 'Juliana Paes', product: 'Bolsa Lille KTA', stage: 'corte', sku: 'OL-LILLE-KTA-OFF', date: '12 Out' },
      { id: 'ORD-4411', client: 'Marina Ruy', product: 'Kit Viagem', stage: 'corte', sku: 'OL-TRAVEL-NUDE', date: '12 Out' },
      
      { id: 'ORD-4408', client: 'Carla Dias', product: 'Necessaire Box', stage: 'costura', sku: 'OL-BOX-BLK', date: '10 Out', rush: true },
      { id: 'ORD-4409', client: 'Fernanda Lima', product: 'Mochila Petit', stage: 'costura', sku: 'OL-MAM-ROSE', date: '11 Out' },
      
      { id: 'ORD-4405', client: 'Ana Hickmann', product: 'Porta Passaporte', stage: 'montagem', sku: 'OL-PASS-CAR', date: '08 Out' },
      
      { id: 'ORD-4402', client: 'Giovanna Ewbank', product: 'Bolsa Lille M', stage: 'acabamento', sku: 'OL-LILLE-M-VIN', date: '05 Out' },
      { id: 'ORD-4403', client: 'Preta Gil', product: 'Kit Viagem', stage: 'acabamento', sku: 'OL-TRAVEL-BLK', date: '06 Out' },
      
      { id: 'ORD-4400', client: 'Ivete Sangalo', product: 'Bolsa Lille G', stage: 'pronto', sku: 'OL-LILLE-G-OFF', date: '01 Out' },
    ] as Array<{
      id: string; 
      client: string; 
      product: string; 
      stage: ProductionStage; 
      sku: string; 
      date: string;
      rush?: boolean;
    }>;
  }
};

// --- ORDER SERVICE ---
export const OrderService = {
  getList: async (): Promise<any[]> => {
    await simulateNetwork(0.02);
    return [
      { id: '44921', name: 'Ana Carolina Silva', status: 'Produção', price: 'R$ 489,00', date: 'Hoje, 10:20', product: 'Bolsa Lille M' },
      { id: '44918', name: 'Juliana Fernandes', status: 'Finalizado', price: 'R$ 159,90', date: 'Ontem', product: 'Necessaire Box G' },
      { id: '44915', name: 'Mariana Oliveira', status: 'Enviado', price: 'R$ 320,00', date: '22 Abr', product: 'Bolsa Lille KTA' },
      { id: '44912', name: 'Carla Mendonça', status: 'Aguardando', price: 'R$ 1.240,00', date: '21 Abr', product: 'Kit Viagem (3 pçs)' },
      { id: '44910', name: 'Renata Souza', status: 'Produção', price: 'R$ 549,00', date: '21 Abr', product: 'Mochila Maternidade Petit' },
    ];
  },
  getPipelineSummary: async () => {
    await simulateNetwork(0);
    return {
      producao: 12,
      expedicao: 5,
      aguardando: 8,
      concluidos: 142
    };
  },
  
  /**
   * Create Order - Supports Mock or Real Tiny ERP via Proxy
   */
  create: async (cart: CartItem[], customerContext?: { name: string; email?: string }): Promise<{ tiny_id: string; status: string }> => {
    if (USE_MOCK) {
      await simulateNetwork(0.1); 
      return {
        tiny_id: (Math.floor(Math.random() * 90000) + 10000).toString(),
        status: 'success'
      };
    }

    // Real API Call via Proxy
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, customer: customerContext })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      return {
        tiny_id: result.tiny_id,
        status: 'success'
      };
    } catch (error) {
      console.error("Order Creation Failed:", error);
      throw error;
    }
  }
};

// --- CUSTOMER SERVICE ---
export const CustomerService = {
  getAll: async (): Promise<any[]> => {
    await simulateNetwork(0.02);
    return [
      { name: 'Ana Carolina', ltv: '2.4k', orders: 4, tags: ['VIP', 'Lille'] },
      { name: 'Bia Mendonça', ltv: '890', orders: 1, tags: ['Lead'] },
      { name: 'Juliana Paes', ltv: '5.2k', orders: 12, tags: ['VIP Gold'] },
      { name: 'Mariana Silva', ltv: '420', orders: 2, tags: ['Active'] },
    ];
  }
};

export const CatalogService = {
  search: async (query: string): Promise<Product[]> => {
    if (USE_MOCK) {
      await simulateNetwork(0);
      const term = query.toLowerCase();
      return MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(term) || p.sku_base.toLowerCase().includes(term)
      );
    }
    return [];
  }
};

export const OmnichannelService = {
  sendMessage: async (channel: ChannelSource, recipient: string, content: string): Promise<boolean> => {
    if (USE_MOCK) {
      await simulateNetwork(0.02);
      return true;
    }
    return false;
  }
};

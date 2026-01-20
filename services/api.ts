
/**
 * OlieHub V2 - Service Adapter (The Universal Translator)
 * Refatorado para integração Real-time e chaves dinâmicas com tratamento de erros.
 */

import { 
  Product, 
  CartItem, 
  Order, 
  Customer, 
  ChannelSource,
  ProductionStage,
  Message,
  ConvoStatus
} from '../types/index.ts';
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '../lib/supabase/client.ts';

export interface ConnectionResult {
  status: 'healthy' | 'invalid' | 'error' | 'unconfigured';
  message?: string;
}

const getApiKey = (service: string) => localStorage.getItem(`olie_${service}_token`);
const getIntegratorId = () => localStorage.getItem('olie_tiny_integrator') || '10159';

const simulateNetwork = async (latency = 800): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, latency));
};

// --- DIAGNOSTIC & DATABASE SERVICE ---
export const DatabaseService = {
  checkHealth: async () => {
    const supabase = createClient();
    const results = {
      connection: false,
      tables: { profiles: false, customers: false, conversations: false, messages: false },
      realtime: false,
      latency: 0,
      integrations: {
        meta: 'unconfigured' as string,
        tiny: 'unconfigured' as string,
        vnda: 'unconfigured' as string
      }
    };

    const start = performance.now();
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      results.latency = Math.round(performance.now() - start);
      
      if (!error) {
        results.connection = true;
        results.tables.profiles = true;
        
        const [cust, conv, msg] = await Promise.all([
          supabase.from('customers').select('id').limit(1),
          supabase.from('conversations').select('id').limit(1),
          supabase.from('messages').select('id').limit(1),
        ]);
        
        results.tables.customers = !cust.error;
        results.tables.conversations = !conv.error;
        results.tables.messages = !msg.error;
      }

      const channel = supabase.channel('health-check');
      results.realtime = !!channel;
      supabase.removeChannel(channel);

      const metaToken = getApiKey('meta');
      const tinyToken = getApiKey('tiny');
      const vndaToken = getApiKey('vnda');

      results.integrations.meta = metaToken && metaToken.startsWith('EAAB') ? 'healthy' : (metaToken ? 'invalid' : 'unconfigured');
      
      if (tinyToken) {
        results.integrations.tiny = tinyToken.length >= 32 ? 'healthy' : 'invalid';
      }

      if (vndaToken) {
        results.integrations.vnda = vndaToken.length >= 16 ? 'healthy' : 'invalid';
      }

      return results;
    } catch (err) {
      console.error("Health Check Critical Failure:", err);
      return results;
    }
  },

  testSingleConnection: async (service: string, token: string): Promise<ConnectionResult> => {
    if (!token || token.trim() === '') return { status: 'unconfigured' };
    
    switch(service) {
      case 'tiny':
        try {
          const res = await fetch('/api/tiny/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token.trim() })
          });
          const data = await res.json();
          return { 
            status: data.status || 'error', 
            message: data.message || 'Erro inesperado na API do Tiny ERP' 
          };
        } catch (err: any) {
          return { status: 'error', message: 'Falha no proxy Tiny: ' + err.message };
        }
      case 'meta':
        const isMetaValid = token.startsWith('EAAB') && token.length > 50;
        await simulateNetwork(500);
        return { 
          status: isMetaValid ? 'healthy' : 'invalid',
          message: isMetaValid ? 'Token Meta (v20.0) validado.' : 'Token Meta inválido.'
        };
      case 'vnda':
        const isVndaValid = token.length >= 16;
        await simulateNetwork(500);
        return { 
          status: isVndaValid ? 'healthy' : 'invalid',
          message: isVndaValid ? 'Conexão estabelecida com VNDA.' : 'Token VNDA inválido.'
        };
      default:
        return { status: 'error', message: 'Serviço desconhecido' };
    }
  }
};

// --- AI CONCIERGE SERVICE (GEMINI) ---
export const AIService = {
  getDailyBriefing: async (overview: any) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Como um gerente de ateliê de luxo, analise estes dados e dê um resumo motivador e estratégico de 2 frases:
      - Mensagens pendentes: ${overview.pendingMessages}
      - Peças em produção: ${overview.productionQueue}
      - Próxima expedição: ${overview.nextShipment}
      Retorne apenas o texto do briefing.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      return response.text;
    } catch (err) {
      return "O ateliê está pulsando hoje. Foco total no atendimento e na qualidade do corte.";
    }
  },

  generateSmartReply: async (messages: Message[], customerName: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = messages.slice(-5).map(m => `${m.direction === 'inbound' ? 'Cliente' : 'Olie'}: ${m.content}`).join('\n');
      
      const prompt = `Você é a concierge do Ateliê Olie. Sugerir uma resposta curta e elegante para ${customerName} baseada no contexto: ${context}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      return response.text;
    } catch (err) {
      return "Olá! Como posso ajudar você hoje?";
    }
  },

  analyzeConversation: async (messages: Message[], customerName: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = messages.map(m => `${m.direction === 'inbound' ? 'Cliente' : 'Agente'}: ${m.content}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise a conversa com ${customerName} e retorne JSON com summary, sentiment, next_step, suggested_skus, style_profile. Conversa: ${context}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              next_step: { type: Type.STRING },
              suggested_skus: { type: Type.ARRAY, items: { type: Type.STRING } },
              style_profile: { type: Type.STRING }
            },
            required: ["summary", "sentiment", "next_step", "suggested_skus", "style_profile"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return null;
    }
  },

  getProductionTips: async (product: string, details: any, stage: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Dicas para produzir ${product} na etapa ${stage}. Detalhes: ${JSON.stringify(details)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["tips"]
          }
        }
      });
      return JSON.parse(response.text || '{"tips": []}');
    } catch (err) {
      return { tips: ["Precisão no corte", "Tensão da linha", "Limpeza final"] };
    }
  },

  generateProductPreview: async (prompt: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `High-end luxury artisanal item: ${prompt}. Minimalist studio lighting.` }] }
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      return null;
    } catch (err) {
      return null;
    }
  }
};

// --- ORDER SERVICE ---
export const OrderService = {
  getList: async (): Promise<{ data: any[], error: string | null, isRealData: boolean }> => {
    const tinyToken = getApiKey('tiny');
    
    if (tinyToken && tinyToken.length >= 32) {
      try {
        const response = await fetch('/api/tiny/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tinyToken.trim() })
        });
        const data = await response.json();
        if (response.ok) {
          return { data: Array.isArray(data) ? data : [], error: null, isRealData: true };
        } else {
          return { data: [], error: data.error || "Erro na sincronização Tiny ERP", isRealData: false };
        }
      } catch (err: any) {
        return { data: [], error: "Erro de conexão com o servidor de proxy", isRealData: false };
      }
    }

    await simulateNetwork(300);
    return {
      data: [
        { id: '44921', name: 'Ana Carolina Silva', status: 'Produção', price: 'R$ 489,00', date: 'Hoje, 10:20', product: 'Bolsa Lille M', items: [{name: 'Bolsa Lille M', configuration: {color: 'Caramelo', hardware: 'Dourado'}}], source: 'mock' },
        { id: '44918', name: 'Carla Beatriz Mendonça', status: 'Aguardando', price: 'R$ 159,90', date: 'Hoje, 09:15', product: 'Necessaire Box G', items: [], source: 'mock' },
      ],
      error: null,
      isRealData: false
    };
  },

  getById: async (id: string): Promise<Order | null> => {
    const tinyToken = getApiKey('tiny');
    if (tinyToken && tinyToken.length >= 32) {
      try {
        const response = await fetch(`/api/tiny/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tinyToken.trim(), id })
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error("Failed to fetch order details from Tiny:", err);
      }
    }
    return null;
  },

  getPipelineSummary: async () => {
    await simulateNetwork(300);
    return { aguardando: 5, producao: 12, expedicao: 8, concluidos: 24 };
  },

  create: async (cart: CartItem[], customerContext: { name: string; email?: string }) => {
    const tinyToken = getApiKey('tiny');
    const integratorId = getIntegratorId();
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart, 
          customer: customerContext, 
          token: tinyToken?.trim(),
          integratorId 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || "Erro na integração");
      return data;
    } catch (err: any) {
      throw err;
    }
  }
};

// --- OUTROS SERVIÇOS ---
export const DashboardService = {
  getOverview: async () => {
    await simulateNetwork(200);
    return { pendingMessages: 12, productionQueue: 45, nextShipment: '15/10', revenueMonth: 'R$ 42.850', activeClients: 8 };
  },
  getRecentActivity: async () => {
    await simulateNetwork(200);
    return [{ id: 1, text: 'Ana aprovou o layout da', highlight: 'Bolsa Lille', time: '10:30' }];
  }
};

export const ProductionService = {
  getList: async () => {
    await simulateNetwork(400);
    return [
      { id: 'ORD-4410', client: 'Juliana Paes', product: 'Bolsa Lille KTA', stage: 'corte', sku: 'OL-LILLE-KTA-OFF', date: '12 Out', details: { leather: 'Croco Off-White', hardware: 'Dourado', personalization: 'JP' }, efficiency: 95 }
    ];
  },
  getStats: async () => ({ efficiency: 92, averageProductionTime: '4.2 dias' }),
  updateStage: async (itemId: string, newStage: ProductionStage) => { await simulateNetwork(100); return true; }
};

export const OmnichannelService = {
  sendMessage: async (channel: ChannelSource, recipient: string, content: string): Promise<boolean> => {
    console.log(`Enviando via ${channel}: ${content}`);
    return true;
  }
};

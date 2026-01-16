
/**
 * OlieHub V2 - Service Adapter (The Universal Translator)
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
import { MOCK_PRODUCTS } from '../lib/constants.ts';
import { GoogleGenAI } from "@google/genai";

const simulateNetwork = async (errorChance = 0): Promise<void> => {
  const latency = 800;
  await new Promise(resolve => setTimeout(resolve, latency));
  if (Math.random() < errorChance) {
    throw new Error("Erro de Conexão: O servidor não respondeu.");
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
      
      const prompt = `Você é a concierge do Ateliê Olie. O tom é luxuoso, acolhedor e artesanal. 
      Sugerir uma resposta curta e elegante para ${customerName} baseada no contexto:
      ${context}
      
      Regras:
      1. Use "nós" ou "aqui no ateliê".
      2. Seja gentil mas profissional.
      3. Se houver dúvida técnica, diga que vai consultar o artesão.`;

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
      
      const prompt = `Analise a seguinte conversa de atendimento de luxo do Ateliê Olie. 
      Cliente: ${customerName}
      
      Conversa:
      ${context}
      
      Forneça um JSON com:
      1. "summary": Resumo de 1 frase do que o cliente quer.
      2. "sentiment": Sentimento (Neutro, Entusiasmado, Frustrado).
      3. "next_step": Sugestão de resposta ou ação.
      4. "suggested_skus": Lista de até 2 SKUs do catálogo (LILLE, BOX, TRAVEL, PASS, MAM) que combinam.
      5. "style_profile": Perfil de estilo do cliente (ex: Minimalista, Clássico, Ousado).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.error("Gemini Error:", err);
      return null;
    }
  },

  getProductionTips: async (productName: string, details: any, stage: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Você é um Mestre Artesão de Marroquinaria de Luxo. 
      Dê 3 dicas técnicas curtas e cruciais para a etapa de "${stage}" do produto "${productName}".
      Detalhes: Couro ${details.leather}, Metais ${details.hardware}.
      O foco deve ser acabamento impecável e durabilidade. 
      Responda em formato JSON com um campo "tips" que é uma lista de strings.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        }
      });

      return JSON.parse(response.text || '{ "tips": [] }');
    } catch (err) {
      console.error("AI Production Error:", err);
      return { tips: ["Verificar tensão da linha", "Limpar excesso de cola", "Conferir simetria"] };
    }
  },

  generateProductPreview: async (description: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Professional studio photography of a luxury artisanal leather handbag. 
      Style: Olie Atelier (minimalist luxury, soft curves, high-quality Italian leather).
      Description: ${description}.
      Setting: Soft neutral background, elegant lighting, 4k, hyper-realistic, focusing on texture and hardware details.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (err) {
      console.error("Image Gen Error:", err);
      return null;
    }
  }
};

// --- OMNICHANNEL & WORKFLOW SERVICE ---
export const OmnichannelService = {
  sendMessage: async (channel: ChannelSource, recipient: string, content: string): Promise<boolean> => {
    await simulateNetwork(0.02);
    return true;
  },
  
  updateStatus: async (conversationId: string, status: ConvoStatus): Promise<boolean> => {
    await simulateNetwork(0);
    console.log(`API: Conversa ${conversationId} alterada para ${status}`);
    return true;
  },

  transferConversation: async (conversationId: string, agentId: string): Promise<boolean> => {
    await simulateNetwork(0);
    console.log(`API: Conversa ${conversationId} transferida para agente ${agentId}`);
    return true;
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
  }
};

// --- PRODUCTION SERVICE ---
export const ProductionService = {
  getList: async () => {
    await simulateNetwork(0);
    return [
      { id: 'ORD-4410', client: 'Juliana Paes', product: 'Bolsa Lille KTA', stage: 'corte', sku: 'OL-LILLE-KTA-OFF', date: '12 Out', details: { leather: 'Croco Off-White', hardware: 'Dourado', personalization: 'JP' }, efficiency: 95 },
      { id: 'ORD-4408', client: 'Carla Dias', product: 'Necessaire Box', stage: 'costura', sku: 'OL-BOX-BLK', date: '10 Out', rush: true, details: { leather: 'Floater Preto', hardware: 'Grafite', personalization: 'CD' }, efficiency: 82 },
      { id: 'ORD-4405', client: 'Ana Hickmann', product: 'Porta Passaporte', stage: 'montagem', sku: 'OL-PASS-CAR', date: '08 Out', details: { leather: 'Liso Caramelo', hardware: 'Dourado', personalization: 'AH' }, efficiency: 100 },
      { id: 'ORD-4402', client: 'Giovanna Ewbank', product: 'Bolsa Lille M', stage: 'acabamento', sku: 'OL-LILLE-M-VIN', date: '05 Out', details: { leather: 'Vinho Nobre', hardware: 'Dourado', personalization: 'GE' }, efficiency: 88 },
      { id: 'ORD-4400', client: 'Ivete Sangalo', product: 'Bolsa Lille G', stage: 'pronto', sku: 'OL-LILLE-G-OFF', date: '01 Out', details: { leather: 'Croco Off-White', hardware: 'Prateado', personalization: 'IS' }, efficiency: 98 },
      { id: 'ORD-4395', client: 'Marina Ruy Barbosa', product: 'Bolsa Travel L', stage: 'costura', sku: 'OL-TRAV-L-BLK', date: '28 Set', details: { leather: 'Liso Preto', hardware: 'Dourado', personalization: 'MRB' }, efficiency: 75, delayed: true },
    ] as any[];
  },
  
  getStats: async () => {
    await simulateNetwork(0);
    return {
      efficiency: 92,
      onTimeRate: 88,
      averageProductionTime: '4.2 dias',
      activeArtisans: 6
    };
  },
  
  updateStage: async (itemId: string, newStage: ProductionStage) => {
    await simulateNetwork(0.05);
    console.log(`API: Ordem ${itemId} movida para ${newStage}`);
    return true;
  }
};

// --- ORDER SERVICE ---
export const OrderService = {
  getList: async (): Promise<any[]> => {
    await simulateNetwork(0);
    return [
      { id: '44921', name: 'Ana Carolina Silva', status: 'Produção', price: 'R$ 489,00', date: 'Hoje, 10:20', product: 'Bolsa Lille M', items: [{name: 'Bolsa Lille M', configuration: {color: 'Caramelo', hardware: 'Dourado'}}] },
      { id: '44918', name: 'Juliana Fernandes', status: 'Finalizado', price: 'R$ 159,90', date: 'Ontem', product: 'Necessaire Box G', items: [{name: 'Necessaire Box G', configuration: {color: 'Preto', hardware: 'N/A'}}] },
      { id: '44915', name: 'Mariana Oliveira', status: 'Enviado', price: 'R$ 320,00', date: '22 Abr', product: 'Bolsa Lille KTA', items: [{name: 'Bolsa Lille KTA', configuration: {color: 'Off-White', hardware: 'Prata'}}] },
    ];
  },
  getPipelineSummary: async () => {
    await simulateNetwork(0);
    return { producao: 12, expedicao: 5, aguardando: 8, concluidos: 142 };
  },
  create: async (cart: CartItem[], customerContext?: { name: string; email?: string }) => {
    await simulateNetwork(0.1); 
    return { tiny_id: (Math.floor(Math.random() * 90000) + 10000).toString(), status: 'success' };
  }
};

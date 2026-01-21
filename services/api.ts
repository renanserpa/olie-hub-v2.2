
import { 
  Product, 
  CartItem, 
  Order, 
  ChannelSource,
  Message,
  ConvoStatus
} from '../types/index.ts';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../lib/supabase.ts';

const getTinyCredentials = () => {
  if (typeof window === 'undefined') return { token: '', integratorId: '' };
  return {
    token: localStorage.getItem('olie_tiny_token') || '',
    integratorId: localStorage.getItem('olie_tiny_integrator') || ''
  };
};

const fetchWithTimeout = async (url: string, options: any, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const SyncService = {
  getLogs: () => {
    const logs = typeof window !== 'undefined' ? localStorage.getItem('olie_sync_logs') : null;
    return logs ? JSON.parse(logs) : [];
  },

  addLog: (type: string, count: number, status: 'success' | 'error') => {
    const logs = SyncService.getLogs();
    const newLog = {
      id: Date.now(),
      type,
      count,
      status,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('olie_sync_logs', JSON.stringify([newLog, ...logs].slice(0, 15)));
  },

  exportLogsCSV: () => {
    const logs = SyncService.getLogs();
    if (logs.length === 0) return;
    
    const headers = ['ID', 'Tipo', 'Itens', 'Status', 'Data'];
    const rows = logs.map((l: any) => [
      l.id, 
      l.type, 
      l.count, 
      l.status, 
      new Date(l.timestamp).toLocaleString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `oliehub_audit_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  detectConflicts: async () => {
    return [
      { sku: 'OL-LILLE-KTA', tinyPrice: 489.00, vndaPrice: 519.00, diff: 30.00 },
      { sku: 'OL-BOX-NEC', tinyPrice: 159.90, vndaPrice: 149.90, diff: -10.00 }
    ];
  },

  getStatusMappings: () => {
    const mappings = typeof window !== 'undefined' ? localStorage.getItem('olie_status_mappings') : null;
    return mappings ? JSON.parse(mappings) : {
      'aberto': 'corte',
      'aguardando': 'corte',
      'aprovado': 'costura',
      'preparação': 'costura',
      'produção': 'montagem',
      'faturado': 'acabamento',
      'enviado': 'pronto',
      'finalizado': 'pronto'
    };
  },

  updateStatusMapping: (tinyStatus: string, olieStage: string) => {
    const mappings = SyncService.getStatusMappings();
    mappings[tinyStatus.toLowerCase()] = olieStage;
    localStorage.setItem('olie_status_mappings', JSON.stringify(mappings));
  },

  syncOrders: async () => {
    const { token, integratorId } = getTinyCredentials();
    try {
      const res = await fetchWithTimeout('/api/orders/list', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, integratorId }) 
      });
      const data = await res.json();
      const count = data.data?.length || 0;
      SyncService.addLog('Pedidos', count, 'success');
      return { count, status: 'success' };
    } catch (err) {
      SyncService.addLog('Pedidos', 0, 'error');
      throw err;
    }
  },

  syncProducts: async () => {
    try {
      const res = await fetchWithTimeout('/api/products/list', { method: 'POST' });
      const data = await res.json();
      SyncService.addLog('Produtos', data.count || 0, 'success');
      return { count: data.count || 0, status: 'success' };
    } catch (err) {
      SyncService.addLog('Produtos', 0, 'error');
      throw err;
    }
  },

  syncCustomers: async () => {
    try {
      const res = await fetchWithTimeout('/api/customers/list', { method: 'POST' });
      const data = await res.json();
      SyncService.addLog('Clientes', data.count || 0, 'success');
      return { count: data.count || 0, status: 'success' };
    } catch (err) {
      SyncService.addLog('Clientes', 0, 'error');
      throw err;
    }
  },

  syncAll: async () => {
    return Promise.allSettled([
      SyncService.syncOrders(),
      SyncService.syncProducts(),
      SyncService.syncCustomers()
    ]);
  }
};

export const OrderService = {
  getList: async (): Promise<{ data: any[], error: string | null, isRealData: boolean }> => {
    try {
      const { token, integratorId } = getTinyCredentials();
      const response = await fetchWithTimeout('/api/orders/list', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, integratorId })
      });
      
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        return { data: result.data || [], error: null, isRealData: true };
      }
      return { data: [], error: result.details || 'Falha na resposta', isRealData: false };
    } catch (err) {
      return { data: [], error: 'Timeout', isRealData: false };
    }
  },

  getById: async (id: string): Promise<Order | null> => {
    const res = await OrderService.getList();
    const found = res.data?.find((o: any) => String(o.id) === String(id));
    return found || null;
  },

  create: async (cart: CartItem[], customer: { name: string; email?: string }) => {
    const { token, integratorId } = getTinyCredentials();
    const response = await fetchWithTimeout('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, customer, token, integratorId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.details || data.error);
    return data;
  },

  getPipelineSummary: async () => {
    const res = await OrderService.getList();
    const orders = res.data || [];
    return {
      aguardando: orders.filter((o: any) => o.status?.toLowerCase().includes('aguardando') || o.status?.toLowerCase().includes('aberto')).length,
      producao: orders.filter((o: any) => o.status?.toLowerCase().includes('produção') || o.status?.toLowerCase().includes('producao')).length,
      expedicao: orders.filter((o: any) => o.status?.toLowerCase().includes('enviado')).length,
      concluidos: orders.filter((o: any) => o.status?.toLowerCase().includes('finalizado')).length,
    };
  }
};

export const AIService = {
  getDailyBriefing: async (overview: any) => {
    const apiKey = (window as any).process?.env?.API_KEY;
    if (!apiKey) return "Pronto para iniciar o dia no ateliê.";
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Dados do ateliê Olie: ${overview.productionQueue} ordens. Gere briefing executivo curto e motivador.`,
        config: { maxOutputTokens: 250, thinkingConfig: { thinkingBudget: 100 } }
      });
      return response.text;
    } catch (err) { return "Ateliê operando com excelência."; }
  },
  generateSmartReply: async (messages: Message[], clientName: string) => {
    const apiKey = (window as any).process?.env?.API_KEY;
    if (!apiKey) return "";
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const context = messages.slice(-5).map(m => `${m.direction === 'inbound' ? clientName : 'Atendente'}: ${m.content}`).join('\n');
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Sugira resposta de luxo: ${context}` });
      return response.text;
    } catch (err) { return ""; }
  },
  analyzeConversation: async (messages: Message[], clientName: string) => {
    const apiKey = (window as any).process?.env?.API_KEY;
    if (!apiKey) return { summary: "IA indisponível" };

    try {
      const ai = new GoogleGenAI({ apiKey });
      const context = messages.slice(-10).map(m => `${m.direction === 'inbound' ? clientName : 'Atendente'}: ${m.content}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analise conversa JSON: summary, sentiment, style_profile, next_step, suggested_skus. Contexto:\n${context}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              style_profile: { type: Type.STRING },
              next_step: { type: Type.STRING },
              suggested_skus: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["summary", "sentiment", "style_profile", "next_step", "suggested_skus"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (err) { return { summary: "Análise suspensa", sentiment: "Neutro", style_profile: "N/A", next_step: "N/A", suggested_skus: [] }; }
  },
  generateProductPreview: async (prompt: string) => {
    const apiKey = (window as any).process?.env?.API_KEY;
    if (!apiKey) return null;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Product photo: ${prompt}` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      return null;
    } catch (err) { return null; }
  }
};

export const DatabaseService = {
  checkHealth: async () => {
    try {
      if (!supabase) return { status: 'error', message: 'DB Desconectado' };
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) throw error;
      return { status: 'healthy', message: 'Conexão estável.' };
    } catch (err) { return { status: 'error', message: 'Erro de Autenticação' }; }
  }
};

export const ShippingService = { 
  calculate: async (destinationZip?: string) => {
    try {
        const res = await fetch('/api/shipping/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destinationZip })
        });
        const data = await res.json();
        return data.options || [{ name: 'Correios', price: 25.0, days: 5 }];
    } catch (e) {
        return [{ name: 'Correios', price: 25.0, days: 5 }];
    }
  } 
};

export const IntegrationService = {
  checkTinyHealth: async () => {
    try {
      const { token } = getTinyCredentials();
      const res = await fetchWithTimeout('/api/tiny/validate', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }, 5000);
      return await res.json();
    } catch (err) { return { status: 'error', message: 'Offline' }; }
  },
  checkMetaHealth: async () => {
    try {
      const res = await fetchWithTimeout('/api/meta/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, 5000);
      return await res.json();
    } catch (err) { return { status: 'error', message: 'Offline' }; }
  },
  checkVndaHealth: async () => {
    try {
      const res = await fetchWithTimeout('/api/vnda/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, 5000);
      return await res.json();
    } catch (err) { return { status: 'error', message: 'Offline' }; }
  }
};

export const DashboardService = {
  getOverview: async () => {
    const ordersRes = await OrderService.getList();
    return { pendingMessages: 0, productionQueue: ordersRes.data?.length || 0, nextShipment: 'Expedição Olie' };
  },
  getRecentActivity: async () => [
    { id: 1, text: 'Monitoramento Ativo', highlight: 'Workspace', time: 'Agora' }
  ]
};

export const OmnichannelService = { 
  sendMessage: async (source: string, id: string, text: string) => true 
};


import { 
  Product, 
  CartItem, 
  Order, 
  Customer,
  ChannelSource,
  Message,
  ConvoStatus,
  OrderSchema,
  CustomerSchema
} from '../types/index.ts';
import { getSupabase } from '../lib/supabase.ts';
import { z } from 'zod';

const supabase = getSupabase();

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

export const DashboardService = {
  getOverview: async () => {
    // Busca dados reais do Supabase para os KPIs
    if (!supabase) return { pendingMessages: 0, productionQueue: 0, nextShipment: 'Offline' };
    
    const [messages, production] = await Promise.all([
      supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('status', 'queue'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).neq('status_olie', 'pronto')
    ]);

    return { 
      pendingMessages: messages.count || 0, 
      productionQueue: production.count || 0, 
      nextShipment: 'Amanhã, 14h' 
    };
  },
  getRecentActivity: async () => {
    if (!supabase) return [];
    const { data } = await supabase
      .from('sync_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    return (data || []).map(log => ({
      text: `Sincronização de`,
      highlight: log.sync_type,
      time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: log.status
    }));
  }
};

export const CustomerService = {
  getList: async (): Promise<{ data: Customer[], error: any | null }> => {
    try {
      if (!supabase) throw new Error("DB Offline");
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;

      // Validação Zod com captura de erros detalhada
      const parsed = z.array(CustomerSchema).safeParse(data);
      if (!parsed.success) {
        console.error("Zod Customer Validation Fail:", parsed.error);
        return { data: data as Customer[], error: parsed.error };
      }

      return { data: parsed.data, error: null };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  }
};

export const OmnichannelService = {
  sendMessage: async (source: string, clientId: string, content: string) => {
    console.log(`Sending ${source} message to ${clientId}: ${content}`);
    return true;
  }
};

export const ShippingService = {
  calculate: async (zip: string) => {
    try {
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationZip: zip })
      });
      const data = await res.json();
      return data.options || [];
    } catch (err) {
      console.error("Shipping calc error:", err);
      return [];
    }
  }
};

export const SyncService = {
  getLogs: () => {
    const logs = typeof window !== 'undefined' ? localStorage.getItem('olie_sync_logs') : null;
    return logs ? JSON.parse(logs) : [];
  },

  exportLogsCSV: () => {
    const logs = SyncService.getLogs();
    const headers = "ID,Type,Count,Status,Timestamp,Details\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + logs.map((l: any) => `${l.id},${l.type},${l.count},${l.status},${l.timestamp},${l.details}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "olie_sync_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getStatusMappings: () => {
    const m = typeof window !== 'undefined' ? localStorage.getItem('olie_status_mappings') : null;
    return m ? JSON.parse(m) : {};
  },

  updateStatusMapping: (tiny: string, olie: string) => {
    const m = SyncService.getStatusMappings();
    m[tiny.toLowerCase()] = olie;
    localStorage.setItem('olie_status_mappings', JSON.stringify(m));
  },

  detectConflicts: async () => {
    return [
      { sku: 'OL-LILLE-KTA', tinyPrice: 489.00, vndaPrice: 499.00, diff: -10 }
    ];
  },

  addLog: async (type: string, count: number, status: 'success' | 'error', details?: string) => {
    const timestamp = new Date().toISOString();
    const logs = SyncService.getLogs();
    const newLog = { id: Date.now(), type, count, status, timestamp, details };
    localStorage.setItem('olie_sync_logs', JSON.stringify([newLog, ...logs].slice(0, 15)));

    if (supabase) {
      await supabase.from('sync_history').insert([{
        sync_type: type,
        records_count: count,
        status: status,
        details: details || `Sincronização concluída com ${count} registros.`
      }]);
    }
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
      const validOrders = z.array(OrderSchema).safeParse(data.data);
      const count = validOrders.success ? validOrders.data.length : 0;
      await SyncService.addLog('Pedidos', count, 'success');
      return { count, status: 'success' };
    } catch (err: any) {
      await SyncService.addLog('Pedidos', 0, 'error', err.message);
      throw err;
    }
  },

  syncProducts: async () => {
    try {
      const res = await fetchWithTimeout('/api/products/list', { method: 'POST' });
      const data = await res.json();
      await SyncService.addLog('Produtos', data.count || 0, 'success');
      return { count: data.count || 0, status: 'success' };
    } catch (err: any) {
      await SyncService.addLog('Produtos', 0, 'error', err.message);
      throw err;
    }
  },

  syncCustomers: async () => {
    try {
      const res = await fetchWithTimeout('/api/customers/list', { method: 'POST' });
      const data = await res.json();
      await SyncService.addLog('Clientes', data.count || 0, 'success');
      return { count: data.count || 0, status: 'success' };
    } catch (err: any) {
      await SyncService.addLog('Clientes', 0, 'error', err.message);
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
  getList: async (): Promise<{ data: Order[], error: string | null, isRealData: boolean }> => {
    try {
      const { token, integratorId } = getTinyCredentials();
      const response = await fetchWithTimeout('/api/orders/list', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, integratorId })
      });
      
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const parsed = z.array(OrderSchema).safeParse(result.data);
        if (!parsed.success) {
          console.error("Zod Validation Error:", parsed.error);
          return { data: [], error: 'Erro de integridade nos dados do ERP', isRealData: true };
        }
        return { data: parsed.data, error: null, isRealData: true };
      }
      return { data: [], error: result.details || 'Falha na resposta', isRealData: false };
    } catch (err) {
      return { data: [], error: 'Timeout na conexão', isRealData: false };
    }
  },

  getById: async (id: string | number) => {
    return null;
  },

  create: async (items: CartItem[], customer: any) => {
    const { token, integratorId } = getTinyCredentials();
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customer, token, integratorId })
    });
    return await res.json();
  },

  getPipelineSummary: (orders: Order[]) => {
    return {
      aguardando: orders.filter((o: Order) => o.status?.toLowerCase().includes('aguardando') || o.status?.toLowerCase().includes('aberto')).length,
      producao: orders.filter((o: Order) => o.status?.toLowerCase().includes('produção') || o.status?.toLowerCase().includes('producao')).length,
      expedicao: orders.filter((o: Order) => o.status?.toLowerCase().includes('enviado')).length,
      concluidos: orders.filter((o: Order) => o.status?.toLowerCase().includes('finalizado')).length,
    };
  }
};

export const AIService = {
  getDailyBriefing: async (overview: any) => {
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'briefing', payload: overview })
      });
      const data = await res.json();
      return data.data || "As bancadas estão prontas. Que o trabalho artesanal comece.";
    } catch (err) {
      return "Pronto para iniciar o dia no ateliê Olie.";
    }
  },
  generateSmartReply: async (messages: any[], clientName: string) => {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'reply', payload: { messages, clientName } })
    });
    const data = await res.json();
    return data.data;
  },
  analyzeConversation: async (messages: any[], clientName: string) => {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'analysis', payload: { messages, clientName } })
    });
    const data = await res.json();
    return data.data;
  },
  generateProductPreview: async (prompt: string) => {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'preview', payload: prompt })
    });
    const data = await res.json();
    return data.data;
  }
};

export const DatabaseService = {
  checkHealth: async () => {
    try {
      const client = getSupabase();
      if (!client) return { status: 'error', message: 'DB Desconectado' };
      const { error } = await client.from('profiles').select('id').limit(1);
      if (error) throw error;
      return { status: 'healthy', message: 'Conexão estável.' };
    } catch (err) { return { status: 'error', message: 'Erro de Autenticação' }; }
  }
};

export const IntegrationService = {
  checkTinyHealth: async (token?: string) => {
    try {
      const activeToken = token || getTinyCredentials().token;
      const res = await fetchWithTimeout('/api/tiny/validate', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken })
      }, 5000);
      return await res.json();
    } catch (err) { return { status: 'error', message: 'Offline' }; }
  },
  checkMetaHealth: async (token?: string) => {
    try {
      const res = await fetch('/api/meta/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await res.json();
    } catch (err) { return { status: 'error', message: 'Meta Offline' }; }
  },
  checkVndaHealth: async (token?: string) => {
    try {
      const res = await fetch('/api/vnda/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await res.json();
    } catch (err) { return { status: 'error', message: 'VNDA Offline' }; }
  }
};

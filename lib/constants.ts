import { 
  MessageCircle, 
  Instagram, 
  Pin, 
  Facebook, 
  Mail,
  Scissors,
  Zap,
  Hammer,
  Sparkles,
  Package,
  DollarSign,
  CheckCircle2,
  Send,
  Clock
} from 'lucide-react';
// Fix: Explicitly import from types/index.ts to resolve ambiguity between types.ts and types/index.ts, ensuring V3 types are used.
import { 
  ChannelSource, 
  SalesStage, 
  ProductionStage, 
  Product, 
  Conversation 
} from '../types/index.ts';

/**
 * CHANNEL_CONFIG
 * Visual identity and UI helpers for each source.
 */
export const CHANNEL_CONFIG: Record<ChannelSource, { 
  label: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
}> = {
  whatsapp: { 
    label: 'WhatsApp', 
    icon: MessageCircle, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200' 
  },
  instagram: { 
    label: 'Instagram', 
    icon: Instagram, 
    color: 'text-pink-600', 
    bg: 'bg-pink-50', 
    border: 'border-pink-200' 
  },
  pinterest: { 
    label: 'Pinterest', 
    icon: Pin, 
    color: 'text-rose-600', 
    bg: 'bg-rose-50', 
    border: 'border-rose-200' 
  },
  facebook: { 
    label: 'Messenger', 
    icon: Facebook, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200' 
  },
  email: { 
    label: 'E-mail', 
    icon: Mail, 
    color: 'text-slate-600', 
    bg: 'bg-slate-50', 
    border: 'border-slate-200' 
  },
};

/**
 * SALES_STAGES
 * The commercial pipeline definitions.
 */
export const SALES_STAGES_CONFIG: Record<SalesStage, { label: string; icon: any; color: string }> = {
  cobrar: { label: 'A Cobrar', icon: DollarSign, color: 'text-orange-500' },
  pago: { label: 'Pago', icon: CheckCircle2, color: 'text-emerald-500' },
  producao: { label: 'Em Produção', icon: Clock, color: 'text-[#C08A7D]' },
  enviado: { label: 'Enviado', icon: Send, color: 'text-blue-500' },
  entregue: { label: 'Entregue', icon: Package, color: 'text-slate-500' },
};

/**
 * PRODUCTION_STAGES
 * The artisanal workshop (Make-to-order) pipeline.
 */
export const PRODUCTION_STAGES_CONFIG: Record<ProductionStage, { label: string; icon: any; emoji: string }> = {
  corte: { label: 'Corte', icon: Scissors, emoji: '✂️' },
  costura: { label: 'Costura', icon: Zap, emoji: '🧵' },
  montagem: { label: 'Montagem', icon: Hammer, emoji: '🔨' },
  acabamento: { label: 'Acabamento', icon: Sparkles, emoji: '✨' },
  pronto: { label: 'Pronto', icon: Package, emoji: '📦' },
};

/**
 * MOCK_PRODUCTS
 * The initial catalog of customizable Olie items.
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku_base: 'OL-LILLE-KTA',
    name: 'Bolsa Lille KTA',
    category_id: 'bolsas',
    base_price: 489.00,
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
    options: {
      colors: [
        { label: 'Caramelo', hex: '#C68E5F', value: 'caramelo' },
        { label: 'Preto', hex: '#1A1A1A', value: 'preto' },
        { label: 'Off-White', hex: '#FAF9F6', value: 'off-white' },
        { label: 'Vinho', hex: '#4B0011', value: 'vinho' },
      ],
      hardware: ['Dourado', 'Prateado'],
      personalization: { allowed: true, max_chars: 4, type: 'monogram' }
    }
  },
  {
    id: 'p2',
    sku_base: 'OL-BOX-NEC',
    name: 'Necessaire Box G',
    category_id: 'necessaires',
    base_price: 159.90,
    image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&q=80',
    options: {
      colors: [
        { label: 'Linho Natural', hex: '#E3DAC9', value: 'linho' },
        { label: 'Sintético Preto', hex: '#111111', value: 'preto' },
        { label: 'Azul Marinho', hex: '#002366', value: 'marinho' },
      ],
      hardware: ['Dourado'],
      personalization: { allowed: true, max_chars: 10, type: 'text' }
    }
  },
  {
    id: 'p3',
    sku_base: 'OL-TRAVEL-KIT',
    name: 'Kit Viagem (3 pçs)',
    category_id: 'viagem',
    base_price: 298.00,
    image_url: 'https://images.unsplash.com/photo-1544816153-199d88f6573d?w=500&q=80',
    options: {
      colors: [
        { label: 'Nude', hex: '#E6D3C8', value: 'nude' },
        { label: 'Preto Clássico', hex: '#1A1A1A', value: 'preto' },
      ],
      hardware: ['Dourado', 'Prateado'],
      personalization: { allowed: false, max_chars: 0, type: 'text' }
    }
  },
  {
    id: 'p4',
    sku_base: 'OL-PASSPORT-TAG',
    name: 'Porta Passaporte Lux',
    category_id: 'acessorios',
    base_price: 89.00,
    image_url: 'https://images.unsplash.com/photo-1594465919760-442ee32a9a7a?w=500&q=80',
    options: {
      colors: [
        { label: 'Caramelo', hex: '#C68E5F', value: 'caramelo' },
        { label: 'Preto', hex: '#1A1A1A', value: 'preto' },
      ],
      hardware: ['Dourado'],
      personalization: { allowed: true, max_chars: 2, type: 'monogram' }
    }
  },
  {
    id: 'p5',
    sku_base: 'OL-MAM-BACK',
    name: 'Mochila Maternidade Petit',
    category_id: 'petit',
    base_price: 549.00,
    image_url: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500&q=80',
    options: {
      colors: [
        { label: 'Off-White', hex: '#FAF9F6', value: 'off-white' },
        { label: 'Rosa Chá', hex: '#E1B3B3', value: 'rosa' },
      ],
      hardware: ['Dourado'],
      personalization: { allowed: true, max_chars: 15, type: 'text' }
    }
  }
];

/**
 * MOCK_CONVERSATIONS
 * Initial data for UI demonstration.
 */
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    customer_id: 'cust-1',
    customer: {
      id: 'cust-1',
      full_name: 'Ana Carolina Silva',
      email: 'ana.silva@gmail.com',
      phone: '5511999998888',
      channel_source: 'instagram',
      total_orders: 0,
      ltv: 0,
      tags: ['Dúvida Produto', 'Lead Frio']
    },
    status: 'assigned',
    sales_stage: 'cobrar',
    assignee_id: 'agent-1',
    last_message: 'Qual o tamanho real da Lille M?',
    last_message_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    unread_count: 1,
  },
  {
    id: 'c2',
    customer_id: 'cust-2',
    customer: {
      id: 'cust-2',
      full_name: 'Carla Beatriz Mendonça',
      email: 'carla.m@uol.com.br',
      phone: '5521988887777',
      channel_source: 'whatsapp',
      total_orders: 2,
      ltv: 940.00,
      tags: ['Cliente VIP', 'Lille Lover']
    },
    status: 'assigned',
    sales_stage: 'producao',
    assignee_id: 'agent-1',
    last_message: 'Pode confirmar se o hardware é dourado?',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unread_count: 0,
  },
  {
    id: 'c3',
    customer_id: 'cust-3',
    customer: {
      id: 'cust-3',
      full_name: 'Bia inspirada',
      email: 'bia.pin@gmail.com',
      phone: '5541977776666',
      channel_source: 'pinterest',
      total_orders: 0,
      ltv: 0,
      tags: ['Inspiration', 'Lead Quente']
    },
    status: 'queue',
    sales_stage: 'cobrar',
    assignee_id: null,
    last_message: '🖼️ [Imagem de um Pin do Pinterest]',
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unread_count: 0,
  },
  {
    id: 'c4',
    customer_id: 'cust-4',
    customer: {
      id: 'cust-4',
      full_name: 'Loja Conceito Boutique',
      email: 'contato@boutique.com',
      phone: '5511955554444',
      channel_source: 'facebook',
      total_orders: 1,
      ltv: 2500.00,
      tags: ['Atacado', 'B2B']
    },
    status: 'bot',
    sales_stage: 'cobrar',
    assignee_id: null,
    last_message: 'Gostaria de saber sobre pedido mínimo para revenda.',
    last_message_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    unread_count: 0,
  }
];
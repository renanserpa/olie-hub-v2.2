/**
 * OlieHub V3 - Core Type Definitions
 * Domain: Artisanal Luxury / Make-to-Order Business
 */

export type ChannelSource = 'whatsapp' | 'instagram' | 'pinterest' | 'facebook' | 'email';
export type ConvoStatus = 'bot' | 'queue' | 'assigned' | 'closed';
export type SalesStage = 'cobrar' | 'pago' | 'producao' | 'enviado' | 'entregue';
export type ProductionStage = 'corte' | 'costura' | 'montagem' | 'acabamento' | 'pronto';
export type MessageType = 'text' | 'image' | 'system' | 'audio';
export type MessageDirection = 'inbound' | 'outbound';

export interface UserProfile {
  id: string;
  role: 'dev' | 'admin' | 'agent' | 'viewer';
  full_name?: string;
  avatar_url?: string;
}

export interface IntegrationLog {
  id: string;
  service: 'TINY' | 'VNDA' | 'META' | string;
  method: string;
  endpoint: string;
  status_code: number;
  duration_ms: number;
  timestamp: string;
}

export interface Client {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  source: ChannelSource;
  unreadCount: number;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  channel_source: ChannelSource;
  tiny_contact_id?: string;
  vnda_id?: string;
  total_orders: number;
  ltv: number;
  tags: string[];
}

export interface ProductOptionColor {
  label: string;
  hex: string;
  value: string;
}

export interface Product {
  id: string;
  sku_base: string;
  name: string;
  category_id: 'bolsas' | 'necessaires' | 'viagem' | 'acessorios' | 'petit';
  base_price: number;
  image_url: string;
  options: {
    colors: ProductOptionColor[];
    hardware: string[];
    personalization: {
      allowed: boolean;
      max_chars: number;
      type: 'text' | 'monogram';
    };
  };
}

export interface CartItem {
  product_id: string;
  name?: string;
  quantity: number;
  unit_price: number;
  configuration: {
    color: string;
    hardware: string;
    personalization_text?: string;
  };
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Entregue' | 'Processando' | 'Cancelado' | 'Aguardando Pagamento' | 'Enviado';
}

export interface Conversation {
  id: string;
  customer_id: string;
  customer: Customer;
  status: ConvoStatus;
  sales_stage: SalesStage;
  assignee_id: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  type: MessageType;
  direction: MessageDirection;
  sender_id?: string;
  read: boolean;
  created_at: string;
}
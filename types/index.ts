
/**
 * OlieHub V3 Enterprise - Type Definitions
 * Sincronizado com Supabase Database Schema
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

export interface Customer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  channel_source: ChannelSource;
  ltv: number;
  total_orders: number;
  tags: string[];
  created_at: string;
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

export interface Product {
  id: string;
  sku_base: string;
  name: string;
  // Added category_id to fix "Object literal may only specify known properties" errors in lib/constants.ts
  category_id: string;
  base_price: number;
  image_url: string;
  options: any; // Armazenado como JSONB
}

export interface Order {
  id: string;
  customer_id?: string;
  // Added optional fields to fix errors in app/pedidos/page.tsx and order-detail-drawer.tsx
  name?: string;
  product?: string;
  price?: string;
  date?: string;
  customer_email?: string;
  status: string;
  total?: number;
  items: any[];
  timeline?: any[];
  created_at?: string;
}

/**
 * Added CartItem interface to fix "Module has no exported member 'CartItem'" errors
 */
export interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  configuration: {
    color: string;
    hardware: string;
    personalization_text: string;
  };
}

/**
 * Added Client interface to fix "Module has no exported member 'Client'" error in conversation-list.tsx
 */
export interface Client {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  source: ChannelSource;
  unreadCount: number;
  tags: string[];
  status: ConvoStatus;
}

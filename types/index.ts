
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
  ltv: number; // Lifetime Value
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
    hardware: string[]; // e.g., ['Dourado', 'Prateado', 'Grafite']
    personalization: {
      allowed: boolean;
      max_chars: number;
      type: 'text' | 'monogram';
    };
  };
}

export interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  configuration: {
    color: string;
    hardware: string;
    personalization_text?: string;
  };
}

// Fix: Adding missing Order interface for CRM and Sales history integration
export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Entregue' | 'Processando' | 'Cancelado' | 'Aguardando Pagamento' | 'Enviado';
}

export interface Conversation {
  id: string;
  customer_id: string;
  customer: Customer; // Denormalized for UI performance
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
  sender_id?: string; // Null if inbound (customer)
  read: boolean;
  created_at: string;
}

export interface ProductionOrder {
  id: string;
  order_id: string; // Internal Order ID from Sales
  customer_name: string;
  product_snapshot: CartItem;
  production_stage: ProductionStage;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
  online: boolean;
  avatar_url?: string;
}

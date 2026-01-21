
import { z } from 'zod';

/**
 * Zod Schemas para Validação de Integridade
 */
export const OrderSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().optional().default('Cliente Olie'),
  status: z.string().optional().default('Aberto'),
  price: z.string().optional().default('R$ 0,00'),
  date: z.string().optional(),
  product: z.string().optional().default('Pedido s/ descrição'),
  items: z.array(z.any()).optional().default([]),
});

export const CustomerSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  ltv: z.number().default(0),
  total_orders: z.number().default(0),
  tags: z.array(z.string()).default([]),
  channel_source: z.string().default('whatsapp'),
});

export type Order = z.infer<typeof OrderSchema>;
export type Customer = z.infer<typeof CustomerSchema>;

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
  category_id: string;
  base_price: number;
  image_url: string;
  options: any; 
}

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


export type UserRole = 'user' | 'admin' | 'dev';

// UserProfile interface for managing authenticated user state and role-based access
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Entregue' | 'Processando' | 'Cancelado' | 'Aguardando Pagamento';
}

export interface ClientCRM {
  phone: string;
  email: string;
  cpf: string;
  address: string;
  city: string;
  ltv: number;
  lastOrder: string;
}

export interface Client {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  status: 'online' | 'offline' | 'away';
  source: 'instagram' | 'whatsapp';
  unreadCount: number;
  crm: ClientCRM;
  orders: Order[];
}

// Customer interface used in CRM and ERP integration contexts
export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  tiny_contact_id: string;
  vnda_id: string;
}

// Conversation interface for managing active chat sessions
export interface Conversation {
  id: string;
  customer: Customer;
  source: 'whatsapp' | 'instagram';
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

// IntegrationLog interface for developer diagnostics and monitoring
export interface IntegrationLog {
  id: string;
  service: string;
  endpoint: string;
  method: string;
  status_code: number;
  duration_ms: number;
  timestamp: string;
}

// Unified Message interface that accommodates properties from both index.tsx and App.tsx implementations
export interface Message {
  id: string;
  senderId?: string; // Used in index.tsx
  text?: string;     // Used in index.tsx
  timestamp: string; // Shared property
  isMe?: boolean;    // Used in index.tsx
  direction?: 'inbound' | 'outbound'; // Used in App.tsx and ChatInterface.tsx
  content?: string;                  // Used in App.tsx and ChatInterface.tsx
  status?: string;                   // Used in App.tsx and ChatInterface.tsx
}


-- ############################################################################
-- OLIEHUB V2 - PRODUCTION SCHEMA MIGRATION
-- ############################################################################

-- 1. CLEAN SLATE (DESTRUCTIVE ACTION)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. INFRASTRUCTURE & CRM
-- Tabela de Perfis de Agentes/Artesãos
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('dev', 'admin', 'agent', 'viewer')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Clientes (CRM)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL, -- Identificador único para WhatsApp
  tiny_contact_id TEXT,       -- ID correspondente no Tiny ERP
  tags TEXT[] DEFAULT '{}',
  ltv DECIMAL(12,2) DEFAULT 0.00,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CATALOG & SALES
-- Tabela de Produtos (Sincronizada por SKU)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL, -- SKU é a chave de ligação com ERP
  name TEXT NOT NULL,
  base_price DECIMAL(12,2) NOT NULL,
  image_url TEXT,
  stock_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Pedidos (Vendas e Produção)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  tiny_order_id TEXT UNIQUE, -- Número do pedido gerado pelo Tiny
  status_tiny TEXT DEFAULT 'aberto',
  status_production TEXT DEFAULT 'corte',
  total_value DECIMAL(12,2) NOT NULL,
  items JSONB NOT NULL, -- Snapshot do carrinho
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. OMNICHANNEL INBOX
-- Tabela de Conversas
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queue' CHECK (status IN ('bot', 'queue', 'assigned', 'closed')),
  sales_stage TEXT DEFAULT 'cobrar',
  assignee_id UUID REFERENCES profiles(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Mensagens
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_type TEXT CHECK (sender_type IN ('user', 'client')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')), -- Compatibilidade com hooks existentes
  wa_message_id TEXT UNIQUE, -- ID Único da Meta para evitar duplicidade
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PERFORMANCE INDICES
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_tiny_id ON orders(tiny_order_id);
CREATE INDEX idx_messages_wa_id ON messages(wa_message_id);

-- 6. SECURITY (ROW LEVEL SECURITY)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso: Apenas equipe autenticada
CREATE POLICY "Full access to authenticated users" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated users" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated users" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated users" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated users" ON conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated users" ON messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

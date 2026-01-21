
-- ############################################################################
-- OLIEHUB V3 - ENTERPRISE MIRRORING SCHEMA
-- ############################################################################

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tiny_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  doc_cpf_cnpj TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tiny_id BIGINT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(12,2) DEFAULT 0.00,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tiny_id BIGINT UNIQUE NOT NULL,
  customer_tiny_id BIGINT,
  tiny_number TEXT,
  status_tiny TEXT NOT NULL,
  status_olie TEXT NOT NULL DEFAULT 'corte',
  total_value DECIMAL(12,2) DEFAULT 0.00,
  items_json JSONB DEFAULT '[]',
  order_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Auditoria de Sincronização
CREATE TABLE IF NOT EXISTS sync_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sync_type TEXT NOT NULL, -- Pedidos, Produtos, Clientes
  records_count INTEGER DEFAULT 0,
  status TEXT NOT NULL, -- success, error
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_tiny_id ON customers(tiny_id);
CREATE INDEX IF NOT EXISTS idx_products_tiny_id ON products(tiny_id);
CREATE INDEX IF NOT EXISTS idx_orders_tiny_id ON orders(tiny_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_olie ON orders(status_olie);
CREATE INDEX IF NOT EXISTS idx_sync_history_created ON sync_history(created_at DESC);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write for sync" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for sync" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for sync" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for sync" ON sync_history FOR ALL USING (true) WITH CHECK (true);

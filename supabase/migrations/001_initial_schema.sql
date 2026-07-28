-- Lithos CRM Initial Schema
-- Migration: 001_initial_schema.sql

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

CREATE TYPE order_status AS ENUM (
  'draft',
  'confirmed',
  'delivered',
  'invoiced',
  'paid'
);

CREATE TYPE invoice_status AS ENUM (
  'unpaid',
  'paid',
  'overdue'
);

-- ============================================================================
-- LEADS TABLE
-- ============================================================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_email ON leads (email);

-- ============================================================================
-- INVENTORY TABLE
-- ============================================================================

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  stone_type TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'sqm',
  stock_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  threshold_level NUMERIC(12, 2) NOT NULL DEFAULT 10,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  supplier TEXT,
  r2_image_url TEXT,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_sku ON inventory (sku);
CREATE INDEX idx_inventory_flagged ON inventory (is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX idx_inventory_category ON inventory (category);

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  address TEXT,
  lead_id UUID REFERENCES leads (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_email ON clients (email);
CREATE INDEX idx_clients_lead_id ON clients (lead_id);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_client_id ON orders (client_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_order_number ON orders (order_number);

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory (id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL,
  subtotal NUMERIC(14, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_inventory_id ON order_items (inventory_id);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at TIMESTAMPTZ,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'unpaid'
);

CREATE INDEX idx_invoices_order_id ON invoices (order_id);
CREATE INDEX idx_invoices_status ON invoices (status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Default policies: authenticated users have full access
CREATE POLICY "Authenticated users can view leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update leads" ON leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete leads" ON leads FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view inventory" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inventory" ON inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inventory" ON inventory FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete inventory" ON inventory FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete clients" ON clients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update orders" ON orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete orders" ON orders FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view order_items" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert order_items" ON order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update order_items" ON order_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete order_items" ON order_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view invoices" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update invoices" ON invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete invoices" ON invoices FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- UPDATED_AT TRIGGER (auto-update timestamp on row modification)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

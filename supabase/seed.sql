-- Lithos CRM Seed Data
-- Run after migrations: pnpm supabase db seed

-- Sample Leads
INSERT INTO leads (first_name, last_name, email, phone, company, status, source, notes) VALUES
  ('John', 'Smith', 'john.smith@buildcorp.com', '+1-555-0101', 'BuildCorp Inc.', 'new', 'website', 'Interested in granite countertops for new office building'),
  ('Sarah', 'Johnson', 'sarah.j@luxuryhomes.com', '+1-555-0102', 'Luxury Homes LLC', 'contacted', 'referral', 'High-value residential project - marble flooring'),
  ('Michael', 'Chen', 'mchen@archidesign.co', '+1-555-0103', 'ArchiDesign Co.', 'qualified', 'trade-show', 'Architect looking for bulk slate supply'),
  ('Emma', 'Williams', 'emma@stonecraft.com', '+1-555-0104', 'StoneCraft Studios', 'proposal', 'cold-call', 'Custom quartzite pieces for art installation'),
  ('Robert', 'Davis', 'rdavis@megabuild.com', '+1-555-0105', 'MegaBuild Construction', 'won', 'website', 'Large commercial order - completed successfully');

-- Sample Inventory
INSERT INTO inventory (product_name, sku, category, stone_type, unit, stock_quantity, threshold_level, unit_price, supplier) VALUES
  ('Absolute Black Granite', 'GRN-ABS-001', 'Granite', 'Igneous', 'sqm', 250.00, 50.00, 185.00, 'StoneQuarries India'),
  ('Carrara White Marble', 'MRB-CAR-001', 'Marble', 'Metamorphic', 'sqm', 30.00, 40.00, 320.00, 'Carrara Mills Italy'),
  ('Grey Slate Tiles', 'SLT-GRY-001', 'Slate', 'Metamorphic', 'sqm', 180.00, 60.00, 95.00, 'Welsh Slate Co.'),
  ('Santa Cecilia Granite', 'GRN-SEC-001', 'Granite', 'Igneous', 'sqm', 15.00, 30.00, 145.00, 'Brazilian Stone Export'),
  ('Calacatta Gold Marble', 'MRB-CAL-001', 'Marble', 'Metamorphic', 'sqm', 45.00, 20.00, 580.00, 'Carrara Mills Italy'),
  ('Honed Limestone Beige', 'LMS-BEI-001', 'Limestone', 'Sedimentary', 'sqm', 8.00, 25.00, 120.00, 'French Quarries SAS'),
  ('Blue Quartzite Slabs', 'QTZ-BLU-001', 'Quartzite', 'Metamorphic', 'sqm', 60.00, 15.00, 410.00, 'Azure Stone Brazil'),
  ('Travertine Classic', 'TRV-CLS-001', 'Travertine', 'Sedimentary', 'sqm', 200.00, 50.00, 78.00, 'Turkish Stone Group');

-- Sample Clients (including auto-promoted from won lead)
INSERT INTO clients (first_name, last_name, email, phone, company, address, lead_id) VALUES
  ('Robert', 'Davis', 'rdavis@megabuild.com', '+1-555-0105', 'MegaBuild Construction', '1200 Industrial Blvd, Suite 400, Houston TX 77001', (SELECT id FROM leads WHERE email = 'rdavis@megabuild.com')),
  ('Lisa', 'Park', 'lisa.park@greenarch.com', '+1-555-0201', 'GreenArch Partners', '88 Sustainable Way, Portland OR 97201', NULL);

-- Sample Orders
INSERT INTO orders (client_id, order_number, status, total_amount, notes) VALUES
  ((SELECT id FROM clients WHERE email = 'rdavis@megabuild.com'), 'ORD-2026-001', 'confirmed', 18500.00, 'Delivery to Houston site by June 30'),
  ((SELECT id FROM clients WHERE email = 'lisa.park@greenarch.com'), 'ORD-2026-002', 'draft', 7600.00, 'Pending client approval on limestone selection');

-- Sample Order Items
INSERT INTO order_items (order_id, inventory_id, quantity, unit_price) VALUES
  ((SELECT id FROM orders WHERE order_number = 'ORD-2026-001'), (SELECT id FROM inventory WHERE sku = 'GRN-ABS-001'), 100.00, 185.00),
  ((SELECT id FROM orders WHERE order_number = 'ORD-2026-002'), (SELECT id FROM inventory WHERE sku = 'LMS-BEI-001'), 50.00, 120.00),
  ((SELECT id FROM orders WHERE order_number = 'ORD-2026-002'), (SELECT id FROM inventory WHERE sku = 'TRV-CLS-001'), 20.00, 78.00);

-- Sample Invoices
INSERT INTO invoices (order_id, invoice_number, issued_at, due_at, total_amount, status) VALUES
  ((SELECT id FROM orders WHERE order_number = 'ORD-2026-001'), 'INV-2026-001', now(), now() + interval '30 days', 18500.00, 'unpaid');

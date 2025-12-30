-- ============================================
-- COMPLETE DATABASE SETUP
-- Run this ONCE to set up everything
-- ============================================

-- ============================================
-- STEP 1: Create Tables
-- ============================================

-- Product Types table
CREATE TABLE IF NOT EXISTS product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  form_schema JSONB DEFAULT '{"fields": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (without category, using product_type_id)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  stock INTEGER DEFAULT 0,
  product_type_id UUID REFERENCES product_types(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 2: Enable RLS on all tables
-- ============================================
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Drop ALL existing policies
-- ============================================
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are editable by admins" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

DROP POLICY IF EXISTS "Product types are viewable by everyone" ON product_types;
DROP POLICY IF EXISTS "Product types are editable by admins" ON product_types;
DROP POLICY IF EXISTS "Admin can insert product_types" ON product_types;
DROP POLICY IF EXISTS "Admin can update product_types" ON product_types;
DROP POLICY IF EXISTS "Admin can delete product_types" ON product_types;
DROP POLICY IF EXISTS "Public can view product types" ON product_types;

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can view orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;

DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admin can view order items" ON order_items;

DROP POLICY IF EXISTS "Users can check own admin status" ON admin_users;

-- ============================================
-- PRODUCTS - Public read, Admin full access
-- ============================================
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admin can update products" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admin can delete products" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- PRODUCT TYPES - Public read, Admin full access
-- ============================================
CREATE POLICY "Public can view product types" ON product_types
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert product_types" ON product_types
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admin can update product_types" ON product_types
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admin can delete product_types" ON product_types
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- ORDERS - Public create, Admin read/update
-- ============================================
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- ORDER ITEMS - Public create, Admin read
-- ============================================
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- ADMIN USERS - Users can check their own status
-- ============================================
CREATE POLICY "Users can check own admin status" ON admin_users
  FOR SELECT USING (id = auth.uid());

-- ============================================
-- STEP 4: Seed Product Types
-- ============================================
INSERT INTO product_types (name, slug, form_schema) VALUES
('Electronics', 'electronics', '{"fields": []}'),
('Fashion', 'fashion', '{"fields": [{"id": "size", "label": "Size", "type": "select", "required": true, "options": ["XS", "S", "M", "L", "XL"]}]}'),
('Home', 'home', '{"fields": []}'),
('Sports', 'sports', '{"fields": []}'),
('Food', 'food', '{"fields": []}')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STEP 5: Seed Products (linked to product types)
-- ============================================
INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'Wireless Bluetooth Headphones',
  'wireless-bluetooth-headphones',
  'Premium sound quality with noise cancellation.',
  79.99,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  50,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'electronics'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'Smart Watch Pro',
  'smart-watch-pro',
  'Track your fitness and stay connected.',
  199.99,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
  30,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'electronics'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'Leather Messenger Bag',
  'leather-messenger-bag',
  'Handcrafted genuine leather bag.',
  129.99,
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
  25,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'fashion'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'Minimalist Desk Lamp',
  'minimalist-desk-lamp',
  'Modern LED lamp with adjustable brightness.',
  49.99,
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
  100,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'home'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'Organic Coffee Beans',
  'organic-coffee-beans',
  'Premium arabica beans from Colombia.',
  24.99,
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
  200,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'food'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'Yoga Mat Premium',
  'yoga-mat-premium',
  'Non-slip eco-friendly exercise mat.',
  39.99,
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
  75,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'sports'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'Running Shoes Pro',
  'running-shoes-pro',
  'Lightweight performance running shoes.',
  119.99,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  35,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'sports'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'Ceramic Plant Pot Set',
  'ceramic-plant-pot-set',
  'Set of 3 modern ceramic planters.',
  34.99,
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
  40,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'home'
ON CONFLICT DO NOTHING;

-- ============================================
-- Fix any broken image URLs
-- ============================================
UPDATE products 
SET image = 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500'
WHERE image LIKE '%photo-1602607415263%';

-- ============================================
-- Verify setup completed
-- ============================================
SELECT 'Product Types:' as info, COUNT(*) as count FROM product_types
UNION ALL
SELECT 'Products:', COUNT(*) FROM products
UNION ALL
SELECT 'RLS Policies:', COUNT(*)::bigint FROM pg_policies WHERE schemaname = 'public';

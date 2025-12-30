-- E-Commerce Database Schema for Supabase

-- Product Types table (defines form schema for each product type)
CREATE TABLE IF NOT EXISTS product_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  form_schema JSONB DEFAULT '{"fields": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (with product_type reference)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  category VARCHAR(100),
  stock INTEGER DEFAULT 0,
  product_type_id UUID REFERENCES product_types(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table (snapshot of cart at checkout time with options)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  options JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table (for admin authentication)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HOW TO CREATE AN ADMIN USER:
-- ============================================
-- Step 1: Go to Supabase Dashboard > Authentication > Users
-- Step 2: Click "Add User" and create a user with email/password
-- Step 3: Copy the user's UUID from the users list
-- Step 4: Run this SQL (replace with your values):
--
-- INSERT INTO admin_users (id, email) 
-- VALUES ('paste-user-uuid-here', 'your-email@example.com');
--
-- Example:
-- INSERT INTO admin_users (id, email) 
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin@mystore.com');
-- ============================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_product_type_id ON products(product_type_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_types_slug ON product_types(slug);

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Product Types: Public read, admin write
CREATE POLICY "Product types are viewable by everyone" ON product_types
  FOR SELECT USING (true);

CREATE POLICY "Product types are editable by admins" ON product_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Products: Public read access, admin write
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products are editable by admins" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Orders: Public can create, admins can read/update all
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Order items: Same as orders
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Admin users: Users can check if they are admin (for login verification)
CREATE POLICY "Users can check own admin status" ON admin_users
  FOR SELECT USING (id = auth.uid());

-- Sample product types (uncomment to seed data)
/*
INSERT INTO product_types (name, slug, form_schema) VALUES
  ('Standard', 'standard', '{"fields": []}'),
  ('Clothing', 'clothing', '{"fields": [{"id": "size", "label": "Size", "type": "select", "required": true, "options": ["XS", "S", "M", "L", "XL", "XXL"]}, {"id": "color", "label": "Color", "type": "radio", "required": true, "options": ["Black", "White", "Navy", "Gray", "Red"]}]}'),
  ('Electronics', 'electronics', '{"fields": [{"id": "warranty", "label": "Warranty", "type": "select", "required": false, "options": ["No Warranty", "1 Year", "2 Years", "3 Years"]}, {"id": "voltage", "label": "Voltage", "type": "radio", "required": true, "options": ["110V", "220V", "Universal"]}]}'),
  ('Custom Print', 'custom-print', '{"fields": [{"id": "custom_text", "label": "Custom Text", "type": "text", "required": true, "placeholder": "Enter your custom text"}, {"id": "font_style", "label": "Font Style", "type": "select", "required": false, "options": ["Classic", "Modern", "Handwritten", "Bold"]}]}'),
  ('Digital Service', 'digital-service', '{"fields": [{"id": "phone", "label": "Contact Phone", "type": "text", "required": true, "placeholder": "Your phone number"}, {"id": "whatsapp", "label": "WhatsApp Number", "type": "text", "required": false, "placeholder": "WhatsApp (if different)"}]}');

-- Sample products with product types
INSERT INTO products (name, slug, description, price, image, category, stock, product_type_id, is_active) VALUES
  ('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium sound quality with noise cancellation', 79.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Electronics', 50, (SELECT id FROM product_types WHERE slug = 'electronics'), true),
  ('Smart Watch Pro', 'smart-watch-pro', 'Track your fitness and stay connected', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'Electronics', 30, (SELECT id FROM product_types WHERE slug = 'electronics'), true),
  ('Cotton T-Shirt Premium', 'cotton-tshirt-premium', 'Soft 100% cotton comfortable fit', 29.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'Fashion', 100, (SELECT id FROM product_types WHERE slug = 'clothing'), true),
  ('Denim Jeans Classic', 'denim-jeans-classic', 'Classic fit denim jeans', 59.99, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'Fashion', 75, (SELECT id FROM product_types WHERE slug = 'clothing'), true),
  ('Custom Mug', 'custom-mug', 'Personalized ceramic mug with your text', 14.99, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', 'Gifts', 200, (SELECT id FROM product_types WHERE slug = 'custom-print'), true),
  ('Minimalist Desk Lamp', 'minimalist-desk-lamp', 'Modern LED lamp with adjustable brightness', 49.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', 'Home', 100, (SELECT id FROM product_types WHERE slug = 'standard'), true),
  ('Organic Coffee Beans', 'organic-coffee-beans', 'Premium arabica beans from Colombia', 24.99, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', 'Food', 200, (SELECT id FROM product_types WHERE slug = 'standard'), true),
  ('Yoga Mat Premium', 'yoga-mat-premium', 'Non-slip eco-friendly exercise mat', 39.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 'Sports', 75, (SELECT id FROM product_types WHERE slug = 'standard'), true);
*/

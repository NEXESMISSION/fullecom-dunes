    -- ============================================
-- SEED PRODUCTS - Run this to add sample products
-- ============================================

-- Clear existing products (optional - uncomment if needed)
-- DELETE FROM products;

-- Insert sample products
INSERT INTO products (name, slug, description, price, image, category, stock, is_active) VALUES
(
  'Wireless Bluetooth Headphones',
  'wireless-bluetooth-headphones',
  'Premium sound quality with noise cancellation. Experience crystal-clear audio with deep bass and crisp highs.',
  79.99,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  'Electronics',
  50,
  true
),
(
  'Smart Watch Pro',
  'smart-watch-pro',
  'Track your fitness and stay connected. Features heart rate monitoring, GPS, and 7-day battery life.',
  199.99,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
  'Electronics',
  30,
  true
),
(
  'Leather Messenger Bag',
  'leather-messenger-bag',
  'Handcrafted genuine leather bag. Perfect for work or travel with multiple compartments.',
  129.99,
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
  'Fashion',
  25,
  true
),
(
  'Minimalist Desk Lamp',
  'minimalist-desk-lamp',
  'Modern LED lamp with adjustable brightness. Touch controls and USB charging port included.',
  49.99,
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
  'Home',
  100,
  true
),
(
  'Organic Coffee Beans',
  'organic-coffee-beans',
  'Premium arabica beans from Colombia. Medium roast with notes of chocolate and citrus.',
  24.99,
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
  'Food',
  200,
  true
),
(
  'Yoga Mat Premium',
  'yoga-mat-premium',
  'Non-slip eco-friendly exercise mat. Extra thick for joint protection, includes carrying strap.',
  39.99,
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
  'Sports',
  75,
  true
),
(
  'Ceramic Plant Pot Set',
  'ceramic-plant-pot-set',
  'Set of 3 modern ceramic planters. Drainage holes included, perfect for succulents.',
  34.99,
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
  'Home',
  40,
  true
),
(
  'Stainless Steel Water Bottle',
  'stainless-steel-water-bottle',
  'Insulated bottle keeps drinks cold 24hrs or hot 12hrs. BPA-free, leak-proof design.',
  29.99,
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
  'Sports',
  150,
  true
),
(
  'Wireless Charging Pad',
  'wireless-charging-pad',
  'Fast wireless charging for all Qi-enabled devices. Slim design with LED indicator.',
  34.99,
  'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=500',
  'Electronics',
  80,
  true
),
(
  'Canvas Backpack',
  'canvas-backpack',
  'Durable everyday backpack. Laptop compartment, water-resistant fabric, lifetime warranty.',
  59.99,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
  'Fashion',
  45,
  true
),
(
  'Scented Candle Set',
  'scented-candle-set',
  'Luxury aromatherapy candles. Set of 4 natural soy wax candles with essential oils.',
  28.99,
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500',
  'Home',
  60,
  true
),
(
  'Running Shoes Pro',
  'running-shoes-pro',
  'Lightweight performance running shoes. Breathable mesh, responsive cushioning.',
  119.99,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  'Sports',
  35,
  true
);

-- Verify products were inserted
SELECT COUNT(*) as total_products FROM products;
SELECT name, price, category, stock FROM products ORDER BY created_at;

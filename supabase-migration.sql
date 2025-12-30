-- =============================================
-- SUPABASE MIGRATION - Run this in SQL Editor
-- =============================================

-- 1. Add image column to product_types (for category images)
ALTER TABLE product_types 
ADD COLUMN IF NOT EXISTS image TEXT;

-- 2. Create banners table (for promotional banners)
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  size TEXT DEFAULT 'third', -- 'full', 'half', or 'third'
  height TEXT DEFAULT 'medium', -- 'tall', 'medium', 'short', or 'thin'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create site_settings table (for hero background, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create promo_images table (for promotional image grid linking to categories)
CREATE TABLE IF NOT EXISTS promo_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  size TEXT DEFAULT 'third', -- 'full', 'half', or 'third'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If tables already exist, add size and height columns
ALTER TABLE banners ADD COLUMN IF NOT EXISTS size TEXT DEFAULT 'third';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS height TEXT DEFAULT 'medium';
ALTER TABLE promo_images ADD COLUMN IF NOT EXISTS size TEXT DEFAULT 'third';

-- =============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =============================================

-- Banners: Public read, admin write
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read banners" ON banners;
CREATE POLICY "Allow public read banners" ON banners 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin write banners" ON banners;
CREATE POLICY "Allow admin write banners" ON banners 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Site Settings: Public read, admin write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read settings" ON site_settings;
CREATE POLICY "Allow public read settings" ON site_settings 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin write settings" ON site_settings;
CREATE POLICY "Allow admin write settings" ON site_settings 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Promo Images: Public read, admin write
ALTER TABLE promo_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read promo_images" ON promo_images;
CREATE POLICY "Allow public read promo_images" ON promo_images 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin write promo_images" ON promo_images;
CREATE POLICY "Allow admin write promo_images" ON promo_images 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- DONE! All tables and policies created.
-- =============================================

-- =============================================
-- FULL DATABASE UPDATE - Run in Supabase SQL Editor
-- This fixes all schema issues and adds missing tables
-- =============================================

-- 1. Fix products table - add 'images' column for multiple images
DO $$ 
BEGIN
    -- Add images column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'images'
    ) THEN
        ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added images column to products table';
    END IF;
END $$;

-- 2. Migrate existing image data to images array
UPDATE products 
SET images = ARRAY[image] 
WHERE image IS NOT NULL 
  AND image != '' 
  AND (images IS NULL OR images = '{}');

-- 3. Add parent_id to product_types for subcategories
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_types' AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE product_types ADD COLUMN parent_id UUID REFERENCES product_types(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added parent_id column to product_types table';
    END IF;
END $$;

-- 4. Create landing_sections table if not exists
CREATE TABLE IF NOT EXISTS landing_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  side_image TEXT,
  top_image TEXT,
  background_color TEXT DEFAULT 'bg-white',
  display_order INTEGER DEFAULT 0,
  max_products INTEGER DEFAULT 8,
  is_active BOOLEAN DEFAULT true,
  product_source TEXT DEFAULT 'latest',
  category_id UUID REFERENCES product_types(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create landing_section_products junction table if not exists
CREATE TABLE IF NOT EXISTS landing_section_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES landing_sections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(section_id, product_id)
);

-- 6. Enable RLS for landing_sections
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read landing_sections" ON landing_sections;
CREATE POLICY "Allow public read landing_sections" ON landing_sections 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin write landing_sections" ON landing_sections;
CREATE POLICY "Allow admin write landing_sections" ON landing_sections 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Enable RLS for landing_section_products
ALTER TABLE landing_section_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read landing_section_products" ON landing_section_products;
CREATE POLICY "Allow public read landing_section_products" ON landing_section_products 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin write landing_section_products" ON landing_section_products;
CREATE POLICY "Allow admin write landing_section_products" ON landing_section_products 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Create site_settings table if not exists
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read site_settings" ON site_settings;
CREATE POLICY "Allow public read site_settings" ON site_settings 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin write site_settings" ON site_settings;
CREATE POLICY "Allow admin write site_settings" ON site_settings 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Verify products table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 10. Verify product_types table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_types'
ORDER BY ordinal_position;

-- 11. Verify landing_sections exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'landing_sections'
) AS landing_sections_exists;

-- =============================================
-- DONE! Database schema is now updated.
-- =============================================

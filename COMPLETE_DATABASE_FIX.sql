-- =============================================
-- COMPLETE DATABASE FIX - RUN THIS ENTIRE FILE
-- Copy all content and paste in Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: FIX PRODUCTS TABLE - ADD IMAGES ARRAY
-- =============================================

-- Add images column (array of text) if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Migrate existing single image to images array
UPDATE products 
SET images = ARRAY[image] 
WHERE image IS NOT NULL 
  AND image != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- =============================================
-- STEP 2: FIX PRODUCT_TYPES - ADD PARENT_ID FOR SUBCATEGORIES
-- =============================================

-- Add parent_id column for subcategories
ALTER TABLE product_types ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES product_types(id) ON DELETE SET NULL;

-- =============================================
-- STEP 3: CREATE SITE_SETTINGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated write site_settings" ON site_settings;

-- Create policies
CREATE POLICY "Allow public read site_settings" ON site_settings 
  FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write site_settings" ON site_settings 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STEP 4: CREATE LANDING_SECTIONS TABLE
-- =============================================

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

-- Enable RLS
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read landing_sections" ON landing_sections;
DROP POLICY IF EXISTS "Allow authenticated write landing_sections" ON landing_sections;

-- Create policies - IMPORTANT: Allow public read for landing page to work
CREATE POLICY "Allow public read landing_sections" ON landing_sections 
  FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write landing_sections" ON landing_sections 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STEP 5: CREATE LANDING_SECTION_PRODUCTS (for manual selection)
-- =============================================

CREATE TABLE IF NOT EXISTS landing_section_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES landing_sections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(section_id, product_id)
);

-- Enable RLS
ALTER TABLE landing_section_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read landing_section_products" ON landing_section_products;
DROP POLICY IF EXISTS "Allow authenticated write landing_section_products" ON landing_section_products;

CREATE POLICY "Allow public read landing_section_products" ON landing_section_products 
  FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write landing_section_products" ON landing_section_products 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STEP 6: CREATE BANNERS TABLE (if not exists)
-- =============================================

CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read banners" ON banners;
DROP POLICY IF EXISTS "Allow authenticated write banners" ON banners;

CREATE POLICY "Allow public read banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write banners" ON banners FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STEP 7: CREATE PROMO_IMAGES TABLE (if not exists)
-- =============================================

CREATE TABLE IF NOT EXISTS promo_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE promo_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read promo_images" ON promo_images;
DROP POLICY IF EXISTS "Allow authenticated write promo_images" ON promo_images;

CREATE POLICY "Allow public read promo_images" ON promo_images FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write promo_images" ON promo_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STEP 8: INSERT SAMPLE LANDING SECTIONS (if table is empty)
-- =============================================

INSERT INTO landing_sections (title, subtitle, background_color, display_order, product_source, is_active)
SELECT 'Nouveautés', 'Découvrez nos derniers produits', 'bg-white', 0, 'latest', true
WHERE NOT EXISTS (SELECT 1 FROM landing_sections LIMIT 1);

INSERT INTO landing_sections (title, subtitle, background_color, display_order, product_source, is_active)
SELECT 'Meilleures Ventes', 'Les produits les plus populaires', 'bg-gray-50', 1, 'latest', true
WHERE NOT EXISTS (SELECT 1 FROM landing_sections WHERE title = 'Meilleures Ventes');

-- =============================================
-- STEP 9: VERIFY ALL TABLES EXIST
-- =============================================

SELECT 'products' as table_name, count(*) as row_count FROM products
UNION ALL
SELECT 'product_types', count(*) FROM product_types
UNION ALL
SELECT 'landing_sections', count(*) FROM landing_sections
UNION ALL
SELECT 'site_settings', count(*) FROM site_settings
UNION ALL
SELECT 'banners', count(*) FROM banners
UNION ALL
SELECT 'promo_images', count(*) FROM promo_images;

-- =============================================
-- STEP 10: SHOW PRODUCTS TABLE COLUMNS
-- =============================================

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- =============================================
-- DONE! All tables created and configured.
-- Now go to your admin panel and create sections.
-- =============================================

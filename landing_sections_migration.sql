-- =============================================
-- LANDING SECTIONS MIGRATION
-- Run this in Supabase SQL Editor
-- =============================================

-- Create landing_sections table for admin-controlled product sliders
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
  product_source TEXT DEFAULT 'latest', -- 'latest', 'category', 'manual'
  category_id UUID REFERENCES product_types(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for manually selected products in sections
CREATE TABLE IF NOT EXISTS landing_section_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES landing_sections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(section_id, product_id)
);

-- Enable RLS for landing_sections
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read landing_sections" ON landing_sections;
CREATE POLICY "Allow public read landing_sections" ON landing_sections 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin write landing_sections" ON landing_sections;
CREATE POLICY "Allow admin write landing_sections" ON landing_sections 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS for landing_section_products
ALTER TABLE landing_section_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read landing_section_products" ON landing_section_products;
CREATE POLICY "Allow public read landing_section_products" ON landing_section_products 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin write landing_section_products" ON landing_section_products;
CREATE POLICY "Allow admin write landing_section_products" ON landing_section_products 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default sections (optional - you can add via admin panel instead)
INSERT INTO landing_sections (title, subtitle, background_color, display_order, product_source) VALUES
('À Découvrir', 'Nouveautés et tendances', 'bg-white', 0, 'latest'),
('Offres du Moment', 'À profiter - à ne pas rater', 'bg-gray-50', 1, 'latest'),
('Meilleures Ventes', 'Les plus populaires', 'bg-white', 2, 'latest');

-- =============================================
-- DONE! Tables created and sample data inserted.
-- =============================================

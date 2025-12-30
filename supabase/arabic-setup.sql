-- ============================================
-- تنظيف قاعدة البيانات وإضافة المنتجات بالعربية
-- ============================================

-- حذف جميع عناصر الطلبات
DELETE FROM order_items;

-- حذف جميع الطلبات
DELETE FROM orders;

-- حذف جميع المنتجات
DELETE FROM products;

-- حذف جميع أنواع المنتجات
DELETE FROM product_types;

-- ============================================
-- إضافة أنواع المنتجات بالعربية
-- ============================================
INSERT INTO product_types (name, slug, form_schema) VALUES
('إلكترونيات', 'electronics', '{"fields": []}'),
('أزياء', 'fashion', '{"fields": [{"id": "size", "label": "المقاس", "type": "select", "required": true, "options": ["صغير جداً", "صغير", "متوسط", "كبير", "كبير جداً"]}]}'),
('منزل وديكور', 'home', '{"fields": []}'),
('رياضة', 'sports', '{"fields": []}'),
('طعام ومشروبات', 'food', '{"fields": []}'),
('جمال وعناية', 'beauty', '{"fields": []}')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, form_schema = EXCLUDED.form_schema;

-- ============================================
-- إضافة المنتجات بالعربية
-- ============================================

-- منتجات الإلكترونيات
INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'سماعات لاسلكية برو',
  'wireless-headphones-pro',
  'سماعات بلوتوث عالية الجودة مع خاصية إلغاء الضوضاء. بطارية تدوم 30 ساعة وصوت نقي كريستالي.',
  299.99,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  50,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'electronics';

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'ساعة ذكية متطورة',
  'smart-watch-advanced',
  'ساعة ذكية مع متتبع اللياقة البدنية ومراقب نبضات القلب. مقاومة للماء ومتوافقة مع جميع الهواتف.',
  199.99,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
  35,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'electronics';

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'شاحن محمول سريع',
  'fast-power-bank',
  'شاحن محمول بسعة 20000 مللي أمبير مع شحن سريع. يشحن هاتفك 4 مرات كاملة.',
  79.99,
  'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
  100,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'electronics';

-- منتجات الأزياء
INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'حقيبة جلد فاخرة',
  'luxury-leather-bag',
  'حقيبة يد من الجلد الطبيعي الفاخر. تصميم أنيق يناسب جميع المناسبات.',
  159.99,
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
  25,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'fashion';

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'نظارات شمسية أنيقة',
  'stylish-sunglasses',
  'نظارات شمسية بتصميم عصري وحماية من الأشعة فوق البنفسجية بنسبة 100%.',
  89.99,
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
  60,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'fashion';

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'حذاء رياضي مريح',
  'comfortable-sneakers',
  'حذاء رياضي خفيف الوزن مع نعل مريح. مثالي للمشي والتمارين اليومية.',
  119.99,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  45,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'fashion';

-- منتجات المنزل
INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'مصباح طاولة عصري',
  'modern-table-lamp',
  'مصباح طاولة LED بتصميم أنيق. إضاءة قابلة للتعديل مع 3 درجات سطوع.',
  69.99,
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
  40,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'home';

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'أصيص نباتات سيراميك',
  'ceramic-plant-pot',
  'مجموعة من 3 أصص نباتات سيراميك بتصميم عصري. مثالية للنباتات الداخلية.',
  49.99,
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
  55,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'home';

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'شموع عطرية فاخرة',
  'luxury-scented-candles',
  'مجموعة من 4 شموع عطرية طبيعية من شمع الصويا. روائح مهدئة للاسترخاء.',
  39.99,
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500',
  70,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'home';

-- منتجات الرياضة
INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'سجادة يوغا احترافية',
  'professional-yoga-mat',
  'سجادة يوغا مضادة للانزلاق بسمك 6 ملم. مريحة وسهلة التنظيف.',
  45.99,
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
  80,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'sports';

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'زجاجة مياه رياضية',
  'sports-water-bottle',
  'زجاجة مياه من الستانلس ستيل سعة 750 مل. تحافظ على برودة المشروبات 24 ساعة.',
  29.99,
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
  120,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'sports';

-- منتجات الجمال والعناية
INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'مجموعة العناية بالبشرة',
  'skincare-set',
  'مجموعة كاملة للعناية بالبشرة تشمل غسول ومرطب وسيروم. مكونات طبيعية 100%.',
  89.99,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
  30,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'beauty';

INSERT INTO products (name, slug, description, price, image, stock, product_type_id, is_active)
SELECT 
  'عطر فاخر',
  'luxury-perfume',
  'عطر فاخر برائحة منعشة تدوم طويلاً. مثالي للمناسبات الخاصة.',
  149.99,
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500',
  25,
  pt.id,
  true
FROM product_types pt WHERE pt.slug = 'beauty';

-- ============================================
-- التحقق من الإضافة
-- ============================================
SELECT 'أنواع المنتجات:' as معلومات, COUNT(*) as العدد FROM product_types
UNION ALL
SELECT 'المنتجات:', COUNT(*) FROM products;

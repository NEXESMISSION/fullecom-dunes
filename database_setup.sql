-- =============================================
-- DUNES DOR - DATABASE SETUP SCRIPT
-- Tout en français
-- =============================================

-- Supprimer les données existantes
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM product_types;
DELETE FROM banners;
DELETE FROM promo_images;
DELETE FROM site_settings;

-- =============================================
-- CATÉGORIES (product_types)
-- =============================================

INSERT INTO product_types (name, image) VALUES
('Beauté & Santé', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop'),
('Bébé & Enfants', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop'),
('Électronique', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop'),
('Maison & Jardin', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'),
('Mode & Vêtements', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop'),
('Sport & Loisirs', 'https://images.unsplash.com/photo-1461896836934- voices?w=400&h=400&fit=crop'),
('Cuisine', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'),
('Décoration', 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop');

-- =============================================
-- PRODUITS
-- =============================================

-- Beauté & Santé
INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Crème hydratante visage', 
  'Crème hydratante pour tous types de peau. Formule légère et non grasse.',
  45.00,
  59.00,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop',
  50,
  id
FROM product_types WHERE name = 'Beauté & Santé';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Sérum anti-âge', 
  'Sérum concentré pour réduire les rides et ridules.',
  89.00,
  120.00,
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop',
  30,
  id
FROM product_types WHERE name = 'Beauté & Santé';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Palette maquillage', 
  'Palette de 12 couleurs pour les yeux. Pigments longue tenue.',
  65.00,
  NULL,
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop',
  40,
  id
FROM product_types WHERE name = 'Beauté & Santé';

-- Électronique
INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Écouteurs sans fil', 
  'Écouteurs Bluetooth avec réduction de bruit active. Autonomie 24h.',
  129.00,
  179.00,
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
  25,
  id
FROM product_types WHERE name = 'Électronique';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Chargeur rapide USB-C', 
  'Chargeur 65W compatible avec tous les appareils USB-C.',
  35.00,
  45.00,
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&h=500&fit=crop',
  100,
  id
FROM product_types WHERE name = 'Électronique';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Montre connectée', 
  'Suivi santé, notifications, GPS intégré. Étanche IP68.',
  199.00,
  249.00,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
  15,
  id
FROM product_types WHERE name = 'Électronique';

-- Maison & Jardin
INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Lampe de bureau LED', 
  'Lampe avec variateur de luminosité et température de couleur.',
  55.00,
  75.00,
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
  35,
  id
FROM product_types WHERE name = 'Maison & Jardin';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Coussin décoratif', 
  'Coussin en velours 45x45cm. Plusieurs couleurs disponibles.',
  25.00,
  NULL,
  'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=500&h=500&fit=crop',
  80,
  id
FROM product_types WHERE name = 'Maison & Jardin';

-- Mode & Vêtements
INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Sac à main cuir', 
  'Sac en cuir véritable avec compartiments multiples.',
  150.00,
  199.00,
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop',
  20,
  id
FROM product_types WHERE name = 'Mode & Vêtements';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Écharpe en laine', 
  'Écharpe chaude et douce, 100% laine mérinos.',
  45.00,
  60.00,
  'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500&h=500&fit=crop',
  45,
  id
FROM product_types WHERE name = 'Mode & Vêtements';

-- Bébé & Enfants
INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Peluche ourson', 
  'Peluche douce et lavable. Idéale pour les tout-petits.',
  29.00,
  NULL,
  'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=500&h=500&fit=crop',
  60,
  id
FROM product_types WHERE name = 'Bébé & Enfants';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Set de biberons', 
  'Lot de 3 biberons anti-colique. Sans BPA.',
  35.00,
  45.00,
  'https://images.unsplash.com/photo-1584839404042-8bc22c265c3a?w=500&h=500&fit=crop',
  40,
  id
FROM product_types WHERE name = 'Bébé & Enfants';

-- Sport & Loisirs
INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Tapis de yoga', 
  'Tapis antidérapant 6mm. Avec sangle de transport.',
  39.00,
  55.00,
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop',
  50,
  id
FROM product_types WHERE name = 'Sport & Loisirs';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Bouteille isotherme', 
  'Garde les boissons chaudes 12h ou froides 24h. 750ml.',
  28.00,
  NULL,
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
  70,
  id
FROM product_types WHERE name = 'Sport & Loisirs';

-- Cuisine
INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Set de couteaux', 
  'Ensemble de 5 couteaux professionnels en acier inoxydable.',
  89.00,
  120.00,
  'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500&h=500&fit=crop',
  25,
  id
FROM product_types WHERE name = 'Cuisine';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Poêle antiadhésive', 
  'Poêle 28cm compatible tous feux. Revêtement céramique.',
  45.00,
  59.00,
  'https://images.unsplash.com/photo-1585837146751-a44906a65e3f?w=500&h=500&fit=crop',
  40,
  id
FROM product_types WHERE name = 'Cuisine';

-- Décoration
INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Vase en céramique', 
  'Vase artisanal fait main. Hauteur 25cm.',
  55.00,
  NULL,
  'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500&h=500&fit=crop',
  30,
  id
FROM product_types WHERE name = 'Décoration';

INSERT INTO products (name, description, price, original_price, image, stock, product_type_id) 
SELECT 
  'Cadre photo', 
  'Cadre en bois naturel. Format A4.',
  19.00,
  25.00,
  'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500&h=500&fit=crop',
  100,
  id
FROM product_types WHERE name = 'Décoration';

-- =============================================
-- BANNIÈRES (Slider images)
-- =============================================

INSERT INTO banners (image, title, link, "order") VALUES
('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=500&fit=crop', 'Nouvelle Collection', '/products', 1),
('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=500&fit=crop', 'Offres Spéciales', '/products', 2),
('https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1400&h=500&fit=crop', 'Livraison Gratuite', '/products', 3);

-- =============================================
-- IMAGES PROMOTIONNELLES
-- =============================================

INSERT INTO promo_images (image, title, link, size, "order") VALUES
('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop', 'Beauté', '/products?category=Beauté%20%26%20Santé', 'small', 1),
('https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop', 'Tech', '/products?category=Électronique', 'small', 2),
('https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop', 'Mode', '/products?category=Mode%20%26%20Vêtements', 'small', 3),
('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', 'Maison', '/products?category=Maison%20%26%20Jardin', 'small', 4),
('https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop', 'Enfants', '/products?category=Bébé%20%26%20Enfants', 'small', 5);

-- =============================================
-- FIN DU SCRIPT
-- =============================================

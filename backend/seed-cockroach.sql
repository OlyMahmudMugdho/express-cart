-- Seed script for express-cart database (CockroachDB Compatible)
-- Run with: psql "DATABASE_URL" -f seed-cockroach.sql

-- Users (password is: Admin@123 - hashed with bcrypt)
-- This is a bcrypt hash of 'Admin@123'
INSERT INTO users (id, email, password, role, "isVerified", "firstName", "lastName", "isActive", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'superadmin@example.com', '$2b$10$rKvvXZfzrK7JXvK7JXvK7OujK7JXvK7OujK7JXvK7OujK7JXvK7O', 'superadmin', true, 'Super', 'Admin', true, NOW(), NOW()),
  (gen_random_uuid(), 'admin@example.com', '$2b$10$rKvvXZfzrK7JXvK7JXvK7OujK7JXvK7OujK7JXvK7OujK7JXvK7O', 'admin', true, 'Admin', 'User', true, NOW(), NOW()),
  (gen_random_uuid(), 'customer@example.com', '$2b$10$rKvvXZfzrK7JXvK7JXvK7OujK7JXvK7OujK7JXvK7OujK7JXvK7O', 'customer', true, 'John', 'Doe', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, slug, description, "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Electronics', 'electronics', 'Electronic devices and accessories', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'Clothing', 'clothing', 'Fashion and apparel', true, 2, NOW(), NOW()),
  (gen_random_uuid(), 'Books', 'books', 'Books and literature', true, 3, NOW(), NOW()),
  (gen_random_uuid(), 'Home & Garden', 'home-garden', 'Home improvement and garden supplies', true, 4, NOW(), NOW()),
  (gen_random_uuid(), 'Sports', 'sports', 'Sports and outdoor equipment', true, 5, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs and products
-- Note: CockroachDB handles temp tables and subqueries similarly to Postgres
INSERT INTO products (id, name, slug, description, price, "compareAtPrice", "stockQuantity", "isActive", sku, weight, "weightUnit", "viewCount", "soldCount", "createdAt", "updatedAt", "categoryId")
SELECT 
  gen_random_uuid(),
  v.name,
  v.slug,
  v.description,
  v.price,
  v.compareAtPrice,
  v.stockQuantity,
  true,
  v.sku,
  v.weight,
  v.weightUnit,
  0,
  0,
  NOW(),
  NOW(),
  c.id
FROM (VALUES
  ('Laptop Pro 15', 'laptop-pro-15', 'High-performance laptop with 16GB RAM and 512GB SSD', 1299.99, 1499.99, 50, 'LAP-001', 2.5, 'kg', 'electronics'),
  ('Wireless Mouse', 'wireless-mouse', 'Ergonomic wireless mouse with precision tracking', 29.99, 39.99, 200, 'MOU-001', 0.15, 'kg', 'electronics'),
  ('USB-C Hub', 'usb-c-hub', '7-in-1 USB-C hub with HDMI and card reader', 49.99, 69.99, 150, 'HUB-001', 0.1, 'kg', 'electronics'),
  ('Cotton T-Shirt', 'cotton-t-shirt', 'Premium cotton t-shirt, comfortable fit', 19.99, 29.99, 500, 'TSH-001', 0.2, 'kg', 'clothing'),
  ('Denim Jeans', 'denim-jeans', 'Classic fit denim jeans', 59.99, 79.99, 300, 'JNS-001', 0.5, 'kg', 'clothing'),
  ('Running Shoes', 'running-shoes', 'Lightweight running shoes with cushioning', 89.99, 119.99, 200, 'SHO-001', 0.7, 'kg', 'clothing'),
  ('JavaScript: The Good Parts', 'javascript-the-good-parts', 'Essential JavaScript programming guide', 39.99, 49.99, 100, 'BOK-001', 0.3, 'kg', 'books'),
  ('Clean Code', 'clean-code', 'A Handbook of Agile Software Craftsmanship', 44.99, 54.99, 150, 'BOK-002', 0.4, 'kg', 'books'),
  ('Garden Tools Set', 'garden-tools-set', 'Complete 10-piece garden tool set', 79.99, 99.99, 75, 'GAR-001', 2.0, 'kg', 'home-garden'),
  ('Yoga Mat', 'yoga-mat', 'Non-slip yoga mat with carrying strap', 24.99, 34.99, 250, 'YOG-001', 1.0, 'kg', 'sports')
) AS v(name, slug, description, price, compareAtPrice, stockQuantity, sku, weight, weightUnit, category_slug)
JOIN categories c ON c.slug = v.category_slug
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = v.slug);

-- Product Images
INSERT INTO product_images (id, url, "altText", "isPrimary", "sortOrder", "productId")
SELECT 
  gen_random_uuid(),
  v.url,
  v.altText,
  v.isPrimary,
  v.sortOrder,
  p.id
FROM (VALUES
  ('https://picsum.photos/seed/laptop1/800/600', 'Laptop Pro 15', true, 1, 'laptop-pro-15'),
  ('https://picsum.photos/seed/mouse1/800/600', 'Wireless Mouse', true, 1, 'wireless-mouse'),
  ('https://picsum.photos/seed/hub1/800/600', 'USB-C Hub', true, 1, 'usb-c-hub'),
  ('https://picsum.photos/seed/tshirt1/800/600', 'Cotton T-Shirt', true, 1, 'cotton-t-shirt'),
  ('https://picsum.photos/seed/jeans1/800/600', 'Denim Jeans', true, 1, 'denim-jeans'),
  ('https://picsum.photos/seed/shoes1/800/600', 'Running Shoes', true, 1, 'running-shoes'),
  ('https://picsum.photos/seed/jsbook/800/600', 'JavaScript Book', true, 1, 'javascript-the-good-parts'),
  ('https://picsum.photos/seed/cleancode/800/600', 'Clean Code Book', true, 1, 'clean-code'),
  ('https://picsum.photos/seed/garden1/800/600', 'Garden Tools', true, 1, 'garden-tools-set'),
  ('https://picsum.photos/seed/yoga1/800/600', 'Yoga Mat', true, 1, 'yoga-mat')
) AS v(url, altText, isPrimary, sortOrder, productSlug)
JOIN products p ON p.slug = v.productSlug
WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE url = v.url);

\echo 'CockroachDB seeded successfully!'

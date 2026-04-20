-- Seed script for express-cart database
-- Run with: psql -U expresscart -d expresscart -f seed.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (password is: Admin@123 - hashed with bcrypt)
-- This is a bcrypt hash of 'Admin@123'
INSERT INTO users (id, email, password, role, "isVerified", "firstName", "lastName", "isActive", "createdAt", "updatedAt")
VALUES 
  (uuid_generate_v4(), 'superadmin@example.com', '$2b$10$rKvvXZfzrK7JXvK7JXvK7OujK7JXvK7OujK7JXvK7OujK7JXvK7O', 'superadmin', true, 'Super', 'Admin', true, NOW(), NOW()),
  (uuid_generate_v4(), 'admin@example.com', '$2b$10$rKvvXZfzrK7JXvK7JXvK7OujK7JXvK7OujK7JXvK7OujK7JXvK7O', 'admin', true, 'Admin', 'User', true, NOW(), NOW()),
  (uuid_generate_v4(), 'customer@example.com', '$2b$10$rKvvXZfzrK7JXvK7JXvK7OujK7JXvK7OujK7JXvK7OujK7JXvK7O', 'customer', true, 'John', 'Doe', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, slug, description, "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES 
  (uuid_generate_v4(), 'Electronics', 'electronics', 'Electronic devices and accessories', true, 1, NOW(), NOW()),
  (uuid_generate_v4(), 'Clothing', 'clothing', 'Fashion and apparel', true, 2, NOW(), NOW()),
  (uuid_generate_v4(), 'Books', 'books', 'Books and literature', true, 3, NOW(), NOW()),
  (uuid_generate_v4(), 'Home & Garden', 'home-garden', 'Home improvement and garden supplies', true, 4, NOW(), NOW()),
  (uuid_generate_v4(), 'Sports', 'sports', 'Sports and outdoor equipment', true, 5, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs
SELECT id, slug INTO TEMP TABLE temp_categories FROM categories;

-- Products
INSERT INTO products (id, name, slug, description, price, "compareAtPrice", "stockQuantity", "isActive", sku, weight, "weightUnit", "viewCount", "soldCount", "createdAt", "updatedAt", "categoryId")
SELECT 
  uuid_generate_v4(),
  name,
  slug,
  description,
  price,
  "compareAtPrice",
  "stockQuantity",
  true,
  sku,
  weight,
  "weightUnit",
  0,
  0,
  NOW(),
  NOW(),
  (SELECT id FROM temp_categories WHERE slug = category_slug)
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
) AS v(name, slug, description, price, "compareAtPrice", "stockQuantity", sku, weight, "weightUnit", category_slug)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = v.slug);

-- Product Images
INSERT INTO product_images (id, url, "altText", "isPrimary", "sortOrder", "productId")
SELECT 
  uuid_generate_v4(),
  url,
  "altText",
  "isPrimary",
  "sortOrder",
  (SELECT id FROM products WHERE slug = productSlug LIMIT 1)
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
) AS v(url, "altText", "isPrimary", "sortOrder", productSlug)
WHERE (SELECT id FROM products WHERE slug = productSlug LIMIT 1) IS NOT NULL;

\echo 'Database seeded successfully!'

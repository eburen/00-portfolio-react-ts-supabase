-- Seed data for e-commerce store

-- Clear existing data
TRUNCATE public.product_images, public.product_variations, public.products, public.categories CASCADE;

-- Insert categories
INSERT INTO public.categories (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Electronics', 'Gadgets and electronic devices'),
  ('22222222-2222-2222-2222-222222222222', 'Clothing', 'Apparel and fashion items'),
  ('33333333-3333-3333-3333-333333333333', 'Home & Kitchen', 'Products for your home'),
  ('44444444-4444-4444-4444-444444444444', 'Sports & Outdoors', 'Equipment for sports and outdoor activities'),
  ('55555555-5555-5555-5555-555555555555', 'Beauty & Personal Care', 'Cosmetics and personal care items');

-- Insert products
INSERT INTO public.products (id, name, description, price, stock, category_id, is_featured) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Smartphone X Pro', 'Latest flagship smartphone with advanced camera features and powerful processor.', 899.99, 50, '11111111-1111-1111-1111-111111111111', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Wireless Earbuds', 'Premium wireless earbuds with noise cancellation and 24-hour battery life.', 149.99, 100, '11111111-1111-1111-1111-111111111111', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Slim Fit Jeans', 'Comfortable slim fit jeans made with premium denim material.', 59.99, 200, '22222222-2222-2222-2222-222222222222', false),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Cotton T-Shirt', 'Soft, breathable cotton t-shirt, perfect for everyday wear.', 24.99, 300, '22222222-2222-2222-2222-222222222222', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Smart Blender', 'Programmable blender with multiple settings for smoothies, soups, and more.', 79.99, 75, '33333333-3333-3333-3333-333333333333', false),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Non-Stick Cookware Set', 'Complete 10-piece cookware set with durable non-stick coating.', 129.99, 50, '33333333-3333-3333-3333-333333333333', true),
  ('77777777-7777-7777-7777-777777777777', 'Yoga Mat', 'Extra thick, non-slip yoga mat for comfortable practice.', 29.99, 150, '44444444-4444-4444-4444-444444444444', false),
  ('88888888-8888-8888-8888-888888888888', 'Mountain Bike', 'Durable mountain bike with 21 speeds and front suspension.', 399.99, 25, '44444444-4444-4444-4444-444444444444', true),
  ('99999999-9999-9999-9999-999999999999', 'Face Moisturizer', 'Hydrating face moisturizer suitable for all skin types.', 19.99, 200, '55555555-5555-5555-5555-555555555555', false),
  ('00000000-1111-2222-3333-444444444444', 'Vitamin C Serum', 'Brightening serum with 20% vitamin C and hyaluronic acid.', 34.99, 120, '55555555-5555-5555-5555-555555555555', true);

-- Insert product variations
INSERT INTO public.product_variations (product_id, name, value, price_adjustment, stock) VALUES
  -- Smartphone variations
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Storage', '128GB', 0, 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Storage', '256GB', 100, 15),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Color', 'Black', 0, 20),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Color', 'Silver', 0, 20),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Color', 'Gold', 20, 10),
  
  -- Clothing variations
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Size', 'S', 0, 50),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Size', 'M', 0, 50),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Size', 'L', 0, 50),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Size', 'XL', 0, 50),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Color', 'Blue', 0, 100),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Color', 'Black', 0, 100),
  
  -- T-shirt variations
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Size', 'S', 0, 75),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Size', 'M', 0, 75),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Size', 'L', 0, 75),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Size', 'XL', 0, 75),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Color', 'White', 0, 100),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Color', 'Black', 0, 100),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Color', 'Red', 0, 100);

-- Insert product images
INSERT INTO public.product_images (product_id, url, is_primary) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://placehold.co/600x400?text=Smartphone+X+Pro', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://placehold.co/600x400?text=Smartphone+X+Pro+Back', false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://placehold.co/600x400?text=Wireless+Earbuds', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://placehold.co/600x400?text=Slim+Fit+Jeans', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://placehold.co/600x400?text=Cotton+T-Shirt', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://placehold.co/600x400?text=Smart+Blender', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://placehold.co/600x400?text=Cookware+Set', true),
  ('77777777-7777-7777-7777-777777777777', 'https://placehold.co/600x400?text=Yoga+Mat', true),
  ('88888888-8888-8888-8888-888888888888', 'https://placehold.co/600x400?text=Mountain+Bike', true),
  ('99999999-9999-9999-9999-999999999999', 'https://placehold.co/600x400?text=Face+Moisturizer', true),
  ('00000000-1111-2222-3333-444444444444', 'https://placehold.co/600x400?text=Vitamin+C+Serum', true);

-- Insert admin user if it doesn't exist yet
-- Note: You'd typically do authentication through the API
-- This is just for having a user in the DB

-- Create sample users (you'd normally use Supabase Auth API for this)
DO $$
BEGIN
  -- Only insert if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
    -- Insert admin user into auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      '$2a$10$X4cdVf4IFHoAVgdwkvEgTeMWt9aSqPVXGXAcnN5C4HCFGmWcwOgYK', -- hashed version of 'admin123'
      NOW(),
      'authenticated'
    );
    
    -- Insert admin profile
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'Admin User',
      'admin'
    );
  END IF;
  
  -- Only insert if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'customer@example.com') THEN
    -- Insert customer user into auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
    VALUES (
      '11111111-1111-1111-1111-111111111111',
      'customer@example.com',
      '$2a$10$X4cdVf4IFHoAVgdwkvEgTeMWt9aSqPVXGXAcnN5C4HCFGmWcwOgYK', -- hashed version of 'password123'
      NOW(),
      'authenticated'
    );
    
    -- Insert customer profile
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      '11111111-1111-1111-1111-111111111111',
      'John Customer',
      'customer'
    );
  END IF;
END $$; 
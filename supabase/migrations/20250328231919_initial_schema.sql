
-- Schema definition for e-commerce store portfolio
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up storage for product images
CREATE SCHEMA IF NOT EXISTS storage;

-- TABLES
-- Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  address TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Product Variations Table
CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Size", "Color"
  value TEXT NOT NULL, -- e.g., "Large", "Red"
  price_adjustment NUMERIC(10, 2) DEFAULT 0, -- Additional price for this variation
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  tax NUMERIC(10, 2) DEFAULT 0,
  shipping_fee NUMERIC(10, 2) DEFAULT 0,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  shipping_address TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'paypal', 'cash_on_delivery', 'mock')),
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Store name at time of purchase in case product is deleted later
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL, -- Store price at time of purchase
  variations JSONB, -- Store selected variations like {"size": "Large", "color": "Red"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Carts Table
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  variations JSONB, -- Store selected variations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, product_id, variations) -- Prevent duplicate entries, consolidate quantities instead
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, product_id) -- Prevent duplicate favorites
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, product_id) -- One review per product per user
);

-- Mock Payment Transactions (for portfolio demonstration)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT NOT NULL,
  payment_details JSONB, -- Store mock payment details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- VIEW: Product Summary
CREATE OR REPLACE VIEW product_summary AS
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock,
  p.category_id,
  p.is_featured,
  p.created_at,
  c.name AS category,
  (SELECT COUNT(*) FROM public.reviews r WHERE r.product_id = p.id) AS review_count,
  (SELECT AVG(r.rating) FROM public.reviews r WHERE r.product_id = p.id) AS avg_rating,
  (SELECT url FROM public.product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) AS primary_image
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id;

-- FUNCTIONS

-- Function to update product stock when order is placed
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stock for the product
  UPDATE public.products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id AND stock >= NEW.quantity;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate order totals
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate subtotal
  UPDATE public.orders
  SET subtotal = (
    SELECT SUM(quantity * price) 
    FROM public.order_items 
    WHERE order_id = NEW.order_id
  )
  WHERE id = NEW.order_id;
  
  -- Apply discount if coupon exists
  UPDATE public.orders o
  SET discount = (
    CASE 
      WHEN c.discount_type = 'percentage' THEN o.subtotal * (c.discount_value / 100)
      WHEN c.discount_type = 'fixed_amount' THEN c.discount_value
      ELSE 0
    END
  )
  FROM public.coupons c
  WHERE o.id = NEW.order_id AND o.coupon_id = c.id;
  
  -- Calculate total
  UPDATE public.orders
  SET total_price = subtotal + shipping_fee + tax - discount
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to verify coupon validity
CREATE OR REPLACE FUNCTION is_coupon_valid(coupon_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  valid BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.coupons
    WHERE code = coupon_code
    AND valid_from <= CURRENT_TIMESTAMP
    AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)
  ) INTO valid;
  
  RETURN valid;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS

-- Trigger to decrease product stock when order item is added
CREATE TRIGGER trg_decrease_product_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION decrease_product_stock();

-- Trigger to calculate order total when order item is added/updated/deleted
CREATE TRIGGER trg_calculate_order_total
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION calculate_order_total();

-- POLICIES

-- Profiles Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can create products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Carts Policies
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart"
  ON public.carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own cart"
  ON public.carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
  ON public.carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart"
  ON public.carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Favorites Policies
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reviews Policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Initial seed data (optional, can be removed for production)
INSERT INTO public.categories (name, description)
VALUES 
  ('Electronics', 'Electronic devices and accessories'),
  ('Clothing', 'Apparel and fashion items'),
  ('Home & Kitchen', 'Products for home and kitchen'),
  ('Books', 'Books and publications'),
  ('Beauty', 'Beauty and personal care products'); 
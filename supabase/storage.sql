-- Create buckets for storing product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'Product Images', true);

-- Allow public access to product images
CREATE POLICY "Public Access to Product Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Only authenticated users can upload product images
CREATE POLICY "Authenticated Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Only admins can update or delete product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
); 
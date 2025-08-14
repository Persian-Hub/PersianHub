-- Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-images',
  'business-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload business images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'business-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow public read access to business images
CREATE POLICY "Allow public read access to business images" ON storage.objects
FOR SELECT USING (bucket_id = 'business-images');

-- Create policy to allow users to update their own business images
CREATE POLICY "Allow users to update their business images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'business-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to delete their own business images
CREATE POLICY "Allow users to delete their business images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'business-images' 
  AND auth.role() = 'authenticated'
);

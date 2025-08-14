-- Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload business images" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id = 'business-images'
  AND (storage.foldername(name))[1] = 'business-images'
);

-- Policy: Allow public read access to business images
CREATE POLICY "Allow public read access to business images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'business-images'
);

-- Policy: Allow users to update their own uploaded images
CREATE POLICY "Allow users to update their own business images" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' 
  AND bucket_id = 'business-images'
);

-- Policy: Allow users to delete their own uploaded images
CREATE POLICY "Allow users to delete their own business images" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' 
  AND bucket_id = 'business-images'
);

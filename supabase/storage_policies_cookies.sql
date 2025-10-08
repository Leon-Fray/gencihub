-- Storage Policies for Cookies Bucket
-- Run this in your Supabase SQL Editor

-- Enable RLS on the storage.objects table (if not already enabled)
-- This is usually already enabled by default

-- Policy 1: Allow authenticated users to read all cookie files
-- This allows VAs to download their assigned cookies
CREATE POLICY "Authenticated users can read cookies"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cookies');

-- Policy 2: Allow admins to upload/insert cookie files
CREATE POLICY "Admins can upload cookies"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cookies' 
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Policy 3: Allow admins to update cookie files
CREATE POLICY "Admins can update cookies"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cookies' 
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Policy 4: Allow admins to delete cookie files
CREATE POLICY "Admins can delete cookies"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cookies' 
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Optional: If you want to make the bucket publicly readable (simpler but less secure)
-- Uncomment the following and comment out the "Authenticated users can read cookies" policy above

-- CREATE POLICY "Public can read cookies"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'cookies');


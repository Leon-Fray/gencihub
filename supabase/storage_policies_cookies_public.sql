-- Simple Public Access for Cookies Bucket
-- Run this in your Supabase SQL Editor
-- This is the SIMPLEST approach - anyone with the URL can download

-- Allow anyone (public) to read/download cookie files
CREATE POLICY "Public can read cookies"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cookies');

-- Allow admins to upload cookie files
CREATE POLICY "Admins can upload cookies"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cookies' 
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Allow admins to delete cookie files
CREATE POLICY "Admins can delete cookies"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cookies' 
  AND auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);


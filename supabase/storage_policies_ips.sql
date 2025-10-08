-- Storage Policies for IP Proxies Bucket
-- Run this in Supabase SQL Editor to set up proper access control for the iplist bucket

-- First, ensure the bucket exists
-- (You should create this manually in the Supabase Dashboard → Storage)
-- Bucket name: iplist
-- Public: false

-- Policy: Admins can read from iplist bucket
CREATE POLICY "Admins can read iplist"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'iplist' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can upload to iplist bucket
CREATE POLICY "Admins can upload iplist"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'iplist' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can update files in iplist bucket
CREATE POLICY "Admins can update iplist"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'iplist' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can delete from iplist bucket
CREATE POLICY "Admins can delete iplist"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'iplist' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);


-- Migration: Add Links Table for Redirect Links
-- This table stores redirect links created by VAs for their models
-- Note: The 'oflink' column should already exist in the models table

-- Create links table for girly.bio redirect links
CREATE TABLE IF NOT EXISTS public.links (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL DEFAULT 'girly.bio',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  clicks INTEGER DEFAULT 0 NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for links
-- VAs can view their own links
CREATE POLICY "VAs can view their own links" ON public.links
  FOR SELECT USING (user_id = auth.uid());

-- VAs can create their own links
CREATE POLICY "VAs can create links" ON public.links
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- VAs can update their own links
CREATE POLICY "VAs can update their own links" ON public.links
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all links
CREATE POLICY "Admins can view all links" ON public.links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all links
CREATE POLICY "Admins can manage all links" ON public.links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_slug ON public.links(slug);
CREATE INDEX IF NOT EXISTS idx_links_domain ON public.links(domain);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON public.links(is_active);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links(created_at DESC);


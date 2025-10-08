-- Migration: Add IP Proxies System
-- This migration adds support for IP proxies from storage file (proxyList300.txt)
-- Similar to the cookies system

-- Table for storing IP proxy information from file
CREATE TABLE IF NOT EXISTS public.ip_proxies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ip_proxy TEXT NOT NULL UNIQUE, -- The actual IP proxy string
  line_number INT NOT NULL, -- Track which line in the file this IP came from
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_used_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.ip_proxies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ip_proxies
-- VAs can view all active IP proxies
CREATE POLICY "VAs can view active IP proxies" ON public.ip_proxies
  FOR SELECT USING (is_active = true);

-- Admins can manage all IP proxies
CREATE POLICY "Admins can manage IP proxies" ON public.ip_proxies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ip_proxies_unassigned ON public.ip_proxies(id) 
  WHERE last_used_by_id IS NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_ip_proxies_line_number ON public.ip_proxies(line_number);

-- Add ip_proxy_id column to resource_assignments table
ALTER TABLE public.resource_assignments 
ADD COLUMN IF NOT EXISTS ip_proxy_id BIGINT REFERENCES public.ip_proxies(id) ON DELETE SET NULL;


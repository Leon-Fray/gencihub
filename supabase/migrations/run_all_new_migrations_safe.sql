-- Combined Migration Script (Safe Version)
-- This version handles already-existing policies gracefully
-- Run this in your Supabase SQL Editor

-- ===================================================================
-- PART 1: Create Account Requests Table
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.account_requests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  va_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  model_id BIGINT NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  CONSTRAINT account_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable Row Level Security
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "VAs can view their own account requests" ON public.account_requests;
CREATE POLICY "VAs can view their own account requests" ON public.account_requests
  FOR SELECT USING (va_id = auth.uid());

DROP POLICY IF EXISTS "VAs can create account requests" ON public.account_requests;
CREATE POLICY "VAs can create account requests" ON public.account_requests
  FOR INSERT WITH CHECK (va_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all account requests" ON public.account_requests;
CREATE POLICY "Admins can view all account requests" ON public.account_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage account requests" ON public.account_requests;
CREATE POLICY "Admins can manage account requests" ON public.account_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for account_requests
CREATE INDEX IF NOT EXISTS idx_account_requests_va_id ON public.account_requests(va_id);
CREATE INDEX IF NOT EXISTS idx_account_requests_model_id ON public.account_requests(model_id);
CREATE INDEX IF NOT EXISTS idx_account_requests_status ON public.account_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_requests_created_at ON public.account_requests(created_at DESC);

-- ===================================================================
-- PART 2: Create Links Table for girly.bio Redirect Links
-- ===================================================================

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

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "VAs can view their own links" ON public.links;
CREATE POLICY "VAs can view their own links" ON public.links
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "VAs can create links" ON public.links;
CREATE POLICY "VAs can create links" ON public.links
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "VAs can update their own links" ON public.links;
CREATE POLICY "VAs can update their own links" ON public.links
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all links" ON public.links;
CREATE POLICY "Admins can view all links" ON public.links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all links" ON public.links;
CREATE POLICY "Admins can manage all links" ON public.links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for links
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_slug ON public.links(slug);
CREATE INDEX IF NOT EXISTS idx_links_domain ON public.links(domain);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON public.links(is_active);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links(created_at DESC);

-- ===================================================================
-- Verification - Check what was created
-- ===================================================================

SELECT 'Migration completed successfully!' AS status;

-- Show created tables
SELECT 'Tables:' AS info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('account_requests', 'links');

-- Show policies
SELECT 'Policies:' AS info, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('account_requests', 'links')
ORDER BY tablename, policyname;


-- Migration: Add Account Requests Table
-- This table stores new account requests from VAs

CREATE TABLE IF NOT EXISTS public.account_requests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  va_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  model_id BIGINT NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'First Account', 'Additional posts', 'Account banned', or custom text for 'Other'
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  CONSTRAINT account_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable Row Level Security
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for account_requests
-- VAs can view their own account requests
CREATE POLICY "VAs can view their own account requests" ON public.account_requests
  FOR SELECT USING (va_id = auth.uid());

-- VAs can create their own account requests
CREATE POLICY "VAs can create account requests" ON public.account_requests
  FOR INSERT WITH CHECK (va_id = auth.uid());

-- Admins can view all account requests
CREATE POLICY "Admins can view all account requests" ON public.account_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all account requests
CREATE POLICY "Admins can manage account requests" ON public.account_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_account_requests_va_id ON public.account_requests(va_id);
CREATE INDEX IF NOT EXISTS idx_account_requests_model_id ON public.account_requests(model_id);
CREATE INDEX IF NOT EXISTS idx_account_requests_status ON public.account_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_requests_created_at ON public.account_requests(created_at DESC);


-- Migration: Add Models System
-- This migration adds support for celebrity models that VAs will post about

-- Table for storing model (celebrity) information
CREATE TABLE IF NOT EXISTS public.models (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  google_drive_link TEXT NOT NULL,
  bio TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Table for assigning models to VAs (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.model_assignments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  va_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  model_id BIGINT NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(va_id, model_id) -- Prevent duplicate assignments
);

-- Insert the initial 4 models
INSERT INTO public.models (name, google_drive_link, bio) VALUES
  ('Annie', 'https://drive.google.com/drive/folders/annie', 'Annie is a talented model known for her stunning photoshoots and vibrant personality.'),
  ('Hailey', 'https://drive.google.com/drive/folders/hailey', 'Hailey brings elegance and grace to every project she works on.'),
  ('Camila', 'https://drive.google.com/drive/folders/camila', 'Camila is known for her versatile looks and professional approach to modeling.'),
  ('Talina', 'https://drive.google.com/drive/folders/talina', 'Talina combines natural beauty with a strong social media presence.')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for models
-- VAs can view all active models
CREATE POLICY "VAs can view active models" ON public.models
  FOR SELECT USING (is_active = true);

-- Admins can manage all models
CREATE POLICY "Admins can manage models" ON public.models
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for model_assignments
-- VAs can view their own model assignments
CREATE POLICY "VAs can view their assigned models" ON public.model_assignments
  FOR SELECT USING (
    va_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all model assignments
CREATE POLICY "Admins can manage model assignments" ON public.model_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_model_assignments_va_id ON public.model_assignments(va_id);
CREATE INDEX IF NOT EXISTS idx_model_assignments_model_id ON public.model_assignments(model_id);
CREATE INDEX IF NOT EXISTS idx_models_active ON public.models(is_active);


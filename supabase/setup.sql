-- Complete VA Hub Database Setup
-- Run this after cleanup.sql to set up the entire database

-- Table for user profiles, extending the auth.users table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'va' -- Can be 'va' or 'admin'
);

-- Table for tasks assigned to VAs
CREATE TABLE public.tasks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'To Do' NOT NULL, -- 'To Do', 'In Progress', 'Completed'
  assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  task_type TEXT DEFAULT 'general' NOT NULL, -- 'subreddit_upvote' or 'general'
  target_subreddits JSONB, -- e.g., ["subreddit1", "subreddit2"] - used when task_type is 'subreddit_upvote'
  CONSTRAINT tasks_task_type_check CHECK (task_type IN ('subreddit_upvote', 'general'))
);

-- Table for VA work schedules
CREATE TABLE public.schedules (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  va_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  notes TEXT
);

-- Table for storing sensitive account credentials securely
CREATE TABLE public.account_credentials (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  platform_name TEXT NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL -- IMPORTANT: Password must be encrypted on the server before storing
);

-- Table for logging completed work against a task
CREATE TABLE public.work_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  va_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id BIGINT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  notes TEXT,
  ip_used TEXT,
  redirect_link_created TEXT
);

-- Table for managing a pool of IP addresses
CREATE TABLE public.ip_addresses (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ip_address TEXT UNIQUE NOT NULL,
  last_used_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ
);

-- Table for time tracking (clock in/out)
CREATE TABLE public.time_tracking (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  va_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ DEFAULT now() NOT NULL,
  clock_out TIMESTAMPTZ
);

-- Table for managing cookies
CREATE TABLE public.cookies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cookie_name TEXT NOT NULL,
  cookie_file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_used_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Table for managing redirect links
CREATE TABLE public.redirect_links (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  link_url TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_used_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Table for tracking resource assignments to users
CREATE TABLE public.resource_assignments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  va_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address_id BIGINT REFERENCES public.ip_addresses(id) ON DELETE SET NULL,
  cookie_id BIGINT REFERENCES public.cookies(id) ON DELETE SET NULL,
  redirect_link_id BIGINT REFERENCES public.redirect_links(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  returned_at TIMESTAMPTZ,
  notes TEXT,
  assignment_type TEXT NOT NULL -- 'new_account', 'task', 'other'
);

-- Table for storing model (celebrity) information
CREATE TABLE public.models (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  google_drive_link TEXT NOT NULL,
  bio TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Table for assigning models to VAs (many-to-many relationship)
CREATE TABLE public.model_assignments (
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirect_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for tasks
CREATE POLICY "VAs can view assigned tasks" ON public.tasks
  FOR SELECT USING (
    assigned_to_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage tasks" ON public.tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for schedules
CREATE POLICY "VAs can view their own schedules" ON public.schedules
  FOR SELECT USING (va_id = auth.uid());

CREATE POLICY "Admins can manage all schedules" ON public.schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for account_credentials (admin only)
CREATE POLICY "Admins can manage credentials" ON public.account_credentials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for work_logs
CREATE POLICY "VAs can view their own work logs" ON public.work_logs
  FOR SELECT USING (va_id = auth.uid());

CREATE POLICY "VAs can create work logs" ON public.work_logs
  FOR INSERT WITH CHECK (va_id = auth.uid());

CREATE POLICY "Admins can view all work logs" ON public.work_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for ip_addresses
CREATE POLICY "VAs can view IP addresses" ON public.ip_addresses
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage IP addresses" ON public.ip_addresses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for time_tracking
CREATE POLICY "VAs can manage their own time tracking" ON public.time_tracking
  FOR ALL USING (va_id = auth.uid());

CREATE POLICY "Admins can view all time tracking" ON public.time_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for cookies
CREATE POLICY "VAs can view available cookies" ON public.cookies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage cookies" ON public.cookies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for redirect_links
CREATE POLICY "VAs can view available redirect links" ON public.redirect_links
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage redirect links" ON public.redirect_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for resource_assignments
CREATE POLICY "VAs can view their own resource assignments" ON public.resource_assignments
  FOR SELECT USING (va_id = auth.uid());

CREATE POLICY "VAs can create resource assignments" ON public.resource_assignments
  FOR INSERT WITH CHECK (va_id = auth.uid());

CREATE POLICY "Admins can view all resource assignments" ON public.resource_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage resource assignments" ON public.resource_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for models
CREATE POLICY "VAs can view active models" ON public.models
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage models" ON public.models
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for model_assignments
CREATE POLICY "VAs can view their assigned models" ON public.model_assignments
  FOR SELECT USING (
    va_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

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

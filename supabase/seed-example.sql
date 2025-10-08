-- Example Seed Data for VA Hub
-- This file contains sample data for development/testing purposes
-- DO NOT use this in production with real data

-- Note: Before running this, create your admin user in Supabase Auth UI
-- Then replace 'YOUR_ADMIN_USER_ID' below with the actual UUID

-- ============================================
-- Create Admin Profile
-- ============================================
-- First, create a user in Supabase Dashboard:
-- 1. Go to Authentication -> Users
-- 2. Click "Add User"
-- 3. Enter email and password
-- 4. Enable "Auto Confirm User"
-- 5. Copy the User ID (UUID)
-- 6. Replace YOUR_ADMIN_USER_ID below with that UUID

INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES (
  'YOUR_ADMIN_USER_ID', -- Replace with actual UUID from Supabase Auth
  'admin@example.com',   -- Replace with your admin email
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Sample VA Users (Optional - for testing)
-- ============================================
-- Create these users in Supabase Auth first, then uncomment and update UUIDs

-- INSERT INTO public.profiles (id, email, role, created_at, updated_at)
-- VALUES 
--   ('VA_USER_ID_1', 'va1@example.com', 'va', NOW(), NOW()),
--   ('VA_USER_ID_2', 'va2@example.com', 'va', NOW(), NOW())
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Sample Tasks (Optional - for testing)
-- ============================================
-- Uncomment to create sample tasks

-- INSERT INTO public.tasks (title, description, task_type, status, priority, assigned_to, created_at, updated_at)
-- VALUES 
--   (
--     'Sample Task 1',
--     'This is a sample task for testing purposes',
--     'general',
--     'todo',
--     'medium',
--     'VA_USER_ID_1', -- Replace with actual VA user ID
--     NOW(),
--     NOW()
--   ),
--   (
--     'Sample Task 2',
--     'Another sample task',
--     'research',
--     'in_progress',
--     'high',
--     'VA_USER_ID_1', -- Replace with actual VA user ID
--     NOW(),
--     NOW()
--   );

-- ============================================
-- Sample IP Addresses (Optional - for testing)
-- ============================================
-- Uncomment to add sample IPs

-- INSERT INTO public.ip_addresses (ip_address, port, protocol, status, last_used, created_at)
-- VALUES 
--   ('192.0.2.1', 8080, 'http', 'available', NULL, NOW()),
--   ('192.0.2.2', 8080, 'http', 'available', NULL, NOW()),
--   ('192.0.2.3', 8080, 'http', 'available', NULL, NOW())
-- ON CONFLICT (ip_address, port) DO NOTHING;

-- ============================================
-- Sample Schedule (Optional - for testing)
-- ============================================
-- Uncomment to create a sample schedule

-- INSERT INTO public.schedules (user_id, day_of_week, start_time, end_time, created_at, updated_at)
-- VALUES 
--   ('VA_USER_ID_1', 'monday', '09:00', '17:00', NOW(), NOW()),
--   ('VA_USER_ID_1', 'tuesday', '09:00', '17:00', NOW(), NOW()),
--   ('VA_USER_ID_1', 'wednesday', '09:00', '17:00', NOW(), NOW())
-- ON CONFLICT DO NOTHING;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. Always create users in Supabase Auth UI first
-- 2. Never commit real user data, passwords, or credentials
-- 3. Replace all placeholder UUIDs with actual values
-- 4. For production, create users manually through the admin interface
-- 5. Keep sensitive seed data in local files (not in git)

-- ============================================
-- Verify Setup
-- ============================================
-- Run these queries to verify your setup:

-- Check admin user exists:
-- SELECT * FROM public.profiles WHERE role = 'admin';

-- Check all users:
-- SELECT id, email, role, created_at FROM public.profiles;

-- Check tasks:
-- SELECT id, title, status, assigned_to FROM public.tasks;


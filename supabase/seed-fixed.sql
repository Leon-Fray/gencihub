-- VA Hub Seed Data (Fixed for Supabase)
-- This script only seeds the public tables, not auth.users
-- Users should be created through the Supabase Auth API or the app's sign-up form

-- Create sample cookies
INSERT INTO public.cookies (cookie_name, cookie_file_path) VALUES
('chrome_cookie_001.json', '/cookies/chrome_cookie_001.json'),
('firefox_cookie_002.json', '/cookies/firefox_cookie_002.json'),
('safari_cookie_003.json', '/cookies/safari_cookie_003.json'),
('edge_cookie_004.json', '/cookies/edge_cookie_004.json'),
('chrome_cookie_005.json', '/cookies/chrome_cookie_005.json');

-- Create sample redirect links
INSERT INTO public.redirect_links (link_url, slug) VALUES
('https://redirect.vahub.com/r/001', '001'),
('https://redirect.vahub.com/r/002', '002'),
('https://redirect.vahub.com/r/003', '003'),
('https://redirect.vahub.com/r/004', '004'),
('https://redirect.vahub.com/r/005', '005');

-- Create sample IP addresses
INSERT INTO public.ip_addresses (ip_address) VALUES
('192.168.1.100'),
('192.168.1.101'),
('192.168.1.102'),
('192.168.1.103'),
('192.168.1.104');

-- Create sample account credentials (encrypted passwords)
INSERT INTO public.account_credentials (platform_name, username, encrypted_password) VALUES
('Reddit', 'user001', 'encrypted_password_here'),
('Twitter', 'user002', 'encrypted_password_here'),
('Instagram', 'user003', 'encrypted_password_here'),
('Facebook', 'user004', 'encrypted_password_here'),
('LinkedIn', 'user005', 'encrypted_password_here');

-- Note: User profiles will be created automatically when users sign up through the app
-- The profiles table has a foreign key reference to auth.users(id)
-- You cannot manually insert into auth.users - use Supabase Auth API instead

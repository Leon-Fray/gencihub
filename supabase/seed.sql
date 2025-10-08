-- Create a default admin user in Supabase Auth
-- Password: admin123 (bcrypt hash)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token_encrypted)
VALUES
(
  '00000000-0000-0000-0000-000000000000',
  '8a555a3a-9b42-45f8-a89c-091642236a28', -- A fixed UUID for the admin user
  'authenticated',
  'authenticated',
  'admin@vahub.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'admin123'
  NOW(),
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Link the auth user to a profile with an 'admin' role
INSERT INTO public.profiles (id, full_name, role)
VALUES
(
  '8a555a3a-9b42-45f8-a89c-091642236a28', -- The same fixed UUID
  'VA Hub Admin',
  'admin'
);

-- Create some sample VA profiles for testing
INSERT INTO public.profiles (id, full_name, role)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'John Doe',
  'va'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Jane Smith',
  'va'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Mike Johnson',
  'va'
);

-- Create sample cookies
INSERT INTO public.cookies (cookie_name, cookie_file_path)
VALUES
('chrome_cookie_001.json', '/cookies/chrome_cookie_001.json'),
('firefox_cookie_002.json', '/cookies/firefox_cookie_002.json'),
('safari_cookie_003.json', '/cookies/safari_cookie_003.json'),
('edge_cookie_004.json', '/cookies/edge_cookie_004.json'),
('chrome_cookie_005.json', '/cookies/chrome_cookie_005.json');

-- Create sample redirect links
INSERT INTO public.redirect_links (link_url, slug)
VALUES
('https://redirect.vahub.com/r/001', '001'),
('https://redirect.vahub.com/r/002', '002'),
('https://redirect.vahub.com/r/003', '003'),
('https://redirect.vahub.com/r/004', '004'),
('https://redirect.vahub.com/r/005', '005');

-- Create sample IP addresses
INSERT INTO public.ip_addresses (ip_address)
VALUES
('192.168.1.100'),
('192.168.1.101'),
('192.168.1.102'),
('192.168.1.103'),
('192.168.1.104');

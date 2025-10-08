# Admin Login Setup Guide

## 🔐 Default Admin Credentials

After running the database schema and seed script, you can login with:

**Email:** `admin@vahub.com`  
**Password:** `admin123`

## 📋 Setup Steps

### 1. Set up Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project credentials (URL, anon key, service role key)

### 2. Configure Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ENCRYPTION_SECRET_KEY=your_long_random_encryption_key
```

### 3. Run Database Schema
Execute the SQL from `supabase/schema.sql` in your Supabase SQL editor

### 4. Run Seed Script (Fixed)
Execute the SQL from `supabase/seed-fixed.sql` in your Supabase SQL editor

### 5. Create Admin User
Run the admin user creation script:
```bash
node create-admin-user.js
```

### 6. Enable Authentication
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Email" provider
3. Set Site URL: `http://localhost:3000`
4. Add redirect URL: `http://localhost:3000/auth/callback`

### 7. Login
1. Start the app: `npm run dev`
2. Visit: http://localhost:3000
3. Login with admin credentials above

## 👥 Admin Features

Once logged in as admin, you can:

### ✅ User Management
- **View all users** in the Users page
- **Create new users** with the "Create User" button
- **Assign roles** (VA or Admin)
- **Set passwords** for new users

### ✅ Task Management
- Create and assign tasks to VAs
- View all tasks and their status
- Manage task priorities and due dates

### ✅ System Management
- Manage IP addresses
- Store encrypted credentials
- Create work schedules
- View system analytics

## 🔧 Creating New Users

As an admin, you can create new users:

1. **Go to Users page** in admin dashboard
2. **Click "Create User"** button
3. **Fill in details:**
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Role (VA or Admin)
4. **Click "Create User"**

The system will:
- Create the authentication account
- Create the user profile
- Send confirmation email (if enabled)
- Allow immediate login

## 🚨 Security Notes

- **Change the default admin password** after first login
- **Use strong passwords** for all accounts
- **Enable 2FA** in Supabase for additional security
- **Regularly review user access** and remove inactive accounts

## 🎯 Next Steps

1. **Login as admin** with the default credentials
2. **Create your first VA user** using the Create User dialog
3. **Assign tasks** to the VA user
4. **Test the complete workflow** from admin to VA perspective

The admin system is now ready for full user management! 🎉

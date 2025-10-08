# Authentication Setup Guide

## 🔐 Quick Authentication Setup

You have two options for authentication:

### **Option 1: Email/Password Authentication (Ready to Use)**

The app now supports email/password authentication out of the box! You can:

1. **Sign up** with any email and password (minimum 6 characters)
2. **Sign in** with your credentials
3. **No additional setup required**

### **Option 2: Google OAuth (Optional)**

To enable Google OAuth:

1. **Go to Supabase Dashboard** → Authentication → Providers
2. **Enable Google provider**
3. **Get Google OAuth credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/auth/callback`
4. **Add credentials to Supabase:**
   - Client ID
   - Client Secret
5. **Save and test**

## 🚀 Testing the App

1. **Visit** http://localhost:3000
2. **Sign up** with email/password
3. **Check your email** for confirmation (if email confirmation is enabled)
4. **Sign in** and explore the app!

## 🔧 Supabase Auth Settings

In your Supabase project:

1. **Authentication → Settings**
2. **Site URL:** `http://localhost:3000`
3. **Redirect URLs:** `http://localhost:3000/auth/callback`
4. **Email confirmation:** Optional (can be disabled for testing)

## 📝 User Roles

After signing up, you'll need to:

1. **Go to Supabase Dashboard** → Table Editor → `profiles`
2. **Add a record** for your user:
   - `id`: Your user ID (from auth.users)
   - `full_name`: Your name
   - `role`: `'admin'` or `'va'`

Or use the seed script to create a default admin user.

## 🎯 Next Steps

1. **Test email/password authentication**
2. **Create your user profile** in the database
3. **Explore the admin dashboard** at `/admin`
4. **Explore the VA dashboard** at `/dashboard`

The app is now ready to use with email/password authentication!

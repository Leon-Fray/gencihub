# Deployment Guide - VA Hub

This guide will help you deploy VA Hub to production using Vercel and Supabase.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Supabase account (sign up at https://supabase.com)
- Node.js 18+ installed locally

## Step 1: Prepare Your Supabase Database

### 1.1 Create a New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: VA Hub (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the closest region to your users
4. Wait for the project to be created (takes 1-2 minutes)

### 1.2 Set Up the Database Schema

1. In your Supabase project, go to the **SQL Editor**
2. Run the following files in order:
   - First: `supabase/schema.sql` (creates all tables and RLS policies)
   - Second: `supabase/setup.sql` (additional setup if needed)
   - Third: Create your admin user (see below)

### 1.3 Create Your Admin User

1. Go to **Authentication** → **Users** in Supabase
2. Click "Add User" → "Create new user"
3. Enter:
   - **Email**: Your admin email
   - **Password**: Your admin password
   - **Auto Confirm User**: Enable this
4. Click "Create User"
5. Copy the User ID (UUID)
6. Go to **SQL Editor** and run:

```sql
-- Replace 'YOUR_USER_ID' with the UUID from step 5
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES (
  'YOUR_USER_ID',
  'your-admin@email.com',
  'admin',
  NOW(),
  NOW()
);
```

### 1.4 Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Save these values (you'll need them for Vercel):
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Go to **Project Settings** → **API** → **Service Role** section
4. Reveal and save:
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Step 2: Prepare Your GitHub Repository

### 2.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - VA Hub application"
```

### 2.2 Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Name**: `va-hub` (or your preferred name)
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README (you already have one)
3. Click "Create repository"

### 2.3 Push Your Code

```bash
git remote add origin https://github.com/YOUR_USERNAME/va-hub.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub account and find your `va-hub` repository
4. Click "Import"

### 3.2 Configure Your Project

1. **Framework Preset**: Next.js (should auto-detect)
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run build` (should be auto-filled)
4. **Output Directory**: `.next` (should be auto-filled)

### 3.3 Add Environment Variables

Click "Environment Variables" and add the following:

| Name | Value | Where to Get It |
|------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Supabase → Settings → API (Reveal) |
| `ENCRYPTION_SECRET_KEY` | Generate a random 32+ character string | See below for generation |
| `PYTHON_REDIRECT_API_URL` | Your redirect API URL (optional) | If you have external API |
| `PYTHON_SPOOFER_API_URL` | Your spoofer API URL (optional) | If you have external API |

#### Generate Encryption Key

Run this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `ENCRYPTION_SECRET_KEY`.

### 3.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-3 minutes)
3. Once deployed, you'll get a URL like: `https://va-hub-xxx.vercel.app`

## Step 4: Configure Supabase for Production

### 4.1 Add Your Production URL to Supabase

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://va-hub-xxx.vercel.app`
3. Add to **Redirect URLs**:
   - `https://va-hub-xxx.vercel.app/auth/callback`
   - `https://va-hub-xxx.vercel.app`

### 4.2 Enable Email Confirmations (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize your email templates as needed
3. Go to **Authentication** → **Providers** → **Email**
4. Configure:
   - **Enable Email Confirmations**: Your choice
   - **Secure Email Change**: Recommended to enable

## Step 5: Set Up Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Enter your domain (e.g., `vahub.yourdomain.com`)
4. Follow the DNS configuration instructions

### 5.2 Update Supabase URLs

Once your domain is configured:
1. Update Supabase **Site URL** and **Redirect URLs** with your custom domain
2. Update environment variables in Vercel if needed

## Step 6: Test Your Deployment

### 6.1 Basic Tests

1. Visit your production URL
2. Try logging in with your admin credentials
3. Test creating a new task
4. Test user management
5. Verify VA dashboard functionality

### 6.2 Security Checklist

- [ ] Environment variables are set in Vercel (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] Service credentials (JSON files) are in `.gitignore`
- [ ] RLS policies are enabled on all Supabase tables
- [ ] Admin user is created and can log in
- [ ] Regular users cannot access admin routes

## Step 7: Continuous Deployment

Your app is now set up for continuous deployment:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```
3. Vercel automatically deploys your changes
4. Check deployment status at https://vercel.com/dashboard

## Troubleshooting

### Build Fails on Vercel

- Check the build logs in Vercel dashboard
- Ensure all environment variables are set
- Try building locally: `npm run build`
- Check for TypeScript errors: `npm run lint`

### Authentication Not Working

- Verify Supabase redirect URLs include your Vercel URL
- Check that environment variables are correct
- Look at browser console for errors
- Verify the admin user exists in Supabase

### Database Connection Issues

- Verify Supabase credentials in Vercel environment variables
- Check Supabase project is not paused
- Verify RLS policies are set up correctly

### 500 Errors

- Check Vercel function logs: Project → Deployments → Click deployment → Functions
- Verify service role key is set correctly
- Check database tables exist

## Security Best Practices

1. **Never commit sensitive data**:
   - `.env` files
   - Service account JSON files
   - API keys or passwords
   - Proxy lists

2. **Use environment variables** for all sensitive configuration

3. **Enable Supabase RLS** on all tables

4. **Use strong passwords** for admin accounts

5. **Regular backups**: Supabase auto-backs up daily, but export your schema regularly

6. **Monitor usage**: Check Vercel and Supabase dashboards for unusual activity

## Optional: Set Up External APIs

If you're using the Python APIs for redirect links and image spoofing:

1. Deploy your Python APIs (e.g., on Railway, Render, or DigitalOcean)
2. Update environment variables in Vercel:
   - `PYTHON_REDIRECT_API_URL`
   - `PYTHON_SPOOFER_API_URL`
3. Redeploy on Vercel

## Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Check browser console
4. Review this guide's troubleshooting section

## Next Steps

- [ ] Set up custom domain
- [ ] Configure email templates in Supabase
- [ ] Set up team members
- [ ] Configure backup strategy
- [ ] Set up monitoring/alerting
- [ ] Review and customize UI/branding

---

**Congratulations!** 🎉 Your VA Hub is now live and accessible to users worldwide.


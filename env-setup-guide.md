# Environment Variables Setup

Create a `.env.local` file in your project root with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Encryption Key (generate a long random string)
ENCRYPTION_SECRET_KEY=your_long_random_encryption_key_here

# External API URLs (optional for now)
PYTHON_REDIRECT_API_URL=http://localhost:8000/api/redirect
PYTHON_SPOOFER_API_URL=http://localhost:8000/api/spoof
```

## How to Generate Encryption Key

You can generate a secure encryption key using:

**Online:** https://generate-secret.vercel.app/64
**Or use this command:** `openssl rand -base64 32`

## Example .env.local file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5NjU0MzIxMCwiZXhwIjoyMDExMjE5MjEwfQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjk2NTQzMjEwLCJleHA6MjAxMTIxOTIxMH0.example
ENCRYPTION_SECRET_KEY=your-64-character-random-string-here
PYTHON_REDIRECT_API_URL=http://localhost:8000/api/redirect
PYTHON_SPOOFER_API_URL=http://localhost:8000/api/spoof
```

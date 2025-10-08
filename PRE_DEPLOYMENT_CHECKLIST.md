# Pre-Deployment Checklist

Before publishing your VA Hub to GitHub and deploying to production, complete this checklist:

## 🔒 Security & Sensitive Data

- [ ] **Remove all `.env` files from git**
  - Run: `git rm --cached .env` (if already committed)
  - Verify `.env` is in `.gitignore`

- [ ] **Remove sensitive JSON files**
  - Check for: `spoofer-*.json` or any Google service account files
  - These should be in `.gitignore` (pattern: `spoofer-*.json`)

- [ ] **Remove proxy lists**
  - Check for: `proxyList*.txt`
  - These should be in `.gitignore` (pattern: `proxyList*.txt`)

- [ ] **Remove Python scripts with sensitive data**
  - Check for: `*.py` files
  - These should be in `.gitignore` (pattern: `*.py`)

- [ ] **Review SQL seed files**
  - DO NOT commit files with real user data
  - `seed.sql` and `seed-fixed.sql` are in `.gitignore`
  - Keep `schema.sql` (no sensitive data)

## 📋 Code Quality

- [ ] **Remove console.logs and debug code**
  - Search for: `console.log`, `console.error`, `debugger`
  - Remove or replace with proper error handling

- [ ] **Check for hardcoded credentials**
  - Search for: passwords, API keys, tokens
  - All should be in environment variables

- [ ] **Verify environment variable usage**
  - All config uses `process.env.VARIABLE_NAME`
  - No hardcoded URLs or keys

- [ ] **Run linter**
  ```bash
  npm run lint
  ```

- [ ] **Test build locally**
  ```bash
  npm run build
  npm run start
  ```

## 📝 Documentation

- [ ] **Update README.md**
  - Accurate description of the project
  - Clear setup instructions
  - Remove any internal/private information

- [ ] **env.example is up to date**
  - Contains all required environment variables
  - Has helpful comments
  - No real values, only examples

- [ ] **Review markdown documentation**
  - Remove any internal notes or sensitive info
  - Ensure guides are helpful for new users

## 🧪 Testing

- [ ] **Test authentication flow**
  - Login works
  - Logout works
  - Password reset (if implemented)

- [ ] **Test admin features**
  - Task creation
  - User management
  - Credential management

- [ ] **Test VA features**
  - View assigned tasks
  - Request resources
  - Log work

- [ ] **Test on different browsers**
  - Chrome/Edge
  - Firefox
  - Safari (if available)

## 🗄️ Database

- [ ] **Schema is finalized**
  - All migrations are in `supabase/migrations/`
  - `schema.sql` is up to date

- [ ] **RLS policies are correct**
  - Admin can access admin tables
  - VAs can only see their own data
  - No public access to sensitive tables

- [ ] **Sample seed data ready**
  - Create a clean `seed-example.sql` without real data
  - Instructions for creating first admin user

## 🚀 Deployment Prep

- [ ] **Supabase project created**
  - Production database separate from development
  - Credentials saved securely

- [ ] **Vercel account ready**
  - GitHub account connected
  - Ready to import repository

- [ ] **Domain ready (optional)**
  - Domain purchased
  - DNS access available

- [ ] **External APIs configured (if used)**
  - Python redirect API deployed
  - Image spoofer API deployed
  - URLs ready for environment variables

## 📦 Git Repository

- [ ] **Git history is clean**
  - No sensitive commits in history
  - If sensitive data was committed, see "Clean Git History" below

- [ ] **`.gitignore` is comprehensive**
  - All sensitive files excluded
  - `node_modules/` excluded
  - Build artifacts excluded

- [ ] **Commit messages are professional**
  - Clear, descriptive messages
  - No internal references or inappropriate content

## 🔍 Final Review

- [ ] **Review all files to be committed**
  ```bash
  git status
  git diff
  ```

- [ ] **No passwords or keys visible**
  ```bash
  git grep -i "password"
  git grep -i "secret"
  git grep -i "key"
  ```

- [ ] **Test clone and setup**
  - Clone to a new directory
  - Follow your own README
  - Verify everything works

---

## ⚠️ If You Find Sensitive Data in Git History

If you've already committed sensitive data:

### Option 1: Start Fresh (Recommended)
```bash
# Remove git history
rm -rf .git

# Start new repository
git init
git add .
git commit -m "Initial commit"
```

### Option 2: Use BFG Repo-Cleaner
```bash
# Install BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Remove sensitive files from history
bfg --delete-files "*.env"
bfg --delete-files "spoofer-*.json"
bfg --replace-text passwords.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Option 3: Filter Branch
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 🎯 Quick Command Reference

### Check for sensitive data:
```bash
# Search for common secrets
git grep -i "password" 
git grep -i "api_key"
git grep -i "secret"

# Check what will be committed
git status
git diff --cached

# Check what's ignored
git status --ignored
```

### Clean up before commit:
```bash
# Remove from staging
git reset HEAD <file>

# Remove from git but keep file
git rm --cached <file>

# Add to gitignore
echo "sensitive-file.json" >> .gitignore
```

### Test build:
```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Build project
npm run build

# Test production build
npm run start
```

---

## ✅ Ready to Deploy!

Once all items are checked:

1. **Commit final changes:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   ```

2. **Create GitHub repository** (follow DEPLOYMENT_GUIDE.md)

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/va-hub.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy to Vercel** (follow DEPLOYMENT_GUIDE.md)

5. **Set up Supabase** (follow DEPLOYMENT_GUIDE.md)

6. **Test production site**

7. **Celebrate! 🎉**

---

**Note**: Keep a backup of your local `.env` file and any sensitive credentials in a secure password manager (like 1Password, Bitwarden, or LastPass). You'll need these to set up environment variables in Vercel.


# VA Hub - Virtual Assistant Management Platform

> 🚀 **Production-Ready** • 🔒 **Secure** • 💰 **Free Hosting** • ⚡ **Auto-Deploy**

A comprehensive Virtual Assistant (VA) management platform built with Next.js 14+ and Supabase. This platform serves as a central hub for VAs to receive tasks, request necessary resources (logins, IPs, links), and log their work, with a full-featured admin dashboard for management and oversight.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/va-hub)

---

## 🎯 New to Deployment?

**👉 Start here**: [START_HERE.md](START_HERE.md) - Complete deployment guide from local to live in 30 minutes!

---

## Features

### Admin Dashboard
- **Task Management**: Create, assign, and manage tasks for VAs
- **User Management**: View and manage user accounts and roles
- **Scheduler**: Create and manage work schedules for VAs
- **Credential Vault**: Securely store and manage account credentials
- **IP Management**: Manage a pool of IP addresses for VA tasks

### VA Dashboard
- **Task Board**: Kanban-style board (To Do, In Progress, Completed) of assigned tasks
- **Resource Requests**: 
  - Get IP addresses (least-recently-used)
  - Generate redirect links via external API
  - Retrieve account credentials (encrypted)
  - Spoof images via external API
- **Work Logging**: Log completed work with notes and resource usage
- **Time Tracking**: Clock in/out functionality with persistent state

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS with Shadcn/UI components
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Python APIs for redirect links and image spoofing (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vaHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Run the seed script from `supabase/seed.sql` (update the bcrypt hash with your desired password)

4. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials and generate a secure encryption key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ENCRYPTION_SECRET_KEY=your_long_random_encryption_key_here
   PYTHON_REDIRECT_API_URL=http://localhost:8000/api/redirect
   PYTHON_SPOOFER_API_URL=http://localhost:8000/api/spoof
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with the admin credentials from the seed script

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles extending auth.users
- `tasks` - Tasks assigned to VAs
- `schedules` - VA work schedules
- `account_credentials` - Encrypted account credentials
- `work_logs` - Logged work against tasks
- `ip_addresses` - Pool of IP addresses
- `time_tracking` - Clock in/out records

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Password encryption** for stored credentials using AES-256-CBC
- **Role-based access control** (admin vs VA)
- **Route protection** via middleware
- **Secure server actions** for sensitive operations

## API Integration

The platform integrates with external Python APIs for:
- **Redirect Link Generation**: Creates numeric slugs for redirect links
- **Image Spoofing**: Processes uploaded images and returns processed versions

## 🚀 Deployment

**Ready to go live?** This app is production-ready and can be deployed in minutes!

### Quick Deploy (30 minutes)
Follow our streamlined guide: **[QUICK_START_DEPLOYMENT.md](QUICK_START_DEPLOYMENT.md)**

### Detailed Guides
- 📘 **[GitHub Setup Guide](GITHUB_SETUP.md)** - Safely publish to GitHub
- 📗 **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete Vercel + Supabase setup  
- 📋 **[Pre-Deployment Checklist](PRE_DEPLOYMENT_CHECKLIST.md)** - Security review

### Hosting Stack
- **Frontend & API**: Vercel (free tier available)
- **Database & Auth**: Supabase (free tier available)
- **Total Cost**: $0/month for small teams!

## 👤 Default Admin User

For local development, you can create an admin user using Supabase Auth UI or the provided seed example:
- See `supabase/seed-example.sql` for instructions
- Never commit real user data or passwords to git
- For production, create users manually through Supabase Dashboard

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure:
- Code follows existing patterns
- No sensitive data in commits
- Tests pass locally
- Documentation is updated

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Hosting platform

## 📞 Support

Need help?
- 📖 Check the [deployment guides](QUICK_START_DEPLOYMENT.md)
- 🐛 Report issues in the GitHub Issues tab
- 📧 Contact the maintainers

## 🗺️ Roadmap

- [ ] Mobile app version
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Integration with more external APIs
- [ ] Multi-language support

---

**Star ⭐ this repo if you find it helpful!**

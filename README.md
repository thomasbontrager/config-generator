# ShipForge - Production-Ready SaaS Platform

⚡ **ShipForge** is a full-featured SaaS application for generating production-ready configuration files and boilerplates for modern web development.

## 🚀 Features

### Authentication & User Management
- ✅ NextAuth.js with email/password signup
- ✅ OAuth integration (Google, GitHub)
- ✅ Protected routes with middleware
- ✅ User dashboard with account management
- ✅ 14-day free trial on signup

### Config/Boilerplate Generator
- ✅ Generate configs for: React, Vue, Express, Django, Docker, Kubernetes, GitHub Actions
- ✅ Download as ZIP
- ✅ Save generated configs to user dashboard
- ✅ Interactive UI with category grouping

### Subscription System (In Progress)
- ⏳ Stripe payment integration
- ⏳ $29/month Pro plan
- ⏳ Subscription status management
- ⏳ Cancellation flow with feedback

### User Dashboard
- ✅ Subscription status display
- ✅ Quick actions menu
- ⏳ Generated configs history
- ⏳ Usage analytics
- ⏳ Account settings

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL + Prisma ORM
- **Payments**: Stripe API
- **Analytics**: Google Analytics (G-F88E6SFH4F)
- **UI Components**: shadcn/ui (Radix UI)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/thomasbontrager/config-generator.git
cd config-generator
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with: `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `GITHUB_ID` & `GITHUB_SECRET` - GitHub OAuth credentials
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID (already set: G-F88E6SFH4F)

4. **Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗃️ Database Schema

The application uses Prisma ORM with the following models:

- **User** - User accounts and authentication
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **Subscription** - User subscription status
- **GeneratedConfig** - Saved config history
- **Payment** - Transaction logs

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── contact/       # Contact form
│   │   │   └── generator/     # Config generation
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── generator/         # Config generator UI
│   │   ├── pricing/           # Pricing page
│   │   └── contact/           # Contact page
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   ├── templates.ts       # Config templates
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── legacy-src/                # Legacy Vite app (preserved)
└── *.html                     # Legacy HTML pages (preserved)
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import on Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Add environment variables
- Deploy!

3. **Set up PostgreSQL**
- Use Vercel Postgres or external provider (e.g., Supabase, Neon)
- Add `DATABASE_URL` to Vercel environment variables

4. **Run migrations**
```bash
npx prisma migrate deploy
```

### Environment Variables in Production

Make sure to set all required environment variables in your Vercel project settings:
- Database credentials
- OAuth credentials  
- Stripe keys
- NextAuth secret and URL

## 🔐 OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set callback URL: `https://yourdomain.com/api/auth/callback/github`

## 💳 Stripe Setup

1. Create a Stripe account
2. Get your API keys from the dashboard
3. Create a product and price for the Pro plan ($29/month)
4. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Add webhook events: `customer.subscription.*`, `payment_intent.*`

## 📊 Google Analytics

Google Analytics is already configured with ID: `G-F88E6SFH4F`

Events tracked:
- Page views (automatic)
- Config generation
- User signup
- Subscription events

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@shipforge.dev or join our Discord community.

## 🎯 Roadmap

- [ ] Stripe subscription integration
- [ ] GitHub template clone functionality
- [ ] Version history tracking
- [ ] Team collaboration features
- [ ] Custom template builder
- [ ] API access
- [ ] Webhooks

---

Built with ❤️ using Next.js 14

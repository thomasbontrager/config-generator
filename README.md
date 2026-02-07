# ShipForge - Config & Boilerplate Generator

A production-ready Next.js 14 SaaS application for generating configuration files and boilerplates for various tech stacks.

## 🚀 Features

- **Authentication System**
  - Email/password authentication with bcrypt hashing
  - OAuth integration (Google & GitHub)
  - Protected routes with NextAuth.js middleware
  - Password reset flow
  
- **Subscription & Payments**
  - 14-day free trial (10 config generations)
  - Pro plan: $29/month (unlimited generations)
  - Stripe integration with webhook handlers
  - Subscription management dashboard

- **Config Generator**
  - Support for multiple tech stacks:
    - Frontend: React, Vue 3, Next.js
    - Backend: Express.js, Django
    - DevOps: Docker, Kubernetes, GitHub Actions
  - ZIP file download
  - Configuration history
  - Database persistence

- **Dashboard**
  - Overview with subscription status
  - Config generator interface
  - Configuration history
  - Account settings
  - Billing management

- **Tech Stack**
  - **Framework:** Next.js 14 (App Router) + TypeScript
  - **Styling:** Tailwind CSS + shadcn/ui components
  - **Auth:** NextAuth.js
  - **Database:** Prisma ORM + PostgreSQL
  - **Payments:** Stripe
  - **Analytics:** Google Analytics

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)
- Google/GitHub OAuth credentials (optional)

## 🛠️ Installation

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
   
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Update the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/shipforge?schema=public"

   # NextAuth.js
   NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   STRIPE_PRICE_ID_PRO="price_..."

   # OAuth (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # Analytics
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-F88E6SFH4F"
   ```

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

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL. Key models:

- **User**: User accounts with subscription status
- **Account**: OAuth accounts (NextAuth)
- **Session**: User sessions
- **Subscription**: Stripe subscription details
- **GeneratedConfig**: Config generation history
- **Payment**: Payment records

## 💳 Stripe Setup

1. **Create a Stripe account** at [stripe.com](https://stripe.com)

2. **Get API keys** from Stripe Dashboard → Developers → API keys

3. **Create a product and price**
   - Create a product named "Pro Plan"
   - Create a recurring price of $29/month
   - Copy the price ID to `STRIPE_PRICE_ID_PRO`

4. **Set up webhook**
   - In Stripe Dashboard, go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables from `.env`
   - Deploy

3. **Set up database**
   - Use Vercel Postgres or external PostgreSQL
   - Run migrations:
     ```bash
     npx prisma migrate deploy
     ```

4. **Configure Stripe webhook**
   - Update webhook URL to your Vercel domain
   - Test webhook delivery

### Environment Variables on Vercel

Add all variables from `.env` to your Vercel project settings:
- Settings → Environment Variables
- Add each variable with production values

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/         # Protected routes
│   │   ├── dashboard/
│   │   ├── generator/
│   │   ├── configs/
│   │   ├── settings/
│   │   └── billing/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   └── signup/
│   │   ├── generate/
│   │   └── stripe/webhook/
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── shared/              # Shared components
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── prisma.ts            # Prisma client
│   ├── stripe.ts            # Stripe config
│   └── utils.ts             # Utilities
├── prisma/
│   └── schema.prisma        # Database schema
├── templates/               # Config templates
└── types/                   # TypeScript types
```

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Prisma Studio (database GUI)
npx prisma studio
```

## 🧪 Testing

To test the application:

1. **Sign up** at `/auth/signup`
2. **Generate a config** at `/dashboard/generator`
3. **View history** at `/dashboard/configs`
4. **Upgrade to Pro** at `/dashboard/billing` (requires Stripe)

## 🔐 Security

- Passwords hashed with bcrypt
- Protected routes with NextAuth middleware
- Stripe webhooks verified with signatures
- Environment variables for sensitive data
- HTTPS required in production

## 🎨 Customization

### Adding New Config Templates

Edit `app/api/generate/route.ts` and add to `templateConfigs`:

```typescript
'my-template': {
  name: 'My Template',
  files: {
    'README.md': 'Content here...',
    'config.yml': 'Config content...',
  },
}
```

### Changing Subscription Plans

1. Update Stripe product/price
2. Update `STRIPE_PRICE_ID_PRO`
3. Update pricing pages

## 📝 License

MIT License - see LICENSE file

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues or questions:
- GitHub Issues
- Email: support@shipforge.dev

---

Built with ❤️ using Next.js, Prisma, and Stripe

# ShipForge Deployment Guide

## Quick Start

This guide will help you deploy ShipForge to production.

## Prerequisites

- Vercel account
- PostgreSQL database (Vercel Postgres recommended)
- Stripe account
- (Optional) Google/GitHub OAuth credentials

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project
2. Navigate to Storage tab
3. Create new Postgres database
4. Copy the `DATABASE_URL` connection string

### Option B: External PostgreSQL

1. Create a PostgreSQL database (version 12+)
2. Note the connection string format:
   ```
   postgresql://username:password@host:port/database?schema=public
   ```

## Step 2: Environment Variables

In your Vercel project settings, add these variables:

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=https://your-domain.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-F88E6SFH4F

# Admin
ADMIN_EMAIL=admin@shipforge.dev
```

### Optional Variables (OAuth)

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 3: Stripe Configuration

### 1. Create Product & Price

1. Go to Stripe Dashboard → Products
2. Create new product: "Pro Plan"
3. Add recurring price: $29/month
4. Copy the Price ID to `STRIPE_PRICE_ID_PRO`

### 2. Get API Keys

1. Stripe Dashboard → Developers → API keys
2. Copy Secret key to `STRIPE_SECRET_KEY`
3. Copy Publishable key to `STRIPE_PUBLISHABLE_KEY`

### 3. Set Up Webhook

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Step 4: Deploy to Vercel

### Via GitHub

1. Push code to GitHub:
   ```bash
   git push origin main
   ```

2. Import project in Vercel:
   - Go to vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables
   - Deploy

### Via CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

## Step 5: Run Database Migrations

After first deployment:

```bash
# Install dependencies locally
npm install

# Run migrations
npx prisma migrate deploy
```

Or use Vercel CLI:

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

## Step 6: Verify Deployment

1. **Test Authentication**
   - Sign up at `/auth/signup`
   - Verify email/password login
   - Test OAuth (if configured)

2. **Test Config Generation**
   - Log in
   - Go to `/dashboard/generator`
   - Select configs and generate
   - Verify ZIP download

3. **Test Stripe Webhook**
   - Go to Stripe Dashboard → Webhooks
   - Click on your webhook
   - Send test events
   - Check logs in Vercel

## Troubleshooting

### Build Fails

- Check environment variables are set
- Verify `DATABASE_URL` format
- Review build logs in Vercel

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible
- Ensure IP whitelist includes Vercel IPs (for external DB)

### Stripe Webhook Not Working

- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches
- Test webhook in Stripe Dashboard
- Check Vercel function logs

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches domain
- Clear browser cookies and try again

## Post-Deployment

### 1. Test End-to-End

- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Config generation works
- [ ] Billing page displays
- [ ] Stripe checkout (test mode)

### 2. Monitor

- Set up Vercel Analytics
- Monitor Stripe dashboard
- Check error logs regularly

### 3. Backup

- Set up database backups
- Export Stripe data regularly

## Updating

To deploy updates:

```bash
git push origin main
# Vercel auto-deploys
```

For database schema changes:

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Deploy to production
npx prisma migrate deploy
```

## Support

- GitHub Issues: https://github.com/thomasbontrager/config-generator/issues
- Email: support@shipforge.dev

## Security Checklist

- [ ] All environment variables set
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] Stripe keys are live (not test)
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Webhook signatures verified
- [ ] Database credentials secure
- [ ] OAuth redirect URIs configured

---

**Need help?** Check the main README.md for more details.

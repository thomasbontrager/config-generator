# Deployment Guide for ShipForge

This guide will help you deploy ShipForge to production.

## Prerequisites

- Vercel account (recommended) or any Node.js hosting
- PostgreSQL database (Vercel Postgres, Supabase, Neon, etc.)
- OAuth credentials (Google, GitHub)
- Stripe account (optional for now)

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection string

### Option B: External Database (Supabase, Neon, etc.)

1. Create a PostgreSQL database
2. Get the connection string (should look like: `postgresql://user:password@host:5432/dbname`)

## Step 2: Environment Variables

Set these in your Vercel project settings (or .env for other hosting):

### Required Variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# OAuth - Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-secret"

# OAuth - GitHub  
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-secret"

# Analytics (already configured)
NEXT_PUBLIC_GA_ID="G-F88E6SFH4F"
```

### Optional (for Stripe):
```bash
STRIPE_PUBLIC_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."
```

## Step 3: OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: ShipForge
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
4. Click "Register application"
5. Generate a new client secret
6. Copy Client ID and Client Secret

## Step 4: Deploy to Vercel

### Option A: Via GitHub (Recommended)

1. Push your code to GitHub:
```bash
git push origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "Add New Project"

4. Import your GitHub repository

5. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. Add all environment variables from Step 2

7. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Step 5: Database Migration

After deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Or via Vercel dashboard
# Go to Settings → Environment Variables
# Add a deployment hook that runs: npx prisma migrate deploy
```

## Step 6: Post-Deployment Checks

### Test Authentication
- [ ] Email/password signup works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] Dashboard loads after login
- [ ] Protected routes are protected

### Test Config Generator
- [ ] Can generate configs without login
- [ ] Can download ZIP files
- [ ] Configs are saved when logged in

### Test Pages
- [ ] Landing page loads
- [ ] Pricing page loads
- [ ] Contact form works
- [ ] Dashboard displays correctly

### Security Checks
- [ ] HTTPS is enabled
- [ ] Environment variables are set
- [ ] OAuth redirects work
- [ ] API routes are protected
- [ ] Database connection is secure (SSL)

## Step 7: Custom Domain (Optional)

1. Go to your Vercel project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` to use your custom domain
6. Update OAuth redirect URIs

## Step 8: Monitoring

### Vercel Analytics
Enable in project settings for:
- Page views
- Web vitals
- User experience metrics

### Error Tracking
Consider adding:
- Sentry
- LogRocket
- Datadog

### Uptime Monitoring
- UptimeRobot
- Pingdom
- Better Uptime

## Troubleshooting

### "Error: Invalid `prisma.user.create()` invocation"
- Check DATABASE_URL is correct
- Run migrations: `npx prisma migrate deploy`
- Check database is accessible from Vercel

### "Invalid OAuth callback"
- Verify redirect URIs match exactly
- Check OAuth credentials are correct
- Ensure NEXTAUTH_URL matches your domain

### "Database connection failed"
- Check DATABASE_URL includes `?sslmode=require` if needed
- Verify database allows connections from Vercel IPs
- Check connection limit isn't reached

### "Module not found" errors
- Clear `.next` directory
- Rebuild: `npm run build`
- Check all dependencies are in `package.json`

## Production Optimizations

### 1. Enable Compression
Already enabled by Vercel

### 2. Add Rate Limiting
Use Vercel Edge Config or Upstash Redis

### 3. Database Connection Pooling
Use Prisma Data Proxy or PgBouncer

### 4. CDN for Static Assets
Already handled by Vercel

### 5. Caching Strategy
Configure in `next.config.mjs`:
```js
{
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
}
```

## Maintenance

### Regular Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

### Backup Strategy
- Database: Daily automated backups
- Code: GitHub repository
- Environment: Document all variables

### Monitoring Checklist
- [ ] Database disk usage
- [ ] API response times
- [ ] Error rates
- [ ] User signup rate
- [ ] Config generation usage

## Support

For deployment issues:
- Email: support@shipforge.dev
- Documentation: github.com/thomasbontrager/config-generator

## Next Steps

After successful deployment:
1. Complete Stripe integration
2. Set up email service (SendGrid, Resend)
3. Implement admin dashboard
4. Add comprehensive logging
5. Set up automated testing

---

🎉 Congratulations! Your ShipForge SaaS is now live!

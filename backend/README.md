# Shipforge Backend

## Setup Instructions

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

3. Start the server:
```bash
npm run dev
```

The server will run on http://localhost:5000

## Making yourself an admin

After registering your first account, you need to manually set yourself as an admin:

1. Open Prisma Studio:
```bash
npm run prisma:studio
```

2. Click on the "User" model
3. Find your user account
4. Change the `role` field from `USER` to `ADMIN`
5. Save the changes

Now you can access the admin dashboard at `/admin` in the frontend.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Billing
- `POST /api/billing/stripe/checkout` - Create Stripe checkout session (requires auth)
- `POST /api/billing/stripe/webhook` - Stripe webhook handler
- `GET /api/billing/me` - Get billing state for current user (requires auth)

### Admin (requires ADMIN role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/metrics` - Get platform metrics
- `POST /api/admin/subscription` - Update user subscription
- `GET /api/admin/settings` - Get billing settings (masked)
- `POST /api/admin/settings` - Save billing settings

### Health
- `GET /health` - Health check

## Stripe Webhook

Configure your Stripe webhook endpoint at:
```
https://api.shipforge.dev/api/billing/stripe/webhook
```

Events to subscribe to:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

## Coolify Deployment

### Frontend App
- **Domain:** `https://shipforge.dev`
- **Repo:** `thomasbontrager/config-generator`
- **Branch:** `fix-billing-auth-final`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variables:**
  ```
  VITE_API_URL=https://api.shipforge.dev
  ```

### Backend App
- **Domain:** `https://api.shipforge.dev`
- **Repo:** `thomasbontrager/config-generator`
- **Branch:** `fix-billing-auth-final`
- **Root / Build context:** `backend`
- **Port:** `5000`
- **Start command:** `node src/app.js` (or `npm start`)
- **Environment variables:**
  ```
  DATABASE_URL=file:./dev.db
  JWT_SECRET=<generate a strong secret>
  PORT=5000
  CORS_ORIGIN=https://shipforge.dev,https://www.shipforge.dev
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_PRICE_ID=price_YOUR_PRICE_ID_HERE
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

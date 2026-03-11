# Shipforge Backend API

Production-ready Node + Express + JWT authentication backend with PayPal subscription billing.

## Features

- ✅ Express API with JWT authentication
- ✅ Secure password hashing with bcrypt
- ✅ Role-based access control (USER, ADMIN)
- ✅ SQLite (dev) / PostgreSQL (production) via Prisma ORM
- ✅ PayPal subscription billing
- ✅ PayPal webhook signature verification
- ✅ CORS enabled for frontend integration
- ✅ Health check endpoint

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-key-at-least-32-chars
PORT=5000
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
```

### 4. (Optional) Create an admin user

```bash
# Set ADMIN_EMAIL and ADMIN_PASS in .env first
node scripts/create-admin.js
```

### 5. Run the server

```bash
# Development (auto-reload):
npm run dev

# Production:
npm start
```

The server runs on `http://localhost:5000`.

---

## API Endpoints

### Health Check

```
GET /api/health
```
Returns: `{ "status": "ok" }`

---

### Authentication

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{ "email": "user@example.com", "password": "minlength8" }
```
Returns: `{ "token": "jwt-token-here" }`

#### Login
```
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "yourpassword" }
```
Returns: `{ "token": "jwt-token-here" }`

#### Get Current User (Protected)
```
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```
Returns: `{ "user": { "id": "...", "email": "...", "role": "USER", "subscription": "TRIAL", "createdAt": "..." } }`

---

### Billing

#### Create PayPal Subscription (Protected)
```
POST /api/billing/subscribe
Authorization: Bearer <your-jwt-token>
```
Returns: PayPal subscription object with `links[].rel === "approve"` redirect URL.

---

### Webhooks

#### PayPal Webhook
```
POST /api/webhooks/paypal
```
Handles `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`, and other PayPal events. Verifies webhook signature before processing.

---

## PayPal Setup

### 1. Create a PayPal Developer App

1. Go to https://developer.paypal.com
2. Sign in with a Business account
3. Create an App (Type: Merchant, Environment: Sandbox for testing)
4. Copy `CLIENT_ID` and `CLIENT_SECRET` → add to `.env`

### 2. Create a Subscription Plan

1. PayPal Dashboard → Products & Plans → Create Product (Type: Digital)
2. Create a Plan (e.g. $29/month, 14-day trial, auto-renew ON)
3. Copy the `Plan ID` → set `PAYPAL_PLAN_ID` in `.env`

### 3. Configure Webhooks

1. PayPal Dashboard → Webhooks → Add Webhook
2. URL: `https://your-backend-domain/api/webhooks/paypal`
3. Subscribe to:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`
4. Copy the Webhook ID → set `PAYPAL_WEBHOOK_ID` in `.env`

### 4. Update `.env` for PayPal

```env
PAYPAL_API=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_PLAN_ID=your-plan-id
PAYPAL_WEBHOOK_ID=your-webhook-id
RETURN_URL=https://shipforge.dev/billing/success
CANCEL_URL=https://shipforge.dev/billing/cancel
```

---

## Security Notes

- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- PayPal webhooks are verified with PayPal's signature verification API
- CORS is restricted to configured origins (`CORS_ORIGIN`)
- Never expose `JWT_SECRET` or PayPal credentials in source code

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma         # Database schema (User, AdminSettings)
│   └── migrations/           # Migration history
├── src/
│   ├── index.js              # Entry point
│   ├── app.js                # Express app setup + route mounting
│   ├── config/
│   │   └── env.js            # Environment config
│   ├── controllers/
│   │   ├── auth.controller.js    # Signup, login, me
│   │   ├── billing.controller.js # PayPal subscription creation
│   │   ├── webhook.controller.js # PayPal webhook handler
│   │   └── admin.controller.js   # Admin user/metrics management
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── admin.middleware.js   # Admin role check
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth/*
│   │   ├── billing.routes.js     # /api/billing/*
│   │   ├── webhook.routes.js     # /api/webhooks/*
│   │   └── admin.routes.js       # /api/admin/*
│   └── utils/
│       ├── jwt.js                # JWT sign/verify helpers
│       ├── paypalVerify.js       # PayPal webhook signature verification
│       └── prisma.js             # Prisma client singleton
├── scripts/
│   └── create-admin.js       # Seed admin user
├── .env.example              # Environment variable template
└── package.json
```

---

## Deployment

Deploy to Railway, Fly.io, Render, or any VPS. Remember to:

1. Set all environment variables on your hosting platform
2. Use `DATABASE_URL` pointing to PostgreSQL for production
3. Run `npx prisma migrate deploy` on first deployment
4. Use HTTPS in production
5. Set `CORS_ORIGIN` to your frontend domain
6. Use production PayPal API: `https://api-m.paypal.com`


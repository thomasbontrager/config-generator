# Express API with PayPal Subscriptions

Production-ready Express server with PayPal subscription billing integration.

## Getting started

```bash
npm install
node app.js
```

## Environment variables

Copy .env.example to .env and update with your PayPal credentials:

```bash
PORT=3000

# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_PLAN_ID=your_plan_id
PAYPAL_API=https://api-m.sandbox.paypal.com
```

## PayPal Dashboard Setup

### 1. Create PayPal App

1. Go to https://developer.paypal.com
2. Create a Business account
3. Create an App (Type: Merchant, Environment: Sandbox)
4. Save your `CLIENT_ID` and `CLIENT_SECRET`

### 2. Create Subscription Plan

1. In PayPal Dashboard: Products → Create Product
   - Name: Your Product Name (e.g., Shipforge Pro)
   - Type: Digital
2. Plans → Create Plan
   - Billing cycle: $29 / month
   - Trial: 14 days
   - Auto-renew: ON
3. Save the `PLAN_ID`

### 3. Setup Webhooks

1. PayPal Dashboard → Webhooks
2. Create webhook with URL: `https://your-backend-domain/api/webhooks/paypal`
3. Subscribe to events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`

## API Endpoints

### Create Subscription

```bash
POST /api/billing/subscribe
Authorization: Bearer <token>
```

Returns PayPal approval URL for user to complete subscription.

### Webhooks

```bash
POST /api/webhooks/paypal
```

Handles PayPal webhook events for subscription lifecycle.

## Feature Gating

Use the subscription status field to gate features:

- `trial` → limited features
- `active` → full access
- `canceled` → block access

## Security Notes

⚠️ **Important for Production:**

- Add webhook signature verification
- Use HTTPS only
- Never trust frontend for subscription state
- Use production PayPal API: `https://api-m.paypal.com`

## Run with Docker

```bash
docker-compose up --build
```
# Express API with Security Hardening

Production-ready Express server with enterprise-grade security features.

## 🔐 Security Features

- ✅ PayPal webhook signature verification
- ✅ JWT authentication with 15-minute token expiry
- ✅ Rate limiting (auth & API endpoints)
- ✅ CORS lockdown
- ✅ Bcrypt password hashing
- ✅ Central error handling
- ✅ Prisma ORM with PostgreSQL
- ✅ No password exposure in API responses

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

**Required Configuration:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong random string for JWT signing
- `PAYPAL_CLIENT_ID` - From PayPal Dashboard
- `PAYPAL_CLIENT_SECRET` - From PayPal Dashboard
- `PAYPAL_WEBHOOK_ID` - From PayPal Webhook settings
- `CORS_ORIGIN` - Allowed frontend origins (comma-separated)

### 3. Setup Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication (Rate Limited: 100 req/15min)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Protected API (Rate Limited: 500 req/15min)

- `GET /api/generate` - Generate config (requires active subscription)

### Webhooks (No rate limit)

- `POST /webhook/paypal` - PayPal webhook handler (signature verified)

### Health Check

- `GET /health` - Server health status

## 🧪 Security Testing

1. **Test webhook verification**: Send request without valid PayPal signature → 400 rejected
2. **Test auth**: Call `/api/generate` without token → 401 Unauthorized
3. **Test subscription**: Call with trial user token → 403 Forbidden
4. **Test admin**: Call admin routes as regular user → 403 Forbidden
5. **Test PayPal**: Activate subscription → User status flips to ACTIVE

## 🐳 Run with Docker

```bash
docker-compose up --build
```

## 📝 Notes

- Tokens expire after 15 minutes for security
- All passwords are bcrypt hashed (never exposed)
- Rate limits prevent abuse
- CORS is locked to configured origins only
- All errors sanitized in production
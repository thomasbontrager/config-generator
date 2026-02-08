# ShipForge - Subscription-Based Feature Gating

This project implements end-to-end subscription-based feature gating for ShipForge. Only users with active subscriptions can access the generator feature.

## 🎯 Features

- **Backend Enforcement**: Server-side middleware blocks unauthorized access
- **Frontend Gating**: UI reflects subscription status and provides upgrade prompts
- **JWT Authentication**: Secure token-based authentication with subscription info
- **Real Security**: No trust in the client - backend always validates

## 🏗️ Architecture

### Backend (Express.js)
Located in `/backend/`

**Key Components:**
- `middleware/subscription.middleware.js` - Validates active subscription
- `middleware/auth.middleware.js` - JWT authentication
- `controllers/auth.controller.js` - Login, register, and user management
- `routes/generator.routes.js` - Protected generator endpoints

**API Endpoints:**
- `POST /api/auth/register` - Register new user (starts with TRIAL)
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/generator/generate` - Protected generator (requires ACTIVE)

### Frontend (React + Vite)
Located in `/frontend/`

**Key Components:**
- `context/AuthContext.jsx` - Centralized authentication state
- `pages/Login.jsx` - Login/register interface
- `pages/Generator.jsx` - Protected generator page with subscription gate
- `App.jsx` - Router configuration

## 🚀 Getting Started

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ..
npm install
```

### 2. Start the Backend
```bash
cd backend
npm start
```
Backend runs on `http://localhost:5000`

### 3. Start the Frontend
```bash
cd ..
npm run dev
```
Frontend runs on `http://localhost:5173`

## 🔐 Subscription States

| State | Generator Access | ZIP Downloads | Future Pro Features |
|-------|-----------------|---------------|-------------------|
| **TRIAL** | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **ACTIVE** | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **CANCELED** | ❌ Blocked | ❌ Blocked | ❌ Blocked |

## 🧪 Test Accounts

Use these pre-configured accounts for testing:

| Email | Password | Subscription | Access |
|-------|----------|--------------|--------|
| `trial@example.com` | `password123` | TRIAL | ❌ Blocked |
| `active@example.com` | `password123` | ACTIVE | ✅ Granted |
| `canceled@example.com` | `password123` | CANCELED | ❌ Blocked |

## 🧪 Testing the Feature Gate

### Test 1: TRIAL User (Blocked)
1. Navigate to `http://localhost:5173/login`
2. Login with `trial@example.com` / `password123`
3. Try to access `/generator`
4. ✅ Should see "Upgrade Required" message

### Test 2: ACTIVE User (Granted)
1. Navigate to `http://localhost:5173/login`
2. Login with `active@example.com` / `password123`
3. Access `/generator`
4. ✅ Should see "You have full access!"

### Test 3: Backend API Protection
```bash
# Try to access generator with TRIAL token
curl -X POST http://localhost:5000/api/generator/generate \
  -H "Authorization: Bearer <TRIAL_TOKEN>"

# Response: {"message":"Active subscription required","code":"SUBSCRIPTION_REQUIRED"}
```

## 🛡️ Security

### Double Protection
1. **Frontend Gate**: Provides good UX and upsell opportunities
2. **Backend Enforcement**: Real security - blocks API access

Even if someone:
- Modifies frontend JavaScript
- Manually calls the API
- Bypasses the UI

❌ **Backend still blocks them**

This is real SaaS security, not cosmetic gating.

## 📋 Implementation Checklist

- [x] Backend subscription middleware
- [x] Backend auth middleware  
- [x] JWT with subscription payload
- [x] Auth controller with login/register
- [x] Protected generator routes
- [x] Frontend AuthContext
- [x] Login/Register page
- [x] Protected Generator page with UI gate
- [x] React Router integration
- [x] Test all subscription states
- [x] Verify backend blocking

## 💰 What This Unlocks

✅ Real paywall - not just UI blocking
✅ Upsell funnel - TRIAL users see upgrade prompts
✅ Clean upgrade UX - clear messaging
✅ Revenue enforcement - backend validates everything
✅ Admin override capability - easy to extend

## 🔧 Extending

### Add New Protected Routes
```javascript
// backend/src/routes/your-feature.routes.js
router.post('/action', 
  requireAuth, 
  requireActiveSubscription, 
  yourHandler
);
```

### Update Subscription Status
Currently using mock data. In production:
1. Integrate with Stripe/payment provider
2. Update user subscription in database
3. Re-issue JWT with new subscription state

## 📝 Notes

- Backend uses mock in-memory users (no database yet)
- JWT secret should be changed in production (`.env` file)
- Frontend calls `localhost:5000` - update for production
- CORS is enabled for all origins in development

---

**This is the money switch.** 🚀

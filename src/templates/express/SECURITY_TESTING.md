# Security Testing Guide

This guide walks you through testing all security features in the generated Express backend.

## Prerequisites

1. Generate and extract the Express backend ZIP
2. Install dependencies: `npm install`
3. Setup `.env` file with your configuration
4. Run database migrations: `npm run prisma:migrate`
5. Start the server: `npm run dev`

## 🧪 Security Tests

### Test 1: PayPal Webhook Verification

**Purpose**: Ensure only legitimate PayPal webhooks are processed.

**Test Invalid Signature**:
```bash
curl -X POST http://localhost:3000/webhook/paypal \
  -H "Content-Type: application/json" \
  -d '{"event_type": "BILLING.SUBSCRIPTION.ACTIVATED", "resource": {"id": "fake-sub-123"}}'
```

**Expected Result**: ❌ `400 Bad Request` - "Invalid webhook signature"

**Test Valid Webhook**: 
- Use PayPal's webhook simulator in the Dashboard
- Should process successfully and update user subscription

### Test 2: JWT Authentication

**Purpose**: Verify API endpoints require valid authentication.

**Test Without Token**:
```bash
curl http://localhost:3000/api/generate
```

**Expected Result**: ❌ `401 Unauthorized` - "Authentication required"

**Test With Valid Token**:
1. Register/login to get a token
2. Use the token in header:
```bash
curl http://localhost:3000/api/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result**: 
- ✅ `200 OK` if subscription is active
- ❌ `403 Forbidden` if trial user

### Test 3: Subscription Protection

**Purpose**: Ensure trial users cannot access premium features.

**Test With Trial User Token**:
```bash
# First register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "trial@example.com", "password": "password123"}'

# Extract token from response, then:
curl http://localhost:3000/api/generate \
  -H "Authorization: Bearer TRIAL_USER_TOKEN"
```

**Expected Result**: ❌ `403 Forbidden` - "Active subscription required"

### Test 4: Admin Routes Protection

**Purpose**: Verify only admin users can access admin endpoints.

**Note**: You'll need to create admin-specific routes to test this.

**Test With Regular User Token**:
```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer REGULAR_USER_TOKEN"
```

**Expected Result**: ❌ `403 Forbidden` - "Admin access required"

### Test 5: Rate Limiting

**Purpose**: Prevent API abuse through rate limits.

**Test Auth Rate Limit (100 req/15min)**:
```bash
# Send 101 rapid requests to auth endpoint
for i in {1..101}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@test.com", "password": "wrong"}' &
done
wait
```

**Expected Result**: After 100 requests, receive `429 Too Many Requests`

### Test 6: CORS Protection

**Purpose**: Ensure only allowed origins can access the API.

**Test From Unauthorized Origin**:
```bash
curl http://localhost:3000/api/generate \
  -H "Origin: https://malicious-site.com" \
  -H "Authorization: Bearer VALID_TOKEN" \
  -v
```

**Expected Result**: CORS headers should NOT include the unauthorized origin.

**Test From Allowed Origin**:
```bash
curl http://localhost:3000/api/generate \
  -H "Origin: http://localhost:5173" \
  -H "Authorization: Bearer VALID_TOKEN" \
  -v
```

**Expected Result**: Response includes `Access-Control-Allow-Origin: http://localhost:5173`

### Test 7: JWT Token Expiry

**Purpose**: Tokens should expire after 15 minutes.

**Test Token Expiry**:
1. Login and get a token
2. Wait 16 minutes
3. Try to use the token:
```bash
curl http://localhost:3000/api/generate \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```

**Expected Result**: ❌ `401 Unauthorized` - "Invalid or expired token"

### Test 8: Password Security

**Purpose**: Passwords should never be exposed in responses.

**Test Registration Response**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "password": "password123"}'
```

**Expected Result**: Response should NOT contain the `password` field, only `id`, `email`, `role`, `subscription`, etc.

### Test 9: Error Handling

**Purpose**: Errors should not leak sensitive information.

**Test Internal Error**:
- Trigger an error (e.g., database connection failure)
- Check response

**Expected Result in Production**:
```json
{
  "message": "Internal server error"
}
```

**Expected Result in Development**:
```json
{
  "message": "Detailed error message for debugging"
}
```

### Test 10: PayPal Subscription Activation

**Purpose**: Verify subscription status updates when PayPal sends activation event.

**Complete Flow Test**:
1. Create user account
2. Update user with PayPal subscription ID:
```sql
UPDATE "User" SET "paypalSubId" = 'I-SUBSCRIPTION123' WHERE email = 'test@example.com';
```
3. Send valid PayPal webhook (from PayPal Dashboard simulator) with `BILLING.SUBSCRIPTION.ACTIVATED` event
4. Verify user subscription changed from `TRIAL` to `ACTIVE`

## ✅ Security Checklist

After running all tests, verify:

- [ ] Webhook verification blocks fake PayPal events
- [ ] Unauthenticated requests are rejected (401)
- [ ] Trial users cannot access premium features (403)
- [ ] Admin routes require admin role (403)
- [ ] Rate limits prevent abuse (429)
- [ ] CORS blocks unauthorized origins
- [ ] JWT tokens expire after 15 minutes
- [ ] Passwords never appear in API responses
- [ ] Error messages don't leak sensitive data
- [ ] PayPal webhooks correctly update subscription status

## 🔐 Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use production PayPal API URL
- [ ] Configure production database
- [ ] Set production `CORS_ORIGIN` (remove localhost)
- [ ] Configure real PayPal webhook ID
- [ ] Enable HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Review and adjust rate limits for your use case

## 🚨 Common Issues

**"Invalid webhook signature" for all webhooks**
- Check `PAYPAL_WEBHOOK_ID` is correct
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
- Ensure webhook URL matches PayPal Dashboard configuration

**"Authentication required" with valid token**
- Check JWT_SECRET matches between token creation and verification
- Verify token hasn't expired (15 min limit)
- Ensure Authorization header format: `Bearer <token>`

**CORS errors in browser**
- Add your frontend origin to `CORS_ORIGIN` in `.env`
- Restart server after changing `.env`

## 📚 Additional Resources

- [PayPal Webhooks Documentation](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

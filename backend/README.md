# Shipforge Backend API

Production-ready Node + Express + JWT authentication backend.

## Features

- ✅ Express API with JWT authentication
- ✅ Secure password hashing with bcrypt
- ✅ Role-based access control (user, admin)
- ✅ Ready for PayPal subscriptions
- ✅ CORS enabled for frontend integration
- ✅ Health check endpoint

## Installation

```bash
cd backend
npm install
```

## Configuration

Create a `.env` file in the backend directory:

```env
PORT=5000
JWT_SECRET=super-secret-change-this
```

**Important:** Change the `JWT_SECRET` to a secure random string in production.

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns: `{ "status": "ok" }`

### Authentication

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
Returns: `{ "token": "jwt-token-here" }`

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
Returns: `{ "token": "jwt-token-here" }`

#### Get Current User (Protected)
```
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```
Returns: `{ "user": { "id": 1, "role": "user", "iat": ..., "exp": ... } }`

## Testing with cURL

### Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### Get Current User
```bash
# First, save the token from login response
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Project Structure

```
backend/
├── src/
│   ├── index.js              # Entry point
│   ├── app.js                # Express app setup
│   ├── config/
│   │   └── env.js            # Environment configuration
│   ├── routes/
│   │   └── auth.routes.js    # Auth route definitions
│   ├── controllers/
│   │   └── auth.controller.js # Auth business logic
│   ├── middleware/
│   │   └── auth.middleware.js # JWT authentication middleware
│   └── utils/
│       └── jwt.js            # JWT utility functions
├── .env                       # Environment variables (not in git)
└── package.json              # Dependencies and scripts
```

## Security Notes

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 7 days
- Tokens are verified on protected routes
- **Important:** Change `JWT_SECRET` in production
- **Note:** Currently uses in-memory storage - replace with a database for production

## User Model

Each user has the following structure:
```javascript
{
  id: number,
  email: string,
  password: string (hashed),
  role: "user" | "admin",
  subscription: string
}
```

## Next Steps

- [ ] Add database integration (PostgreSQL, MongoDB, etc.)
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Implement PayPal subscription integration
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Add input validation middleware
- [ ] Add API documentation with Swagger/OpenAPI

## Deployment

This backend can be deployed to:
- VPS (Ubuntu/Debian)
- Fly.io
- Railway
- Cloudflare Workers (with adapter)
- Heroku
- AWS EC2/ECS
- DigitalOcean

Remember to:
1. Set environment variables on your hosting platform
2. Use a production-grade database
3. Enable HTTPS
4. Configure CORS for your frontend domain
5. Set up proper error logging and monitoring

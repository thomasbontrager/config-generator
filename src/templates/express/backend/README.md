# ShipForge Backend - PostgreSQL + Prisma

Production-ready Express backend with PostgreSQL database and Prisma ORM.

## Features

- ✅ User authentication (signup/login)
- ✅ JWT token-based auth
- ✅ Password hashing with bcrypt
- ✅ PostgreSQL database with Prisma ORM
- ✅ User roles (USER, ADMIN)
- ✅ Subscription status (TRIAL, ACTIVE, CANCELED)
- ✅ Ready for PayPal integration

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Make sure you have PostgreSQL installed and running.

Create a database:
```bash
createdb shipforge
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shipforge"
```

Generate a secure JWT secret:
```
JWT_SECRET=your-very-secure-random-string-here
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create database tables
- Generate Prisma client
- Sync your database schema

### 5. Start the Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt_token_here"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER",
    "subscription": "TRIAL"
  }
}
```

## Database Schema

### User Model

- `id` - Auto-increment integer (Primary Key)
- `email` - Unique string
- `password` - Hashed string
- `role` - Enum: USER, ADMIN (default: USER)
- `subscription` - Enum: TRIAL, ACTIVE, CANCELED (default: TRIAL)
- `paypalSubId` - Optional unique string for PayPal subscription
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Prisma Commands

```bash
# View database in browser
npm run prisma:studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Generate Prisma client after schema changes
npm run prisma:generate

# Reset database (warning: deletes all data)
npx prisma migrate reset
```

## Production Deployment

For production (Railway, Fly.io, VPS):

1. Set `DATABASE_URL` to your production database
2. Set a strong `JWT_SECRET`
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Next Steps

- Add PayPal webhook handler for subscription updates
- Implement admin routes with `requireAdmin` middleware
- Add password reset functionality
- Add email verification
- Add rate limiting
- Add request logging

## Security Notes

- Always use HTTPS in production
- Keep JWT_SECRET secure and random
- Use strong passwords for database
- Enable CORS only for trusted domains in production
- Implement rate limiting for auth endpoints

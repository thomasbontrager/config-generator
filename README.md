# Shipforge - SaaS Config Generator

A real SaaS application with admin dashboard, user authentication, and subscription management.

## Features

- 🔐 User authentication (register/login)
- 👥 Admin dashboard for user management
- 💳 Subscription status management
- 🎛️ Manual subscription overrides (FREE → TRIAL → ACTIVE → CANCELLED)
- 🔒 Backend-enforced admin protection
- ⚙️ Config/boilerplate generator (subscription-locked)

## Project Structure

```
├── backend/          # Express + Prisma backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   └── prisma/       # Database schema
│
└── frontend/         # React + Vite frontend
    └── src/
        ├── context/  # Auth context
        ├── pages/    # Login, Generator, Admin
        └── ...
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend runs on http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### 3. Make Yourself Admin

1. Register an account via the UI
2. Run `npm run prisma:studio` in the backend directory
3. Open the User model
4. Find your account and change `role` from `USER` to `ADMIN`
5. Save and refresh the frontend

## Admin Dashboard

Once you're an admin, you can:

- View all users
- See subscription status
- Manually override subscriptions (FREE → TRIAL → ACTIVE → CANCELLED)
- Emergency access control

Visit `/admin` when logged in as an admin.

## Tech Stack

**Backend:**
- Express.js
- Prisma ORM
- SQLite (can be changed to PostgreSQL/MySQL)
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- React 19
- Vite
- React Router
- Context API for state management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Admin (requires admin role)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/subscription` - Update user subscription

## License

MIT

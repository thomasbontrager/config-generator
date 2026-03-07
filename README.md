# ⚡ config-generator

Generate full dev configs instantly

Shipforge generates production-ready developer stacks as downloadable ZIP projects. No setup hell. Just ship.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open http://localhost:3001

## Features

- Generate Vite + React stacks
- Generate Express API stacks
- Download as ZIP with Docker configs
- Subscription-based SaaS model

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
├── frontend/         # Standalone React + Vite frontend (auth/admin UI)
│   └── src/
│       ├── context/  # Auth context
│       ├── pages/    # Login, Generator, Admin
│       └── templates/ # Downloadable project templates
│
└── src/              # Main public-facing app source (Vite + React)
    ├── components/
    ├── pages/
    └── templates/    # Vite-React, Express project templates
```

## Tech Stack

**Frontend:**
- React 19
- Vite
- React Router
- Context API for state management

**Backend:**
- Express.js
- Prisma ORM
- SQLite (can be changed to PostgreSQL/MySQL)
- JWT authentication
- bcryptjs for password hashing

## Admin Dashboard

Once you're an admin, you can:

- View all users
- See subscription status
- Manually override subscriptions (FREE → TRIAL → ACTIVE → CANCELLED)
- Emergency access control

Visit `/admin` when logged in as an admin.

## License

MIT

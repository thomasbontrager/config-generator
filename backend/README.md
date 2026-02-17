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

### Admin (requires ADMIN role)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/subscription` - Update user subscription

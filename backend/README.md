# ShipForge Backend

Backend API for ShipForge with subscription-based feature gating.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults work for development):
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:5000`.

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login with email and password
- **GET /api/auth/me** - Get current user (requires auth)

### Generator (Protected)

- **POST /api/generator/generate** - Access the generator (requires active subscription)

## Test Accounts

The backend includes mock test accounts:

- **Trial User**: trial@example.com / password123 (subscription: TRIAL)
- **Active User**: active@example.com / password123 (subscription: ACTIVE)
- **Canceled User**: canceled@example.com / password123 (subscription: CANCELED)

## Subscription States

- **TRIAL** - Cannot access generator (blocked)
- **ACTIVE** - Full access to generator
- **CANCELED** - Cannot access generator (blocked)

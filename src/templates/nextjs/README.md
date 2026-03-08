# Next.js Docker Configuration

This directory contains Docker configuration files for a Next.js application.

## What is Next.js?

Next.js is a popular React framework that provides features like:
- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes
- File-based routing
- Automatic code splitting
- Built-in CSS and TypeScript support

## Files Included

- `Dockerfile` - Multi-stage Docker build for optimal image size
- `docker-compose.yml` - Docker Compose configuration for easy deployment
- `.env.example` - Environment variables template
- `README.md` - This file

## Prerequisites

- Docker and Docker Compose installed
- A Next.js project with `package.json`
- Next.js configured with `output: 'standalone'` in `next.config.js`

## Important: Next.js Configuration

For the Dockerfile to work properly, you need to add this to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ... other config
}

module.exports = nextConfig
```

This enables Next.js to output a standalone build suitable for Docker.

## Setup Instructions

1. **Copy files to your Next.js project:**
   ```bash
   cp Dockerfile docker-compose.yml .env.example your-nextjs-project/
   ```

2. **Configure environment variables:**
   ```bash
   cd your-nextjs-project
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

   Your Next.js app will be available at http://localhost:3000

## Building for Production

### Using Docker Compose
```bash
docker-compose up --build -d
```

### Using Docker directly
```bash
# Build the image
docker build -t nextjs-app .

# Run the container
docker run -p 3000:3000 --env-file .env nextjs-app
```

## Development vs Production

This configuration is optimized for **production** deployment. For development:

1. Use the Next.js dev server directly:
   ```bash
   npm run dev
   ```

2. Or modify the Dockerfile to run `npm run dev` instead of building

## Environment Variables

- `NEXT_PUBLIC_*` variables are exposed to the browser
- Other variables are server-side only
- Update `.env.example` based on your needs

## Adding a Database

The `docker-compose.yml` includes a commented PostgreSQL service. To enable it:

1. Uncomment the `postgres` service and `postgres-data` volume
2. Update `DATABASE_URL` in your `.env` file
3. Restart with `docker-compose up -d`

## Troubleshooting

**Port already in use:**
```bash
# Change the port mapping in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

**Build fails:**
- Ensure `output: 'standalone'` is set in `next.config.js`
- Check that all dependencies are in `package.json`
- Verify Node version compatibility

**Image size too large:**
- The multi-stage build should keep the image small
- Consider adding `.dockerignore` to exclude unnecessary files

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Documentation](https://docs.docker.com/)

## Project Structure

```
your-nextjs-project/
├── .env                 # Your environment variables (don't commit!)
├── .env.example         # Template for environment variables
├── Dockerfile           # Docker build configuration
├── docker-compose.yml   # Docker Compose configuration
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies
└── ... (your Next.js files)
```

## Security Notes

- Never commit `.env` files with real credentials
- Use strong secrets for `API_SECRET_KEY` and `NEXTAUTH_SECRET`
- In production, use environment-specific configuration
- Consider using Docker secrets for sensitive data

## Performance Tips

1. Enable caching in your Docker builds
2. Use `npm ci` instead of `npm install` for reproducible builds
3. The standalone output optimizes bundle size
4. Consider adding a reverse proxy (nginx) for production
5. Use CDN for static assets when possible

# 🚀 Production Deployment Guide

This guide covers deploying the Config Generator to production using Cloudflare Pages for the frontend and VPS for any backend services.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Frontend Deployment (Cloudflare Pages)](#frontend-deployment-cloudflare-pages)
- [Backend Deployment (VPS + PM2)](#backend-deployment-vps--pm2)
- [DNS & SSL Configuration](#dns--ssl-configuration)
- [Production Checklist](#production-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)

## 🏗️ Architecture Overview

```
shipforge.dev        → Frontend (Cloudflare Pages)
api.shipforge.dev    → Backend (VPS) - if needed
Cloudflare           → DNS, SSL, CDN, firewall
```

### Why This Stack?

- **Cloudflare Pages**: Zero-config SSL, global CDN, automatic deployments
- **VPS (Hetzner/DigitalOcean/Vultr)**: Full control, predictable costs
- **PM2**: Process management, auto-restart, zero-downtime deploys
- **Nginx**: Reverse proxy, SSL termination, load balancing

---

## 🌐 Frontend Deployment (Cloudflare Pages)

### Prerequisites

- GitHub account with repository access
- Cloudflare account with domain added
- Domain: `shipforge.dev`

### Step 1: Push Frontend to GitHub

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Connect your GitHub repository: `thomasbontrager/config-generator`
4. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

### Step 3: Configure Environment Variables

In Cloudflare Pages → Settings → Environment Variables, add:

```env
VITE_API_URL=https://api.shipforge.dev
```

> **Note**: If this is a frontend-only app, you may not need API URL. The Config Generator currently runs entirely in the browser.

### Step 4: Deploy

Cloudflare will automatically deploy your app. Every push to `main` will trigger a new deployment.

**Your frontend will be live at**: `https://shipforge.dev`

### Step 5: Custom Domain

1. In Cloudflare Pages project → **Custom domains**
2. Add `shipforge.dev`
3. Cloudflare will automatically configure DNS and SSL

---

## 🖥️ Backend Deployment (VPS + PM2)

> **Note**: The Config Generator is currently a frontend-only app. This section is for deploying the **Express backend** that users generate from the tool.

### Prerequisites

- VPS with Ubuntu 22.04 (Hetzner, DigitalOcean, Vultr)
- 1-2 GB RAM minimum
- SSH access

### Step 1: Create VPS

Recommended providers:
- **Hetzner**: €4.15/month
- **DigitalOcean**: $6/month
- **Vultr**: $5/month

Choose Ubuntu 22.04 as the OS.

### Step 2: Initial Server Setup

SSH into your server:

```bash
ssh root@your-server-ip
```

Update system and install dependencies:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js (v20.x LTS) via NodeSource repository (recommended for up-to-date and stable LTS builds)
curl -fsSL https://deb.nodesource.com/setup_20.x -o setup_node.sh
bash setup_node.sh
apt install -y nodejs

# Install PM2, Nginx, Git
npm install -g pm2
apt install -y nginx git
```

### Step 3: Clone Your Backend

If you generated an Express backend with this tool:

```bash
cd /var/www
git clone https://github.com/yourusername/your-backend.git
cd your-backend
npm install
```

### Step 4: Configure Environment Variables

Create `.env` file on the VPS:

```bash
nano .env
```

Add your production environment variables:

```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# JWT
JWT_SECRET=super-long-random-secret-generate-this

# PayPal (if applicable)
PAYPAL_CLIENT_ID=live_id
PAYPAL_CLIENT_SECRET=live_secret
PAYPAL_PLAN_ID=live_plan_id
PAYPAL_WEBHOOK_ID=live_webhook_id
PAYPAL_API=https://api-m.paypal.com

# CORS
ALLOWED_ORIGINS=https://shipforge.dev
```

> ⚠️ **Never commit `.env` to version control**

### Step 5: Database Setup (PostgreSQL)

Install PostgreSQL:

```bash
apt install -y postgresql postgresql-contrib
```

Create database and user:

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE your_db_name;
CREATE USER your_db_user WITH PASSWORD 'strongpassword';
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_db_user;
\q
```

If using Prisma, run migrations:

```bash
npx prisma migrate deploy
```

### Step 6: Start Backend with PM2

Start your application:

```bash
pm2 start server.js --name api
pm2 save
pm2 startup
```

Copy and run the startup command that PM2 outputs.

Verify it's running:

```bash
pm2 status
pm2 logs api
```

### Step 7: Configure Nginx

Create Nginx configuration:

```bash
nano /etc/nginx/sites-available/api
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.shipforge.dev;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 🌍 DNS & SSL Configuration

### Step 1: DNS Records in Cloudflare

Add DNS records in Cloudflare:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| A | `@` | Cloudflare Pages | ☁️ Proxied |
| A | `api` | `YOUR_VPS_IP` | ☁️ Proxied |

> Enable the orange cloud (☁️) to proxy through Cloudflare for DDoS protection and CDN.

### Step 2: SSL Configuration

In Cloudflare → SSL/TLS:

1. Set mode to **Full (strict)**
2. Enable **Always Use HTTPS**
3. Enable **Automatic HTTPS Rewrites**

For extra security on VPS, install Let's Encrypt:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.shipforge.dev
```

---

## ✅ Production Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] `.env` file secured (not in git)
- [ ] CORS origins configured correctly
- [ ] Build completes without errors
- [ ] Tests passing

### Post-Deployment

- [ ] `https://shipforge.dev` loads correctly
- [ ] `https://api.shipforge.dev/health` returns OK (if backend exists)
- [ ] All forms work (contact, pricing, etc.)
- [ ] Analytics tracking works
- [ ] Payment flows work (if applicable)
- [ ] Error tracking configured

### Security Checks

- [ ] No secrets in logs
- [ ] HTTPS enforced everywhere
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention
- [ ] CSRF tokens where needed

---

## 📊 Monitoring & Maintenance

### PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart app
pm2 restart api

# Zero-downtime reload
pm2 reload api
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### Database Backups

Set up daily backups:

```bash
# Create backup script
nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump your_db_name > /backups/db_$DATE.sql
find /backups -type f -mtime +7 -delete  # Keep 7 days
```

```bash
chmod +x /usr/local/bin/backup-db.sh
crontab -e
```

Add daily backup at 2 AM:

```cron
0 2 * * * /usr/local/bin/backup-db.sh
```

### Health Checks

Monitor your application:

```bash
# Check if app is running
curl https://api.shipforge.dev/health

# Check response time
time curl -I https://shipforge.dev
```

---

## 🔧 Troubleshooting

### App Not Starting

```bash
# Check PM2 logs
pm2 logs api --lines 100

# Check if port is in use
lsof -i :5000

# Restart PM2
pm2 restart api
```

### Nginx Issues

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Check logs
tail -f /var/log/nginx/error.log
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U your_db_user -d your_db_name
```

---

## 🚨 Production Rules

1. **Never log secrets** - Use environment variables, never hardcode
2. **Never trust frontend** - Always validate on backend
3. **Always gate on backend** - Authentication/authorization server-side
4. **Monitor PM2 logs** - Set up log rotation and alerts
5. **Back up DB daily** - Automate with cron
6. **Use HTTPS everywhere** - No exceptions
7. **Rate limit APIs** - Prevent abuse
8. **Update dependencies** - Security patches weekly

---

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Need help?** Check out the [contact page](contact.html) or open an issue on GitHub.

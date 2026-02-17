# 🚀 Quick Start: Cloudflare Pages Deployment

This is a quick reference guide for deploying the Config Generator to Cloudflare Pages. For complete instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Prerequisites

✅ GitHub account with repository access  
✅ Cloudflare account (free plan works)  
✅ Domain added to Cloudflare (e.g., `shipforge.dev`)

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Click **Connect to Git**
4. Select your GitHub repository: `thomasbontrager/config-generator`
5. Click **Begin setup**

### 3. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave empty) |
| **Node version** | 20 (default) |

### 4. Set Environment Variables (Optional)

If you need to configure API endpoints or feature flags:

1. Go to **Settings** → **Environment Variables**
2. Add variables (examples):
   - `VITE_API_URL` = `https://api.shipforge.dev`
   - `VITE_GA_ID` = `G-XXXXXXXXXX`

All environment variables must be prefixed with `VITE_` to be accessible in the app.

### 5. Deploy

Click **Save and Deploy**

Cloudflare will:
- Install dependencies (`npm install`)
- Build your app (`npm run build`)
- Deploy to CDN
- Assign a URL: `https://[random-name].pages.dev`

First deployment takes 2-5 minutes.

### 6. Add Custom Domain

1. In your project → **Custom domains** → **Set up a custom domain**
2. Enter your domain: `shipforge.dev`
3. Cloudflare will automatically configure DNS
4. SSL certificate is auto-generated (takes ~1 minute)

### 7. Enable Production Settings

Go to **Settings** → **Builds & deployments**:

- ✅ Enable **Automatic builds** for branch: `main`
- ✅ Set **Production branch** to `main`
- ✅ Enable **Preview deployments** for pull requests

## 🎉 You're Live!

Your site is now live at: `https://shipforge.dev`

Every push to `main` triggers automatic deployment.

## Verify Deployment

Check these to ensure everything works:

```bash
# Test your site loads
curl -I https://shipforge.dev

# Check for HTTPS
curl -I https://shipforge.dev | grep -i "location: https"

# Verify no 404s
curl -s https://shipforge.dev | grep -i "404"
```

## Troubleshooting

### Build Failed

Check build logs in Cloudflare Pages → Deployments → [failed build] → View details

Common issues:
- Missing dependencies: Check `package.json`
- Build command wrong: Should be `npm run build`
- Node version: Use Node 18+ or 20+

### Site Shows 404

1. Check build output directory is `dist`
2. Verify `index.html` exists in `dist/` after build
3. Check `_redirects` file is present (for SPA routing)

### Environment Variables Not Working

1. Ensure variable name starts with `VITE_`
2. Redeploy after adding env vars (Settings → Deployments → Retry deployment)
3. Access in code with `import.meta.env.VITE_VARIABLE_NAME`

## Rollback a Deployment

If something breaks:

1. Go to **Deployments**
2. Find the last working deployment
3. Click **⋯** → **Rollback to this deployment**

Takes ~30 seconds to rollback.

## Monitor Deployments

View deployment status:
- **Deployments** tab shows all builds
- **Analytics** tab shows traffic and performance
- **Functions Metrics** (if using Cloudflare Functions)

## Next Steps

- [ ] Set up [backend deployment](DEPLOYMENT.md#backend-deployment-vps--pm2) (if needed)
- [ ] Configure [DNS records](DEPLOYMENT.md#dns--ssl-configuration)
- [ ] Review [production checklist](DEPLOYMENT-CHECKLIST.md)
- [ ] Set up monitoring and alerts

## Resources

- [Full Deployment Guide](DEPLOYMENT.md)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Need help?** Open an issue on GitHub or check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

# 🚀 Production Deployment Checklist

Use this checklist to ensure your production deployment is secure, reliable, and complete.

## 📦 Pre-Deployment

### Code Quality
- [ ] All tests passing
- [ ] Linting passes without errors
- [ ] Build completes successfully
- [ ] No console.log statements in production code
- [ ] Dead code removed
- [ ] Dependencies updated and audited (`npm audit`)

### Configuration
- [ ] Environment variables configured for production
- [ ] `.env` file created on server (not in git)
- [ ] API URLs point to production endpoints
- [ ] CORS origins configured correctly
- [ ] Database connection strings verified
- [ ] Payment provider keys are LIVE (not test/sandbox)

### Security
- [ ] All secrets use strong random values (32+ characters)
- [ ] No hardcoded credentials in code
- [ ] `.env` file permissions set to 600
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection enabled

### Database
- [ ] Database created
- [ ] Database user created with appropriate permissions
- [ ] Migrations run successfully
- [ ] Database backup strategy in place
- [ ] Database connection pooling configured

---

## 🚀 Deployment Steps

### Frontend (Cloudflare Pages)
- [ ] GitHub repository connected to Cloudflare Pages
- [ ] Build settings configured (Vite, `npm run build`, `dist`)
- [ ] Environment variables set in Cloudflare Pages
- [ ] Custom domain added and DNS configured
- [ ] SSL certificate active (Full Strict mode)
- [ ] Build successful and site accessible

### Backend (VPS)
- [ ] VPS created and SSH access confirmed
- [ ] System updated (`apt update && apt upgrade`)
- [ ] Node.js installed (v18+ or v20+)
- [ ] PM2 installed globally
- [ ] Nginx installed and configured
- [ ] Application code deployed to `/var/www` or appropriate directory
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with production values
- [ ] Application starts successfully with PM2
- [ ] PM2 saved (`pm2 save`)
- [ ] PM2 startup configured (`pm2 startup`)
- [ ] Nginx configuration created and enabled
- [ ] Nginx test passes (`nginx -t`)
- [ ] Nginx restarted

### DNS & SSL
- [ ] Domain DNS records point to correct servers
  - [ ] `@` or `www` → Cloudflare Pages
  - [ ] `api` subdomain → VPS IP
- [ ] Cloudflare proxy (orange cloud) enabled
- [ ] SSL mode set to Full (Strict) in Cloudflare
- [ ] Let's Encrypt certificate installed on VPS (optional but recommended)
- [ ] All HTTP traffic redirects to HTTPS

---

## ✅ Post-Deployment Verification

### Frontend Checks
- [ ] `https://shipforge.dev` loads without errors
- [ ] All pages load correctly (home, pricing, contact, etc.)
- [ ] Forms submit successfully
- [ ] Links work correctly
- [ ] Images and assets load
- [ ] Mobile responsive design works
- [ ] Browser console shows no errors
- [ ] Analytics tracking works (check Google Analytics)

### Backend Checks (if applicable)
- [ ] `https://api.shipforge.dev/health` returns 200 OK
- [ ] API endpoints respond correctly
- [ ] Database queries work
- [ ] Authentication works (signup, login, logout)
- [ ] Password reset works
- [ ] Email sending works
- [ ] File uploads work (if applicable)

### Payment Integration (if applicable)
- [ ] Payment gateway in LIVE mode (not sandbox)
- [ ] Test payment completes successfully
- [ ] Webhooks receive events correctly
- [ ] Subscription creation works
- [ ] Subscription cancellation works
- [ ] Payment receipt emails sent

### Monitoring
- [ ] PM2 monitoring active (`pm2 monit`)
- [ ] Application logs accessible (`pm2 logs`)
- [ ] Nginx logs accessible
- [ ] Error tracking configured (Sentry, LogRocket, etc.)
- [ ] Uptime monitoring configured (UptimeRobot, Pingdom, etc.)

---

## 🔒 Security Verification

- [ ] HTTPS enforced on all pages
- [ ] Security headers present:
  ```bash
  curl -I https://shipforge.dev
  # Check for: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
  ```
- [ ] No secrets logged in application logs
- [ ] No secrets exposed in client-side code
- [ ] CORS configured to allow only trusted origins
- [ ] Rate limiting tested and working
- [ ] SQL injection tested (if applicable)
- [ ] XSS prevention tested
- [ ] CSRF tokens working (if applicable)

---

## 📊 Performance Checks

- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Images optimized
- [ ] JavaScript bundle size optimized
- [ ] CSS bundle size optimized
- [ ] API response times acceptable (< 500ms)
- [ ] Database queries optimized

---

## 🔧 Operations

### Backup Strategy
- [ ] Database backups scheduled (daily recommended)
- [ ] Backup restore tested
- [ ] `.env` file backed up securely
- [ ] SSL certificates backed up

### Monitoring & Alerts
- [ ] Uptime monitoring configured
- [ ] Error alerts configured
- [ ] Disk space alerts configured
- [ ] Memory usage alerts configured
- [ ] CPU usage alerts configured

### Documentation
- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Rollback procedure documented
- [ ] Emergency contacts documented
- [ ] API documentation updated (if applicable)

---

## 🚨 Rollback Plan

In case something goes wrong:

### Frontend Rollback
- [ ] Previous working commit identified
- [ ] Rollback procedure tested:
  1. Go to Cloudflare Pages → Deployments
  2. Find previous successful deployment
  3. Click "Rollback to this deployment"

### Backend Rollback
- [ ] Previous working version in git identified
- [ ] Rollback procedure documented:
  ```bash
  cd /var/www/your-app
  git log --oneline  # Find previous commit
  git checkout <commit-hash>
  npm install
  pm2 restart all
  ```

---

## 📝 Post-Launch Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Verify all backups running
- [ ] Test all critical user flows
- [ ] Collect initial user feedback

### Month 1
- [ ] Review security logs
- [ ] Analyze traffic patterns
- [ ] Optimize slow queries
- [ ] Update dependencies
- [ ] Review and adjust rate limits

### Ongoing
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly disaster recovery drills
- [ ] Regular performance reviews

---

## 🆘 Emergency Contacts

Document your emergency contacts and procedures:

- **Domain Registrar**: _______________
- **DNS Provider**: Cloudflare
- **Hosting Provider**: _______________
- **Payment Processor**: _______________
- **Email Service**: _______________
- **On-Call Developer**: _______________
- **System Administrator**: _______________

---

## 📚 Resources

- [Deployment Guide](DEPLOYMENT.md)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

---

**Last Updated**: [Fill in date when deploying]  
**Deployment Date**: [Fill in when completed]  
**Deployed By**: [Your name]

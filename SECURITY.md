# Security Policy

## Known Issues

### Next.js Vulnerabilities (v14.2.35)

The current version of Next.js (14.2.35) has known security vulnerabilities:

1. **DoS via Image Optimizer** (GHSA-9g9p-9gw9-jx7f) - High severity
2. **HTTP request deserialization DoS** (GHSA-h25m-26qc-wcjf) - High severity

#### Mitigation Options:

1. **Immediate**: Disable Next.js Image Optimization if not used
   ```js
   // next.config.mjs
   module.exports = {
     images: {
       unoptimized: true
     }
   }
   ```

2. **Recommended**: Upgrade to Next.js 15.5.9 or later
   ```bash
   npm install next@latest
   ```
   Note: This may require code updates for compatibility.

3. **Production**: Use a Web Application Firewall (WAF) to filter malicious requests

## Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use strong, randomly generated secrets for `NEXTAUTH_SECRET`
- Rotate API keys regularly
- Use environment-specific configurations

### Database Security
- Use SSL/TLS for database connections in production
- Implement row-level security in PostgreSQL
- Regular database backups
- Use prepared statements (Prisma handles this)

### Authentication
- Enable OAuth providers for better security
- Implement rate limiting on auth endpoints
- Use HTTPS only in production
- Set secure cookie flags

### API Security
- Validate all inputs
- Implement rate limiting
- Use CORS appropriately
- Enable CSRF protection

## Reporting a Vulnerability

If you discover a security vulnerability, please email:
**security@shipforge.dev**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to respond within 48 hours.

## Security Updates

- Review dependencies monthly: `npm audit`
- Update dependencies regularly: `npm update`
- Monitor GitHub security advisories
- Subscribe to Next.js security announcements

## Checklist for Production Deployment

- [ ] Update Next.js to latest stable version
- [ ] Enable HTTPS/SSL
- [ ] Set secure environment variables
- [ ] Enable rate limiting
- [ ] Configure WAF/CDN (Cloudflare, etc.)
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Implement backup strategy
- [ ] Test authentication flows
- [ ] Review CORS settings
- [ ] Enable security headers
- [ ] Set up intrusion detection

## Security Headers

Add to `next.config.mjs`:

```js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        }
      ]
    }
  ]
}
```

## Dependencies

Regularly check for vulnerabilities:
```bash
npm audit
npm audit fix
```

For breaking changes:
```bash
npm audit fix --force
```

## Contact

For security concerns: security@shipforge.dev
For general support: support@shipforge.dev

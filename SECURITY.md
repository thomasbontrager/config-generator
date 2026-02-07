# Security Policy

## Security Status

✅ **All known vulnerabilities have been addressed**

The application has been updated to Next.js 15.5.12, which includes patches for all known security vulnerabilities including:
- DoS via HTTP request deserialization in React Server Components (FIXED)
- DoS via Image Optimizer (FIXED)
- Cache poisoning vulnerabilities (FIXED)

## Version Information

- **Next.js**: 15.5.12 (Latest secure version)
- **Last Security Update**: February 2026

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

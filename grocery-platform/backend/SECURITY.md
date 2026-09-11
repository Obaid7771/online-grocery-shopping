# Security Guidelines for FreshCart Backend

## Overview

This document outlines the security measures implemented in the FreshCart backend and provides guidelines for maintaining a secure production deployment.

## Implemented Security Measures

### 1. Authentication & Authorization

- **JWT-based Authentication**: Access tokens (15min) + Refresh tokens (7d)
- **Refresh Token Rotation**: New refresh token issued on each refresh
- **Role-Based Access Control (RBAC)**: CUSTOMER, STORE_MANAGER, DISPATCHER, ADMIN, SUPER_ADMIN
- **Password Requirements**:
  - Minimum 8 characters
  - Must contain: uppercase, lowercase, number, special character
  - Common passwords are blocked
  - Passwords are hashed using bcrypt (12 rounds)

### 2. Input Validation & Sanitization

- **Global Validation Pipe**: Validates all incoming DTOs
- **Whitelist Mode**: Strips unknown properties from requests
- **XSS Prevention**: Input sanitization for string fields
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

### 3. Rate Limiting

Three-tier rate limiting strategy:
- **Short**: 10 requests/second
- **Medium**: 50 requests/10 seconds
- **Long**: 200 requests/minute

Sensitive endpoints have stricter limits:
- Login: 5 attempts/15 minutes
- Registration: 3 attempts/hour
- Password Reset: 3 attempts/hour

### 4. HTTP Security Headers

Applied via Helmet middleware:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`

### 5. CORS Configuration

- Whitelist-based origin validation
- Credentials support for secure cookies
- Restricted HTTP methods and headers

### 6. Audit Logging

Write operations (POST, PUT, PATCH, DELETE) are logged with:
- User ID and email
- Request path and method
- IP address and user agent
- Timestamp and duration
- Success/failure status

## Security Checklist for Production

### Environment Variables

- [ ] All secrets are unique and randomly generated (64+ chars)
- [ ] JWT secrets are different for access and refresh tokens
- [ ] Database uses SSL connections
- [ ] Stripe uses live keys (not test keys)
- [ ] No default or example values remain

### Infrastructure

- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] SSL/TLS certificates are valid and not expiring
- [ ] Database is not publicly accessible
- [ ] Redis requires authentication
- [ ] Firewall rules restrict access to necessary ports only
- [ ] Regular automated backups are configured

### Monitoring

- [ ] Error tracking enabled (Sentry)
- [ ] Security event logging enabled
- [ ] Alerting configured for suspicious activity
- [ ] Regular log review process established

### Compliance

- [ ] PCI DSS requirements met (payment data handling)
- [ ] GDPR requirements met (EU users)
- [ ] Privacy policy updated
- [ ] Terms of service updated

## Incident Response

### Security Incident Contacts

- Primary: security@freshcart.com
- Secondary: devops@freshcart.com

### Response Procedure

1. **Identify**: Confirm the security incident
2. **Contain**: Isolate affected systems if necessary
3. **Eradicate**: Remove the threat
4. **Recover**: Restore normal operations
5. **Learn**: Post-incident analysis and improvements

### Common Incidents

#### Suspected Breach

1. Immediately rotate all JWT secrets
2. Force logout all users (invalidate refresh tokens)
3. Review audit logs for suspicious activity
4. Notify affected users if data was compromised

#### Brute Force Attack

1. Check rate limiting is working
2. Temporarily block attacking IPs
3. Consider CAPTCHA for login if attacks persist

#### Leaked Credentials

1. Rotate affected credentials immediately
2. Review access logs for unauthorized access
3. Update deployment with new credentials

## Dependency Security

- Run `npm audit` regularly
- Use Dependabot or Snyk for automated vulnerability detection
- Keep all dependencies updated
- Review new dependency additions carefully

## Code Security Guidelines

### DO

- Use parameterized queries (Prisma handles this)
- Validate and sanitize all user input
- Use strong typing (TypeScript)
- Log security-relevant events
- Use least privilege principle for database access

### DON'T

- Log sensitive data (passwords, tokens, PII)
- Store secrets in code
- Trust client-side validation alone
- Use `eval()` or similar dynamic code execution
- Expose stack traces in production errors

## API Security

### Sensitive Endpoints Protection

| Endpoint | Rate Limit | Additional Protection |
|----------|------------|----------------------|
| `/auth/login` | 5/15min | Lockout after failures |
| `/auth/register` | 3/hour | Email verification |
| `/auth/reset-password` | 3/hour | Token expiration |
| `/admin/*` | Standard | Role verification |
| `/payments/*` | Standard | Webhook signature |

### Token Security

- Access tokens: Short-lived (15 minutes)
- Refresh tokens: Longer-lived (7 days), rotated on use
- Tokens stored securely (HttpOnly cookies for web, secure storage for mobile)

## Contact

For security concerns or to report vulnerabilities:
- Email: security@freshcart.com
- Response time: Within 24 hours

# FreshCart Authentication & Security Architecture

## 1. Authentication Lifecycle & Token Architecture

FreshCart employs a zero-trust dual-token authentication scheme designed for both mobile and web clients:

```
[Mobile / Web Client]                 [NestJS Auth Gateway]               [PostgreSQL DB]
         │                                      │                                │
    1. POST /auth/login (email, password)       │                                │
         ├─────────────────────────────────────►│                                │
         │                                      │ 2. Find User by email          │
         │                                      ├───────────────────────────────►│
         │                                      │◄───────────────────────────────┤
         │                                      │ 3. Verify Argon2id password    │
         │                                      │ 4. Generate Access Token (15m) │
         │                                      │ 5. Generate Refresh Token(30d) │
         │                                      │ 6. Hash & Save Refresh Token   │
         │                                      ├───────────────────────────────►│
         │ 7. Return { accessToken,             │                                │
         │             refreshToken, user }     │                                │
         │◄─────────────────────────────────────┤                                │
         │                                      │                                │
    [Store in Secure Storage / Keystore]        │                                │
         │                                      │                                │
    8. Authenticated API Call                   │                                │
       (Bearer Access Token)                    │                                │
         ├─────────────────────────────────────►│                                │
         │                                      │ 9. Verify JWT signature & exp  │
         │                                      │ 10. Extract userId & role      │
         │                                      │ 11. Execute request handler    │
         │◄─────────────────────────────────────┤                                │
         │                                      │                                │
    12. Access Token Expired (HTTP 401)         │                                │
         │                                      │                                │
    13. POST /auth/refresh-token                │                                │
       (refreshToken)                           │                                │
         ├─────────────────────────────────────►│ 14. Lookup token hash in DB   │
         │                                      ├───────────────────────────────►│
         │                                      │◄───────────────────────────────┤
         │                                      │ 15. Check revocation / reuse   │
         │                                      │ 16. Rotate: Invalidate old,    │
         │                                      │     Issue new token pair       │
         │                                      ├───────────────────────────────►│
         │ 17. Return new { accessToken,        │                                │
         │                  refreshToken }      │                                │
         │◄─────────────────────────────────────┤                                │
```

### 1.1 Token Specifications
- **Access Token**:
  - Algorithm: `RS256` or `HS256` (HMAC-SHA256 with 256-bit cryptographically random secret)
  - TTL: 15 minutes (`900s`)
  - Payload: `{ "sub": "userId", "email": "...", "role": "CUSTOMER", "iat": ..., "exp": ... }`
- **Refresh Token**:
  - Format: Cryptographically secure 64-character random hex string (`crypto.randomBytes(32).toString('hex')`)
  - Hashing: Stored in PostgreSQL table `RefreshToken` as SHA-256 hash (`crypto.createHash('sha256').update(token).digest('hex')`)
  - TTL: 30 days
  - **Reuse Detection**: If a previously revoked refresh token is presented, the authentication engine flags a potential token compromise and immediately revokes all active refresh tokens for that user ID.

### 1.2 Client-Side Secure Storage
- **Flutter Mobile App**:
  - iOS: iOS Keychain using `flutter_secure_storage` with `kSecAttrAccessibleAfterFirstUnlock`.
  - Android: Android Keystore using `EncryptedSharedPreferences` with AES-256 GCM master key encryption.
- **Admin Web Dashboard**:
  - Stored in HTTP-only, Secure, `SameSite=Strict` cookies or client-side memory refreshed proactively via Axios interceptors to mitigate XSS exposure.

---

## 2. Password Security Standards
- **Algorithm**: `Argon2id` (v1.3)
- **Memory Cost**: 65536 KB (64 MB)
- **Time Cost (Iterations)**: 3 passes
- **Parallelism**: 4 threads
- **Salt Length**: 16 bytes cryptographically random
- Argon2id is immune to GPU cracking attacks and side-channel timing attacks.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Resource / Action | CUSTOMER | STORE_MANAGER | DISPATCHER | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|
| Browse Catalog & Categories | Allowed | Allowed | Allowed | Allowed | Allowed |
| Manage Personal Cart & Wishlist | Allowed | - | - | - | - |
| Checkout & Place Orders | Allowed | - | - | - | - |
| Cancel Own Pending Order | Allowed | - | - | - | - |
| View Assigned Orders | Own Orders | All Store | All Store | All Store | All Store |
| Update Order Status (`PREPARING`) | - | Allowed | - | Allowed | Allowed |
| Update Order Status (`OUT_FOR_DELIVERY`)| - | - | Allowed | Allowed | Allowed |
| Issue Order Refund | - | - | - | Allowed | Allowed |
| Create/Edit Products & Categories | - | Read/Stock | - | Allowed | Allowed |
| Adjust Inventory Stock Levels | - | Allowed | - | Allowed | Allowed |
| Manage Promotional Coupons | - | - | - | Allowed | Allowed |
| Configure Delivery Zones & Slots | - | - | - | Allowed | Allowed |
| Manage Staff Accounts & Permissions | - | - | - | - | Allowed |
| View System Audit Logs | - | - | - | - | Allowed |

---

## 4. API Hardening & Security Defenses

### 4.1 Input Validation & DTO Sanitization
- NestJS global `ValidationPipe` with:
  - `whitelist: true` (strips all unsolicited request payload properties)
  - `forbidNonWhitelisted: true` (rejects malformed payloads with 400 Bad Request)
  - `transform: true` (auto-casts primitives into validated TypeScript classes)

### 4.2 Rate Limiting & Throttling
- Configured via `@nestjs/throttler`:
  - **Auth Endpoints** (`/auth/login`, `/auth/register`): 5 requests per minute per IP to defend against credential stuffing.
  - **General API Endpoints**: 120 requests per minute per IP.
  - **Payment Endpoints**: 10 requests per minute per authenticated user.

### 4.3 Security Headers & CORS
- **Helmet**: Disables `X-Powered-By`, enforces HSTS (`max-age=31536000; includeSubDomains; preload`), sets `X-Content-Type-Options: nosniff`, and configures strict Content Security Policy (CSP).
- **CORS**: Strictly whitelists authorized client origins:
  - Production Mobile Scheme: Direct app-layer TLS pinning
  - Production Admin Web: `https://admin.freshcart.io`
  - Local Dev: `http://localhost:3000`, `http://localhost:4000`

### 4.4 Webhook Cryptographic Verification
- **Stripe**: Computes HMAC-SHA256 signature using `stripe.webhooks.constructEvent(rawBody, signature, endpointSecret)` against the unparsed raw HTTP request buffer.
- **PayPal**: Validates `PAYPAL-TRANSMISSION-SIG`, `PAYPAL-CERT-URL`, and transmission timestamp against PayPal verification endpoints before updating any order record.

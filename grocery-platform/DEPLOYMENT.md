# FreshCart Production Deployment Guide

## Overview

This guide covers deploying the FreshCart grocery platform to production:
- **Backend API**: Railway / Render / AWS ECS
- **Admin Dashboard**: Vercel
- **Mobile App**: App Store & Google Play
- **Database**: Managed PostgreSQL (Supabase / Railway / AWS RDS)
- **Storage**: AWS S3 / Cloudflare R2

---

## 1. Database Setup (Supabase)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your database credentials:
   - Host: `db.<project-ref>.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: `<your-password>`

### Database URL
```
DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?schema=public"
```

### Run Migrations
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

---

## 2. Backend Deployment (Railway)

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app) and connect your GitHub repo
2. Create a new project from the `backend` directory
3. Add environment variables (see `.env.production.template`)
4. Railway auto-detects the Dockerfile

### Option B: Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repo, select `backend` directory
4. Set build command: `npm install && npx prisma generate && npm run build`
5. Set start command: `npm run start:prod`

### Required Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<generate-64-char-secret>
JWT_REFRESH_SECRET=<generate-64-char-secret>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGINS=https://admin.freshcart.io,https://freshcart.io
PORT=4000
```

### Generate Secrets
```bash
# Generate secure secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For JWT_REFRESH_SECRET
```

---

## 3. Admin Dashboard Deployment (Vercel)

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and import your repo
2. Set root directory to `admin`
3. Framework preset: Next.js
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://api.freshcart.io/api/v1
   ```

### Custom Domain
1. Add domain in Vercel project settings
2. Configure DNS:
   ```
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com
   ```

### vercel.json (already configured)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## 4. File Storage (AWS S3 / Cloudflare R2)

### AWS S3 Setup
1. Create S3 bucket: `freshcart-uploads`
2. Configure CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://admin.freshcart.io", "https://api.freshcart.io"],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. Create IAM user with S3 access
4. Add to backend environment:
```env
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=us-east-1
AWS_S3_BUCKET=freshcart-uploads
```

### Cloudflare R2 (S3-compatible, cheaper)
1. Create R2 bucket in Cloudflare dashboard
2. Generate API tokens
3. Use S3-compatible endpoint

---

## 5. Mobile App Release

### iOS App Store

#### Prerequisites
- Apple Developer Account ($99/year)
- Mac with Xcode installed
- App Store Connect access

#### Build & Submit
```bash
cd mobile

# Install dependencies
flutter pub get

# Build iOS release
flutter build ios --release

# Open in Xcode
open ios/Runner.xcworkspace
```

#### In Xcode:
1. Select "Any iOS Device" as target
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload

#### App Store Connect:
1. Create new app
2. Fill in metadata:
   - App name: FreshCart
   - Bundle ID: com.freshcart.app
   - SKU: freshcart-ios-001
3. Add screenshots (6.5", 5.5" required)
4. Submit for review

### Google Play Store

#### Prerequisites
- Google Play Developer Account ($25 one-time)
- Signed release APK/AAB

#### Generate Signing Key
```bash
cd mobile/android

# Create keystore (keep this safe!)
keytool -genkey -v -keystore freshcart-release.keystore \
  -alias freshcart -keyalg RSA -keysize 2048 -validity 10000
```

#### Configure Signing
Create `android/key.properties`:
```properties
storePassword=<your-store-password>
keyPassword=<your-key-password>
keyAlias=freshcart
storeFile=../freshcart-release.keystore
```

#### Build Release
```bash
cd mobile

# Build Android App Bundle (recommended)
flutter build appbundle --release

# Or build APK
flutter build apk --release --split-per-abi
```

#### Google Play Console:
1. Create new app
2. Fill in store listing
3. Upload AAB to Production track
4. Complete content rating questionnaire
5. Set up pricing (Free)
6. Submit for review

---

## 6. Domain & SSL Configuration

### DNS Setup (Cloudflare recommended)
```
# API Backend
Type: A
Name: api
Value: <railway-ip>

# Admin Dashboard (Vercel)
Type: CNAME
Name: admin
Value: cname.vercel-dns.com

# Main Website (if applicable)
Type: A
Name: @
Value: <server-ip>
```

### SSL Certificates
- **Vercel**: Automatic SSL
- **Railway**: Automatic SSL
- **Custom servers**: Use Let's Encrypt with Certbot

---

## 7. Monitoring & Logging

### Application Monitoring (Sentry)
1. Create Sentry project at [sentry.io](https://sentry.io)
2. Install in backend:
```bash
cd backend
npm install @sentry/node
```

3. Add to main.ts:
```typescript
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com) - Free tier available
- [Better Uptime](https://betteruptime.com)

### Log Management
- Railway/Render: Built-in logs
- Production: Consider Datadog, LogRocket, or Papertrail

---

## 8. CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) handles:
- ✅ Linting & type checking
- ✅ Unit tests
- ✅ Build verification
- ✅ Auto-deploy on merge to main

### Auto-Deploy Setup

#### Railway
1. Connect GitHub repo
2. Enable auto-deploy on push to `main`

#### Vercel
1. Import repo
2. Auto-deploys on every push by default

---

## 9. Production Checklist

### Before Launch
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL certificates active
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Load testing completed

### Security
- [ ] JWT secrets are unique and secure
- [ ] Database credentials rotated
- [ ] API endpoints authenticated
- [ ] Input validation enabled
- [ ] XSS protection active
- [ ] SQL injection prevented (Prisma ORM)

### Performance
- [ ] Database indexes created
- [ ] Image optimization enabled
- [ ] CDN configured (Cloudflare)
- [ ] Caching strategy implemented
- [ ] Gzip compression enabled

---

## 10. Backup & Recovery

### Database Backups
```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20240101.sql
```

### Supabase
- Automatic daily backups (Pro plan)
- Point-in-time recovery available

### Railway
- Automatic backups with PostgreSQL plugin

---

## Quick Deploy Commands

```bash
# Deploy backend to Railway
railway up

# Deploy admin to Vercel
cd admin && vercel --prod

# Build mobile apps
cd mobile
flutter build ios --release
flutter build appbundle --release
```

---

## Support

For deployment issues:
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)

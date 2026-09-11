# FreshCart: Production-Ready Online Grocery Shopping Platform

FreshCart is a modern, enterprise-grade, full-stack grocery e-commerce solution. It features a cross-platform mobile application for iOS and Android, a high-performance NestJS backend, a PostgreSQL relational database with Prisma ORM, a responsive Next.js Admin Dashboard, real-time WebSocket order tracking, and integrated Stripe/PayPal payments.

---

## System Components

| Component | Technology | Description |
|---|---|---|
| **Mobile App** | Flutter / Dart / Riverpod / GoRouter | Customer mobile shopping experience on iOS & Android |
| **Backend API** | NestJS / TypeScript / Prisma / PostgreSQL | Secure REST API, WebSocket gateway, auth, and business logic |
| **Admin Dashboard**| Next.js / React / Tailwind CSS / TypeScript | Store management, product catalog, live order dispatch, analytics |
| **Database** | PostgreSQL 16 | Relational data persistence with strict constraints and indexes |
| **Infrastructure** | Docker Compose / GitHub Actions | Containerized services, local dev orchestration, CI/CD pipelines |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Flutter 3.x

### Backend
```bash
cd backend
npm install
cp .env.example .env.local
npx prisma generate && npx prisma migrate dev && npx prisma db seed
npm run start:dev
```
API: http://localhost:4000

### Admin Dashboard
```bash
cd admin
npm install
npm run dev
```
Dashboard: http://localhost:3001

### Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

### Test Credentials
- **Admin**: admin@freshcart.io / Password123!
- **Customer**: customer@freshcart.io / Password123!

---

## Implementation Roadmap

- **Phase 1: Architecture & System Blueprint** ✅ *Completed*
  - Business domain assumptions & perishables logic
  - Monorepo folder structure
  - Relational database schema & ERD
  - Complete REST API & WebSocket event specifications
  - Zero-trust authentication & security architecture
  - Customer mobile app & Admin dashboard navigation maps
- **Phase 2: Backend Core & Database Setup** ✅ *Completed*
  - NestJS framework initialization
  - Prisma schema with PostgreSQL migrations & initial seed data
  - Argon2id password hashing, JWT Access & Refresh token rotation
  - User and Address management modules
  - Docker Compose for PostgreSQL & backend development
- **Phase 3: Catalog & Inventory Management** ✅ *Completed*
  - Categories & Products CRUD with unit/discount calculations
  - Full-text search, filtering, and sorting
  - Inventory management with stock reservation & audit logs
  - S3 image upload integration
- **Phase 4: Flutter Customer App Foundation** ✅ *Completed*
  - Clean Architecture + Riverpod + GoRouter setup
  - Authentication screens (Login, Register, Forgot Password, OTP)
  - Home screen (Location selector, Banners, Categories, Products)
  - Product details & reactive Cart management
- **Phase 5: Checkout, Logistics & Payments** ✅ *Completed*
  - Delivery zones & time-slot selection
  - Coupon validation engine
  - Stripe SDK, Apple Pay, Google Pay, and PayPal checkout
  - Order creation and deterministic state progression
- **Phase 6: Notifications & Real-Time Tracking** ✅ *Completed*
  - Firebase Cloud Messaging (FCM) push notification engine
  - Real-time WebSocket order tracking & driver updates
  - Customer profile, order history, and re-order flow
- **Phase 7: Web-Based Admin Dashboard** ✅ *Completed*
  - Responsive Next.js 14 administration dashboard
  - Executive KPI metrics & charts
  - Product, category, inventory, order, coupon, and customer managers
- **Phase 8: Testing, Security & Quality Assurance** ✅ *Completed*
  - Unit and integration tests (NestJS, Flutter, Admin)
  - Security audit (Rate limiting, Helmet, CORS, DTO validation)
  - Performance tuning and query indexing
- **Phase 9: Production Deployment & Store Release** ✅ *Completed*
  - Production Docker builds & Nginx reverse proxy
  - Android APK/AAB build & Google Play release preparation
  - iOS IPA build & App Store Connect release preparation
  - Comprehensive operations manual (see DEPLOYMENT.md)

---

## Architectural Documentation

Full architectural blueprints are available in the [`docs/`](./docs/) directory:

- [Business Assumptions & Domain Model](./docs/BUSINESS_ASSUMPTIONS.md)
- [System Architecture & ADR](./docs/ARCHITECTURE.md)
- [Database ERD & Schema](./docs/DATABASE_ERD.md)
- [REST & WebSocket API Specification](./docs/API_DESIGN.md)
- [Authentication & Security Architecture](./docs/AUTH_SECURITY.md)
- [UI Navigation Map](./docs/UI_NAVIGATION_MAP.md)

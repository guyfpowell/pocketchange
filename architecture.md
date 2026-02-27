# PocketChange — Final Architecture

> Produced via Architect → Reviewer → Architect → Reviewer iteration (2 cycles).

---

## 1. External Libraries Chosen

### Backend

| Library | Purpose | Why Chosen | Status |
|---|---|---|---|
| `express` | HTTP server & routing | Industry standard, battle-tested, minimal overhead | Active, ~30M weekly downloads |
| `prisma` | ORM + migrations | Best TypeScript support in class; type-safe queries; migration system built-in; preferred over TypeORM | Active, ~4M weekly downloads |
| `passport` + `passport-local` | Authentication strategy | Flexible strategy pattern; pairs cleanly with JWT; no vendor lock-in | Active, well-maintained |
| `jsonwebtoken` | JWT signing/verification | Standard library for JWT; simple API | Active, 13M+ weekly downloads |
| `bcrypt` | Password hashing | Industry standard; time-tested; no custom crypto | Active |
| `ioredis` | Refresh token storage & revocation | Enables stateless JWT with server-side logout; prevents token reuse after logout | Active |
| `zod` | Schema validation (shared FE+BE) | TypeScript-first; composable schemas; eliminates dual validation logic | Active, 7M+ weekly downloads |
| `stripe` | Wallet top-up & payment processing | PCI-compliant; webhook support for confirmed payment before crediting wallet | Active, official SDK |
| `helmet` | HTTP security headers | Standard Express hardening; one-liner setup | Active |
| `express-rate-limit` | Rate limiting | Lightweight; protects auth endpoints; no infra required | Active |
| `winston` | Logging | Mature; configurable transports; structured JSON logging | Active |
| `cors` | CORS middleware | Standard Express CORS handling | Active |
| `dotenv` | Environment variable loading | Standard; zero-config | Active |

### Frontend

| Library | Purpose | Why Chosen | Status |
|---|---|---|---|
| `next` | React framework (web app) | SSR/SSG; file-based routing; great DX; production-ready | Active, Vercel-maintained |
| `@tanstack/react-query` | Server state management | Standard for async data fetching; caching; invalidation | Active, v5 |
| `zustand` | Client UI state | Minimal boilerplate; simpler than Redux for 3-role app | Active |
| `react-hook-form` | Form management | Performance (uncontrolled); minimal re-renders; integrates with Zod via `@hookform/resolvers` | Active |
| `zod` | Form schema validation | Shared with backend; single source of truth for schemas | Same as backend |
| `@chakra-ui/react` | UI component library | Accessible; TypeScript-native; themeable; production-ready | Active, v3 |
| `@tanstack/react-table` | Data tables (admin/vendor dashboards) | Headless; fully controlled; handles pagination/sorting | Active, v8 |
| `recharts` | Analytics charts (admin panel) | React-native; composable; well-maintained | Active |
| `react-qr-scanner` | QR code scanning (donor mobile) | Maintained; browser camera API wrapper | Active |
| `qrcode` | QR code image generation (vendor panel) | Simple; standard; generates PNG/SVG | Active |
| `axios` | HTTP client | Interceptors for auth token injection; better error handling than raw fetch | Active |

---

## 2. Custom Implementations (Justified)

| Component | Why Custom | Justification |
|---|---|---|
| Donation atomic transaction logic | No library handles domain-specific debit/credit across donor wallet → vendor balance | Uses Prisma `$transaction` (library primitive); business logic only |
| RBAC middleware | 3 roles (DONOR, VENDOR, ADMIN); CASL would add complexity without benefit | Simple `req.user.role` check; ≤20 lines |
| QR token single-use enforcement | Domain-specific: mark token `used=true` after scan | Simple DB flag; no library needed |
| Stripe webhook handler | Domain-specific wallet credit logic post-payment | Uses official `stripe.webhooks.constructEvent()` |

---

## 3. Folder Structure

```
pocketchange/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts              # Validated env vars (zod)
│   │   │   ├── passport.ts         # Passport strategies
│   │   │   └── redis.ts            # ioredis client
│   │   ├── middleware/
│   │   │   ├── authenticate.ts     # JWT verification middleware
│   │   │   ├── authorize.ts        # Role-check middleware
│   │   │   ├── validate.ts         # Zod schema middleware
│   │   │   └── errorHandler.ts     # Global Express error handler
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── users/
│   │   │   │   ├── users.routes.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   └── users.service.ts
│   │   │   ├── vendors/
│   │   │   │   ├── vendors.routes.ts
│   │   │   │   ├── vendors.controller.ts
│   │   │   │   └── vendors.service.ts
│   │   │   ├── donations/
│   │   │   │   ├── donations.routes.ts
│   │   │   │   ├── donations.controller.ts
│   │   │   │   └── donations.service.ts
│   │   │   ├── qrcodes/
│   │   │   │   ├── qrcodes.routes.ts
│   │   │   │   ├── qrcodes.controller.ts
│   │   │   │   └── qrcodes.service.ts
│   │   │   ├── admin/
│   │   │   │   ├── admin.routes.ts
│   │   │   │   ├── admin.controller.ts
│   │   │   │   └── admin.service.ts
│   │   │   └── webhooks/
│   │   │       └── stripe.webhook.ts
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (donor)/            # Donor pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── scan/
│   │   │   │   └── transactions/
│   │   │   ├── (vendor)/           # Vendor pages
│   │   │   │   ├── dashboard/
│   │   │   │   └── qrcodes/
│   │   │   ├── (admin)/            # Admin pages
│   │   │   │   ├── users/
│   │   │   │   ├── vendors/
│   │   │   │   └── analytics/
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       └── register/
│   │   ├── components/
│   │   │   ├── ui/                 # Chakra-based shared components
│   │   │   ├── donor/
│   │   │   ├── vendor/
│   │   │   └── admin/
│   │   ├── hooks/                  # Custom React Query hooks
│   │   ├── store/                  # Zustand stores
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios instance
│   │   │   └── schemas.ts          # Shared Zod schemas (symlinked from shared/)
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
│
└── shared/
    └── schemas/                    # Zod schemas shared between FE and BE
        ├── auth.schema.ts
        ├── donation.schema.ts
        └── vendor.schema.ts
```

---

## 4. Database Design (Prisma Schema)

```prisma
enum Role {
  DONOR
  VENDOR
  ADMIN
}

enum VendorType {
  HOSTEL
  FOOD_SHOP
}

enum TransactionType {
  WALLET_TOPUP    // Stripe payment credited to donor wallet
  DONATION        // Donor → Vendor transfer
  CREDIT          // Vendor receives donation credit
}

model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String
  passwordHash  String
  role          Role          @default(DONOR)
  walletBalance Decimal       @default(0) @db.Decimal(12, 2)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  vendor        Vendor?
  donationsSent Donation[]    @relation("DonorDonations")
  transactions  Transaction[]
}

model Vendor {
  id           String      @id @default(cuid())
  userId       String      @unique
  businessName String
  type         VendorType
  approved     Boolean     @default(false)
  balance      Decimal     @default(0) @db.Decimal(12, 2)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  user         User        @relation(fields: [userId], references: [id])
  donations    Donation[]
  qrCodes      QRCode[]
  transactions Transaction[]
}

model QRCode {
  id        String    @id @default(cuid())
  vendorId  String
  token     String    @unique @default(cuid())
  used      Boolean   @default(false)
  expiresAt DateTime?
  createdAt DateTime  @default(now())

  vendor    Vendor    @relation(fields: [vendorId], references: [id])
  donation  Donation?
}

model Donation {
  id        String   @id @default(cuid())
  donorId   String
  vendorId  String
  qrCodeId  String   @unique
  amount    Decimal  @db.Decimal(12, 2)
  createdAt DateTime @default(now())

  donor     User     @relation("DonorDonations", fields: [donorId], references: [id])
  vendor    Vendor   @relation(fields: [vendorId], references: [id])
  qrCode    QRCode   @relation(fields: [qrCodeId], references: [id])
}

model Transaction {
  id          String          @id @default(cuid())
  userId      String?
  vendorId    String?
  amount      Decimal         @db.Decimal(12, 2)
  type        TransactionType
  referenceId String?         // Stripe payment intent ID or Donation ID
  createdAt   DateTime        @default(now())

  user        User?           @relation(fields: [userId], references: [id])
  vendor      Vendor?         @relation(fields: [vendorId], references: [id])
}
```

---

## 5. API Endpoints

### Auth — `/api/auth`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register donor or vendor | Public |
| POST | `/login` | Login, returns access + refresh tokens | Public |
| POST | `/logout` | Invalidate refresh token (Redis delete) | Bearer |
| POST | `/refresh` | Exchange refresh token for new access token | Refresh token |

### Users (Donors) — `/api/users`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/me` | Get own profile | DONOR |
| PUT | `/me` | Update profile | DONOR |
| GET | `/me/wallet` | Get wallet balance | DONOR |
| POST | `/me/wallet/topup` | Create Stripe payment intent for top-up | DONOR |
| GET | `/me/transactions` | List own transactions (paginated) | DONOR |

### Donations — `/api/donations`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/scan` | Scan QR token, donate amount; atomic debit/credit | DONOR |

### Vendors — `/api/vendors`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/me` | Get own vendor profile | VENDOR |
| PUT | `/me` | Update vendor profile | VENDOR |
| GET | `/me/balance` | Get current credit balance | VENDOR |
| GET | `/me/transactions` | List transactions (paginated) | VENDOR |
| GET | `/me/qrcodes` | List QR codes | VENDOR |
| POST | `/me/qrcodes` | Generate new QR code | VENDOR (approved only) |

### Admin — `/api/admin`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/users` | List all users (paginated, filterable) | ADMIN |
| PUT | `/users/:id` | Update user | ADMIN |
| DELETE | `/users/:id` | Deactivate user | ADMIN |
| GET | `/vendors` | List all vendors (paginated) | ADMIN |
| PUT | `/vendors/:id/approve` | Approve vendor | ADMIN |
| PUT | `/vendors/:id/reject` | Reject vendor | ADMIN |
| GET | `/donations` | List all donations | ADMIN |
| GET | `/analytics` | Aggregate stats (totals, by vendor type, over time) | ADMIN |

### Webhooks — `/api/webhooks`

| Method | Path | Description |
|---|---|---|
| POST | `/stripe` | Stripe payment confirmation → credit donor wallet |

---

## 6. Authentication & Authorization Flow

### Registration & Login

```
POST /api/auth/register
  → Zod validates body
  → bcrypt hashes password
  → Prisma creates User (role=DONOR or VENDOR)
  → If VENDOR: creates Vendor record (approved=false)
  → Returns 201

POST /api/auth/login
  → Passport local strategy validates email/password
  → Signs accessToken (15min expiry) with jsonwebtoken
  → Signs refreshToken (7d expiry) with jsonwebtoken
  → Stores refreshToken hash in Redis with TTL
  → Returns { accessToken, refreshToken }
```

### Protected Requests

```
Client → Authorization: Bearer <accessToken>
  → authenticate middleware: jsonwebtoken.verify()
  → Attaches req.user = { id, role }
  → authorize middleware: checks req.user.role against allowed roles
  → Handler proceeds
```

### Token Refresh

```
POST /api/auth/refresh
  → Validates refreshToken signature
  → Checks token exists in Redis (not revoked)
  → Issues new accessToken
  → Optionally rotates refreshToken (deletes old, stores new)
```

### Logout

```
POST /api/auth/logout
  → Deletes refreshToken from Redis
  → AccessToken expires naturally (15min max)
```

### Role Matrix

| Resource | DONOR | VENDOR | ADMIN |
|---|---|---|---|
| Own profile | R/W | R/W | R/W |
| Wallet top-up | ✓ | — | — |
| Scan & donate | ✓ | — | — |
| Own transactions | ✓ | ✓ | ✓ |
| Generate QR codes | — | ✓ (approved) | — |
| Vendor balance | — | ✓ | ✓ |
| Manage all users | — | — | ✓ |
| Approve vendors | — | — | ✓ |
| Analytics | — | — | ✓ |

---

## 7. Donation Flow (Atomic)

```
1. Vendor generates QR code
   POST /api/vendors/me/qrcodes
   → Creates QRCode { token: cuid(), used: false }
   → Frontend renders QR image via `qrcode` library

2. Donor scans QR
   POST /api/donations/scan { token, amount }
   → Validates token exists, used=false, vendor is approved
   → Validates donor walletBalance >= amount
   → Prisma $transaction (atomic):
       a. Update User.walletBalance -= amount  (with WHERE balance >= amount guard)
       b. Update Vendor.balance += amount
       c. Update QRCode.used = true
       d. Create Donation record
       e. Create Transaction (DONATION) for donor
       f. Create Transaction (CREDIT) for vendor
   → On success: return confirmation
   → On failure (e.g. insufficient balance): rollback, return 400
```

---

## 8. Wallet Top-Up Flow (Stripe)

```
1. Donor requests top-up
   POST /api/users/me/wallet/topup { amount }
   → Creates Stripe PaymentIntent
   → Returns { clientSecret } to frontend

2. Frontend completes payment
   → Stripe.js handles card input and confirmation
   → Stripe calls POST /api/webhooks/stripe on success

3. Webhook handler
   → stripe.webhooks.constructEvent() verifies signature
   → On payment_intent.succeeded:
       → Prisma: User.walletBalance += amount
       → Create Transaction (WALLET_TOPUP)
```

---

## 9. Reviewer Sign-Off (Round 2)

**Anti-Reinvention Check — PASSED**

| Concern | Resolution |
|---|---|
| Refresh token revocation | ioredis stores tokens server-side |
| Stripe webhook confirmation | Stripe SDK `constructEvent` + webhook handler |
| Wallet race conditions | Prisma `$transaction` with balance guard on UPDATE |
| QR single-use | DB `used` flag flipped atomically inside same `$transaction` |
| RBAC | Simple role middleware; CASL correctly ruled out for 3 roles |
| Validation | Zod shared across FE and BE; no duplicate schemas |

**Library Quality — PASSED**: All libraries actively maintained, TypeScript-native, widely adopted.

**Custom Code — MINIMAL**: Only business-logic-specific code is custom; all infrastructure uses libraries.

---

## 10. Implementation Order

1. Backend: Prisma schema + migrations
2. Backend: Auth module (register, login, refresh, logout)
3. Backend: Users module (profile, wallet)
4. Backend: Stripe webhook + wallet top-up
5. Backend: Vendors module + QR code generation
6. Backend: Donations scan endpoint (atomic transaction)
7. Backend: Admin module + analytics
8. Frontend: Auth pages (login, register)
9. Frontend: Donor dashboard (wallet, scan, history)
10. Frontend: Vendor dashboard (balance, QR management)
11. Frontend: Admin panel (users, vendors, analytics)

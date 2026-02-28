# PocketChange — Chunking Plan

> Each chunk is one conversation session, sized for a ~40k token window.
> Token budget per chunk: ~8k context reads + ~20k generation + ~5k overhead = ~33k used.
> Every chunk ends: save all files → update README → update chunking.md → commit → push.

> **Standing instruction (repeat at end of every chunk):**
> After completing each chunk, update this file:
> 1. Mark the completed chunk header with ✅ and add "DONE" status
> 2. Add the actual git commit hash to the chunk's "Commit:" line
> 3. Note any deviations from the plan (different approach taken, files skipped, extra files added)
> 4. Update the Summary table at the bottom
> 5. Update "Total remaining" count

---

## Chunk 1 — DONE ✅

**Delivered:**
- Monorepo + npm workspaces
- Docker Compose (Postgres + Redis)
- Prisma schema + migration
- Express skeleton (`app.ts`)
- `backend/src/config/env.ts` — Zod env validation
- `backend/src/config/jwt.ts` — sign/verify helpers
- `backend/src/middleware/` — authenticate, authorize, validate, errorHandler
- `backend/src/types/express.d.ts` — `req.user` type extension
- `backend/.env.example`

**Commit:** `e5082bd`

---

## Chunk 2 — Auth Module + Redis ✅ DONE

**Commit:** `1a938c0`

**Delivered:**
- `backend/src/config/redis.ts` — ioredis client (lazy connect), storeRefreshToken/getRefreshToken/deleteRefreshToken
- `shared/src/schemas/auth.schema.ts` — registerSchema, loginSchema, refreshSchema + inferred types
- `shared/src/index.ts` — re-exports all schemas; built to dist
- `backend/src/modules/auth/auth.service.ts` — register, login, refresh, logout
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.routes.ts` — POST /register /login /refresh /logout
- `backend/src/app.ts` — removed placeholder `/api/users`, mounted authRouter
- `@pocketchange/shared` added as workspace dependency in backend

**Deviations from plan:**
- Refresh tokens implemented as **JWT + Redis revocation flag** (not opaque bcrypt hash). Reason: bcrypt has a 72-byte input limit; refresh JWTs exceed this. Redis stores `"1"` at `refresh:<userId>` as a revocation key — logout deletes it, refresh checks for its existence. Functionally equivalent but simpler.
- `refreshSchema` added to shared schemas (not in original plan) — needed for validate() middleware on /refresh route.
- `shared/src/schemas/` path used (not `shared/schemas/` as listed in scafolding.md).

**Goal:** Full auth flow: register, login, logout, refresh.

**Files to read at session start:**
- `backend/src/config/env.ts`
- `backend/src/config/jwt.ts`
- `backend/src/middleware/authenticate.ts`
- `backend/src/app.ts`
- `backend/prisma/schema.prisma`

**Files to create:**
| File | Description |
|---|---|
| `backend/src/config/redis.ts` | ioredis client + `storeRefreshToken`, `getRefreshToken`, `deleteRefreshToken` |
| `shared/schemas/auth.schema.ts` | `registerSchema`, `loginSchema` + inferred types |
| `backend/src/modules/auth/auth.service.ts` | `register()`, `login()`, `logout()`, `refresh()` |
| `backend/src/modules/auth/auth.controller.ts` | calls service, returns JSON |
| `backend/src/modules/auth/auth.routes.ts` | POST `/register`, `/login`, `/logout`, `/refresh` |

**Files to update:**
- `backend/src/app.ts` — mount `/api/auth` router

**Key implementation notes:**
- Refresh tokens: `crypto.randomBytes(40).toString('hex')`, store bcrypt hash in Redis under `refresh:<userId>`
- Access token: 15m expiry; refresh token: 7d expiry
- Login returns `{ accessToken, refreshToken }`
- Generic error message: `'Invalid credentials'` for both wrong email and wrong password
- `refresh()` checks Redis for stored hash, bcrypt compares, issues new accessToken

**Verification:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"password123","name":"Test User","role":"DONOR"}'
# → 201 { message: "Registered" }

curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"password123"}'
# → 200 { accessToken, refreshToken }
```

**Session prompt:**
```
Continue PocketChange backend. Read: backend/src/config/env.ts, jwt.ts, middleware/authenticate.ts, app.ts, prisma/schema.prisma.

Implement Chunk 2 — Auth Module:
- backend/src/config/redis.ts (ioredis + storeRefreshToken/getRefreshToken/deleteRefreshToken)
- shared/schemas/auth.schema.ts (registerSchema, loginSchema)
- backend/src/modules/auth/auth.service.ts (register, login, logout, refresh)
- backend/src/modules/auth/auth.controller.ts
- backend/src/modules/auth/auth.routes.ts (POST /register /login /logout /refresh)
- Update app.ts to mount /api/auth

Refresh tokens = crypto.randomBytes(40).hex, stored as bcrypt hash in Redis under refresh:<userId>.
No any types. No TODOs. Full file contents. Then update README, commit, push.
```

---

## Chunk 3 — Users Module

**Goal:** Donor profile, wallet balance, wallet top-up, transaction history.

**Files to read at session start:**
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/middleware/authenticate.ts`
- `backend/src/middleware/authorize.ts`
- `backend/prisma/schema.prisma`
- `backend/src/app.ts`

**Files to create:**
| File | Description |
|---|---|
| `shared/schemas/vendor.schema.ts` | `topUpSchema` (amount: positive number) — partial, rest added in Chunk 4 |
| `backend/src/modules/users/users.service.ts` | `getProfile()`, `updateProfile()`, `getWallet()`, `createTopUpIntent()`, `getTransactions()` |
| `backend/src/modules/users/users.controller.ts` | calls service, returns JSON |
| `backend/src/modules/users/users.routes.ts` | GET/PUT `/me`, GET `/me/wallet`, POST `/me/wallet/topup`, GET `/me/transactions` |

**Files to update:**
- `backend/src/app.ts` — mount `/api/users`

**Key implementation notes:**
- All routes require `authenticate` middleware
- All routes require `authorize(UserRole.DONOR)`
- `createTopUpIntent()` creates a Stripe PaymentIntent and returns `{ clientSecret }`
- `getTransactions()` accepts `?page=1&limit=20` query params

**Verification:**
```bash
# Login first to get token, then:
curl -H 'Authorization: Bearer <token>' http://localhost:4000/api/users/me
# → 200 { id, email, name, role, walletBalance }

curl -H 'Authorization: Bearer <token>' http://localhost:4000/api/users/me/wallet
# → 200 { walletBalance: 0 }
```

**Session prompt:**
```
Continue PocketChange backend. Read: backend/src/modules/auth/auth.service.ts, middleware/authenticate.ts, middleware/authorize.ts, prisma/schema.prisma, backend/src/app.ts.

Implement Chunk 3 — Users Module:
- shared/schemas/vendor.schema.ts (topUpSchema only for now)
- backend/src/modules/users/users.service.ts (getProfile, updateProfile, getWallet, createTopUpIntent via Stripe, getTransactions paginated)
- backend/src/modules/users/users.controller.ts
- backend/src/modules/users/users.routes.ts (GET/PUT /me, GET /me/wallet, POST /me/wallet/topup, GET /me/transactions)
- Update app.ts to mount /api/users

All routes: authenticate + authorize(DONOR). No any types. Full file contents. Update README, commit, push.
```

---

## Chunk 4 — Vendors + QR Codes Modules

**Goal:** Vendor profile management and QR code generation.

**Files to read at session start:**
- `shared/schemas/vendor.schema.ts`
- `backend/src/middleware/authenticate.ts`
- `backend/src/middleware/authorize.ts`
- `backend/prisma/schema.prisma`
- `backend/src/app.ts`

**Files to create:**
| File | Description |
|---|---|
| `shared/schemas/vendor.schema.ts` | Add `createVendorSchema`, `updateVendorSchema` (extend existing file) |
| `backend/src/modules/vendors/vendors.service.ts` | `getVendorProfile()`, `updateVendorProfile()`, `getBalance()`, `getTransactions()` |
| `backend/src/modules/vendors/vendors.controller.ts` | calls service, returns JSON |
| `backend/src/modules/vendors/vendors.routes.ts` | GET/PUT `/me`, GET `/me/balance`, GET `/me/transactions` |
| `backend/src/modules/qrcodes/qrcodes.service.ts` | `listQRCodes()`, `generateQRCode()` |
| `backend/src/modules/qrcodes/qrcodes.controller.ts` | calls service, returns JSON |
| `backend/src/modules/qrcodes/qrcodes.routes.ts` | GET/POST `/me/qrcodes` (on vendor router) |

**Files to update:**
- `backend/src/app.ts` — mount `/api/vendors`

**Key implementation notes:**
- All vendor routes require `authorize(UserRole.VENDOR)`
- `generateQRCode()` only works if `vendor.approved === true`, else throw 403
- QR code token generated with `crypto.randomUUID()`
- QR routes nested under vendor router at `/me/qrcodes`

**Verification:**
```bash
# Register as VENDOR, login, then:
curl -H 'Authorization: Bearer <token>' http://localhost:4000/api/vendors/me
# → 200 vendor profile (or 404 if no vendor record yet)
```

**Session prompt:**
```
Continue PocketChange backend. Read: shared/schemas/vendor.schema.ts, middleware/authenticate.ts, middleware/authorize.ts, prisma/schema.prisma, backend/src/app.ts.

Implement Chunk 4 — Vendors + QR Codes:
- shared/schemas/vendor.schema.ts — add createVendorSchema, updateVendorSchema
- backend/src/modules/vendors/vendors.service.ts (getVendorProfile, updateVendorProfile, getBalance, getTransactions)
- backend/src/modules/vendors/vendors.controller.ts
- backend/src/modules/vendors/vendors.routes.ts (GET/PUT /me, GET /me/balance, GET /me/transactions, nested QR routes)
- backend/src/modules/qrcodes/qrcodes.service.ts (listQRCodes, generateQRCode — approved vendors only)
- backend/src/modules/qrcodes/qrcodes.controller.ts
- backend/src/modules/qrcodes/qrcodes.routes.ts
- Update app.ts to mount /api/vendors

All vendor routes: authenticate + authorize(VENDOR). No any types. Full file contents. Update README, commit, push.
```

---

## Chunk 5 — Donations + Stripe Webhook

**Goal:** Atomic donation scan flow and Stripe webhook for wallet top-ups.

**Files to read at session start:**
- `backend/prisma/schema.prisma`
- `backend/src/middleware/authenticate.ts`
- `backend/src/middleware/authorize.ts`
- `backend/src/config/env.ts`
- `backend/src/app.ts`

**Files to create:**
| File | Description |
|---|---|
| `shared/schemas/donation.schema.ts` | `scanDonationSchema` — `{ token: string, amount: positive }` |
| `backend/src/modules/donations/donations.service.ts` | `scanAndDonate()` — full atomic Prisma `$transaction` |
| `backend/src/modules/donations/donations.controller.ts` | calls service, returns JSON |
| `backend/src/modules/donations/donations.routes.ts` | POST `/scan` |
| `backend/src/modules/webhooks/stripe.webhook.ts` | Stripe `payment_intent.succeeded` → credit wallet |

**Files to update:**
- `backend/src/app.ts` — mount `/api/donations` and Stripe webhook (raw body already set up)

**Key implementation notes:**
- `scanAndDonate()` uses `prisma.$transaction(async (tx) => { ... })` with 6 steps:
  1. `tx.qRCode.findUnique()` — validate token exists, not used, vendor approved
  2. `tx.user.updateMany({ where: { id, walletBalance: { gte: amount } } })` — count=0 means insufficient funds
  3. `tx.vendor.update()` — credit balance
  4. `tx.qRCode.update({ used: true })`
  5. `tx.donation.create()`
  6. Two `tx.transaction.create()` — DONATION + CREDIT
- Webhook: `stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.STRIPE_WEBHOOK_SECRET)`
- Webhook mounted BEFORE `express.json()` in app.ts (already handled)

**Verification:**
```bash
# Generate a QR code as vendor (approve vendor in DB first), then as donor:
curl -X POST http://localhost:4000/api/donations/scan \
  -H 'Authorization: Bearer <donor-token>' \
  -H 'Content-Type: application/json' \
  -d '{"token":"<qr-token>","amount":5}'
# → 400 if insufficient wallet balance
# → 200 { message: "Donation successful" } if balance OK
```

**Session prompt:**
```
Continue PocketChange backend. Read: prisma/schema.prisma, middleware/authenticate.ts, middleware/authorize.ts, config/env.ts, backend/src/app.ts.

Implement Chunk 5 — Donations + Stripe Webhook:
- shared/schemas/donation.schema.ts (scanDonationSchema)
- backend/src/modules/donations/donations.service.ts (scanAndDonate — atomic prisma.$transaction, updateMany for wallet debit guard)
- backend/src/modules/donations/donations.controller.ts
- backend/src/modules/donations/donations.routes.ts (POST /scan, authenticate + authorize(DONOR))
- backend/src/modules/webhooks/stripe.webhook.ts (constructEvent, payment_intent.succeeded → User.walletBalance += amount + Transaction(WALLET_TOPUP))
- Update app.ts to mount /api/donations and webhook router

Atomic transaction: 6 steps, updateMany for wallet debit (count=0 = insufficient funds). No any types. Full file contents. Update README, commit, push.
```

---

## Chunk 6 — Admin Module + Jest Tests

**Goal:** Admin CRUD + analytics endpoints, plus full Jest unit test suite.

**Files to read at session start:**
- `backend/prisma/schema.prisma`
- `backend/src/middleware/authenticate.ts`
- `backend/src/middleware/authorize.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/donations/donations.service.ts`
- `backend/src/app.ts`

**Files to create:**
| File | Description |
|---|---|
| `backend/src/modules/admin/admin.service.ts` | `listUsers()`, `updateUser()`, `deactivateUser()`, `listVendors()`, `approveVendor()`, `rejectVendor()`, `listDonations()`, `getAnalytics()` |
| `backend/src/modules/admin/admin.controller.ts` | calls service, returns JSON |
| `backend/src/modules/admin/admin.routes.ts` | Full admin route set (all under `authorize(ADMIN)`) |
| `backend/jest.config.ts` | ts-jest, moduleNameMapper for `@pocketchange/shared` |
| `backend/__tests__/singleton.ts` | `jest-mock-extended` mockDeep PrismaClient setup |
| `backend/__tests__/auth.service.test.ts` | register, login, logout, refresh (mock Prisma + Redis) |
| `backend/__tests__/donations.service.test.ts` | scan success, insufficient balance, used QR, unapproved vendor |
| `backend/__tests__/users.service.test.ts` | getWallet, createTopUpIntent (mock Stripe), getTransactions |

**Files to update:**
- `backend/src/app.ts` — mount `/api/admin`, add 404 handler before errorHandler
- `backend/package.json` — add `jest-mock-extended` dev dependency

**Key implementation notes:**
- `getAnalytics()`: total donations count/sum, breakdown by vendor type, donations over time (last 30 days grouped by day) — use Prisma `groupBy`
- All admin routes: `authenticate` + `authorize(UserRole.ADMIN)`
- Tests use `jest.mock('../src/lib/prisma')` with `mockDeep<PrismaClient>()`
- `moduleNameMapper`: `'^@pocketchange/shared/(.*)$': '<rootDir>/../shared/src/$1'`

**Verification:**
```bash
npm test --workspace=backend
# All test suites pass
```

**Session prompt:**
```
Continue PocketChange backend. Read: prisma/schema.prisma, middleware/authenticate.ts, middleware/authorize.ts, modules/auth/auth.service.ts, modules/donations/donations.service.ts, backend/src/app.ts.

Implement Chunk 6 — Admin Module + Jest Tests:
- backend/src/modules/admin/admin.service.ts (listUsers, updateUser, deactivateUser, listVendors, approveVendor, rejectVendor, listDonations, getAnalytics with Prisma groupBy)
- backend/src/modules/admin/admin.controller.ts
- backend/src/modules/admin/admin.routes.ts (all routes authorize(ADMIN))
- backend/jest.config.ts (ts-jest, moduleNameMapper for @pocketchange/shared)
- backend/__tests__/singleton.ts (jest-mock-extended mockDeep PrismaClient)
- backend/__tests__/auth.service.test.ts (register, login, logout, refresh)
- backend/__tests__/donations.service.test.ts (scan success, insufficient balance, used QR, unapproved vendor)
- backend/__tests__/users.service.test.ts (getWallet, topUp, getTransactions)
- Update app.ts: mount /api/admin, add 404 handler

Run npm test --workspace=backend, fix any failures. No any types. Update README, commit, push.
```

---

## Chunk 7 — Frontend Bootstrap + Auth Pages

**Goal:** Next.js setup, providers, Axios client, Zustand auth store, login and register pages.

**Files to read at session start:**
- `shared/schemas/auth.schema.ts`
- `backend/src/app.ts` (to confirm API routes)

**Files to create:**
| File | Description |
|---|---|
| `frontend/package.json` | Next.js 15, Chakra UI, TanStack Query, Zustand, react-hook-form, axios |
| `frontend/tsconfig.json` | Next.js defaults + shared reference + path alias |
| `frontend/next.config.ts` | Transpile `@pocketchange/shared` |
| `frontend/.env.local.example` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| `frontend/src/app/layout.tsx` | Root layout with `<Providers>` |
| `frontend/src/app/providers.tsx` | `'use client'` — ChakraProvider + QueryClientProvider |
| `frontend/src/app/page.tsx` | Redirect based on auth state |
| `frontend/src/lib/api.ts` | Axios instance, Bearer interceptor, 401 → refresh → retry |
| `frontend/src/store/auth.store.ts` | Zustand: `user`, `accessToken`, `refreshToken`, `setAuth`, `clearAuth` with localStorage |
| `frontend/src/types/index.ts` | `User`, `Vendor`, `Transaction`, `Donation` TS interfaces |
| `frontend/src/hooks/useAuth.ts` | `useLogin`, `useRegister`, `useLogout` (TanStack Query mutations) |
| `frontend/src/app/auth/login/page.tsx` | React Hook Form + Zod, POST `/auth/login` |
| `frontend/src/app/auth/register/page.tsx` | Register form with DONOR/VENDOR role selector |

**Key implementation notes:**
- Chakra UI v2 (`@chakra-ui/react`, no separate next-js package needed in v2)
- Axios response interceptor: on 401, try `POST /auth/refresh` with `refreshToken` from Zustand store; on success retry; on failure `clearAuth()` + redirect
- `api.ts` request interceptor: inject `Authorization: Bearer <accessToken>` from store

**Verification:**
```bash
npm run dev --workspace=frontend
# http://localhost:3000 → redirects to /auth/login
# Register form submits → API call → redirect to /donor/dashboard
# Login form submits → stores tokens in Zustand
```

**Session prompt:**
```
Continue PocketChange. Read: shared/schemas/auth.schema.ts, backend/src/app.ts.

Implement Chunk 7 — Frontend Bootstrap + Auth Pages:
- frontend/package.json (Next.js 15, Chakra UI v2, TanStack Query v5, Zustand, react-hook-form, @hookform/resolvers, axios, zod)
- frontend/tsconfig.json, next.config.ts, .env.local.example
- frontend/src/app/layout.tsx, providers.tsx (ChakraProvider + QueryClientProvider), page.tsx (auth redirect)
- frontend/src/lib/api.ts (Axios instance, Bearer interceptor, 401 refresh-retry interceptor)
- frontend/src/store/auth.store.ts (Zustand with localStorage persistence)
- frontend/src/types/index.ts (User, Vendor, Transaction, Donation interfaces)
- frontend/src/hooks/useAuth.ts (useLogin, useRegister, useLogout mutations)
- frontend/src/app/auth/login/page.tsx (React Hook Form + Zod)
- frontend/src/app/auth/register/page.tsx (with DONOR/VENDOR role selector)

No any types. Full file contents. Update README, commit, push.
```

---

## Chunk 8 — Frontend Donor Dashboard

**Goal:** Wallet display, top-up modal (Stripe), QR scanner, transaction history.

**Files to read at session start:**
- `frontend/src/lib/api.ts`
- `frontend/src/store/auth.store.ts`
- `frontend/src/types/index.ts`
- `frontend/src/hooks/useAuth.ts`

**Files to create:**
| File | Description |
|---|---|
| `frontend/src/app/(donor)/layout.tsx` | Donor sidebar nav (wallet, scan, transactions) |
| `frontend/src/app/(donor)/dashboard/page.tsx` | WalletCard + TopUpModal |
| `frontend/src/app/(donor)/scan/page.tsx` | `@yudiel/react-qr-scanner` → POST `/donations/scan` |
| `frontend/src/app/(donor)/transactions/page.tsx` | Paginated transaction list |
| `frontend/src/components/donor/WalletCard.tsx` | Wallet balance display + top-up trigger |
| `frontend/src/components/donor/TopUpModal.tsx` | Stripe.js Elements payment form |
| `frontend/src/components/donor/TransactionTable.tsx` | TanStack Table for transactions |
| `frontend/src/hooks/useWallet.ts` | `useWalletBalance`, `useCreateTopUp` (TanStack Query) |
| `frontend/src/hooks/useTransactions.ts` | Paginated `useTransactions` query |

**Key implementation notes:**
- Scan page: decode QR → prompt amount → POST `/api/donations/scan`
- TopUpModal: POST `/api/users/me/wallet/topup` → get `clientSecret` → Stripe Elements
- All donor pages: redirect to `/auth/login` if no `accessToken` in store
- Add `@yudiel/react-qr-scanner` and `@stripe/react-stripe-js` to frontend deps

**Verification:**
```bash
# Visit http://localhost:3000/donor/dashboard
# Wallet balance shows 0
# Top-up opens Stripe modal
# Scan page activates camera
```

**Session prompt:**
```
Continue PocketChange frontend. Read: frontend/src/lib/api.ts, store/auth.store.ts, types/index.ts, hooks/useAuth.ts.

Implement Chunk 8 — Donor Dashboard:
- frontend/src/app/(donor)/layout.tsx (sidebar nav)
- frontend/src/app/(donor)/dashboard/page.tsx (WalletCard + TopUpModal)
- frontend/src/app/(donor)/scan/page.tsx (@yudiel/react-qr-scanner → POST /donations/scan)
- frontend/src/app/(donor)/transactions/page.tsx (paginated list)
- frontend/src/components/donor/WalletCard.tsx, TopUpModal.tsx (Stripe Elements), TransactionTable.tsx (TanStack Table)
- frontend/src/hooks/useWallet.ts (useWalletBalance, useCreateTopUp)
- frontend/src/hooks/useTransactions.ts (paginated)

Add @yudiel/react-qr-scanner and @stripe/react-stripe-js to frontend/package.json. No any types. Full file contents. Update README, commit, push.
```

---

## Chunk 9 — Frontend Vendor Dashboard

**Goal:** Vendor balance, transaction history, QR code list and generation.

**Files to read at session start:**
- `frontend/src/lib/api.ts`
- `frontend/src/store/auth.store.ts`
- `frontend/src/types/index.ts`
- `frontend/src/app/(donor)/layout.tsx` (pattern reference)

**Files to create:**
| File | Description |
|---|---|
| `frontend/src/app/(vendor)/layout.tsx` | Vendor sidebar nav (dashboard, QR codes) |
| `frontend/src/app/(vendor)/dashboard/page.tsx` | BalanceCard + recent transactions |
| `frontend/src/app/(vendor)/qrcodes/page.tsx` | QRCodeCard grid + generate button |
| `frontend/src/components/vendor/BalanceCard.tsx` | Balance display |
| `frontend/src/components/vendor/QRCodeCard.tsx` | QR code display via `qrcode` lib |
| `frontend/src/hooks/useVendor.ts` | `useVendorProfile`, `useVendorBalance`, `useQRCodes`, `useGenerateQRCode` |

**Key implementation notes:**
- QR code image: `qrcode` npm package → `toDataURL()` → render as `<img>`
- Generate button: disabled if vendor `approved === false`, show pending message
- Add `qrcode` and `@types/qrcode` to frontend deps

**Verification:**
```bash
# Login as approved vendor
# http://localhost:3000/vendor/dashboard → shows balance
# http://localhost:3000/vendor/qrcodes → generate QR → QR image appears
```

**Session prompt:**
```
Continue PocketChange frontend. Read: frontend/src/lib/api.ts, store/auth.store.ts, types/index.ts, app/(donor)/layout.tsx.

Implement Chunk 9 — Vendor Dashboard:
- frontend/src/app/(vendor)/layout.tsx (sidebar nav)
- frontend/src/app/(vendor)/dashboard/page.tsx (BalanceCard + transactions)
- frontend/src/app/(vendor)/qrcodes/page.tsx (QRCodeCard grid + generate button, disabled if not approved)
- frontend/src/components/vendor/BalanceCard.tsx
- frontend/src/components/vendor/QRCodeCard.tsx (qrcode lib toDataURL → img)
- frontend/src/hooks/useVendor.ts (useVendorProfile, useVendorBalance, useQRCodes, useGenerateQRCode)

Add qrcode + @types/qrcode to frontend/package.json. No any types. Full file contents. Update README, commit, push.
```

---

## Chunk 10 — Frontend Admin Panel + Final Polish

**Goal:** Admin user/vendor management tables and analytics charts. Complete project.

**Files to read at session start:**
- `frontend/src/lib/api.ts`
- `frontend/src/store/auth.store.ts`
- `frontend/src/types/index.ts`
- `frontend/src/app/(donor)/layout.tsx` (pattern reference)

**Files to create:**
| File | Description |
|---|---|
| `frontend/src/app/(admin)/layout.tsx` | Admin sidebar nav (users, vendors, analytics) |
| `frontend/src/app/(admin)/users/page.tsx` | UserTable with TanStack Table, paginated |
| `frontend/src/app/(admin)/vendors/page.tsx` | VendorTable with approve/reject buttons |
| `frontend/src/app/(admin)/analytics/page.tsx` | Recharts: donations over time + by vendor type |
| `frontend/src/components/admin/UserTable.tsx` | TanStack Table for users |
| `frontend/src/components/admin/VendorTable.tsx` | TanStack Table with approve/reject actions |
| `frontend/src/components/admin/AnalyticsCharts.tsx` | Recharts LineChart + PieChart |
| `frontend/src/hooks/useAdmin.ts` | All admin queries + mutations |

**Key implementation notes:**
- Add `recharts` to frontend deps
- VendorTable approve/reject: `PUT /api/admin/vendors/:id/approve` and `/reject`
- Analytics charts: LineChart for donations over time, PieChart for by vendor type
- All admin pages: redirect to `/auth/login` if not ADMIN role

**Final README update:** Mark all items complete, add full setup guide, update roadmap.

**Verification:**
```bash
# Full end-to-end:
docker compose up -d
npm run dev --workspace=backend   # :4000
npm run dev --workspace=frontend  # :3000
npm test --workspace=backend      # all pass

# Register donor → top-up wallet → scan QR → donate
# Admin panel → approve vendor → analytics charts render
```

**Session prompt:**
```
Continue PocketChange frontend — final chunk. Read: frontend/src/lib/api.ts, store/auth.store.ts, types/index.ts, app/(donor)/layout.tsx.

Implement Chunk 10 — Admin Panel + Final Polish:
- frontend/src/app/(admin)/layout.tsx (sidebar nav)
- frontend/src/app/(admin)/users/page.tsx (UserTable, TanStack Table, paginated)
- frontend/src/app/(admin)/vendors/page.tsx (VendorTable, approve/reject buttons)
- frontend/src/app/(admin)/analytics/page.tsx (Recharts LineChart + PieChart)
- frontend/src/components/admin/UserTable.tsx, VendorTable.tsx, AnalyticsCharts.tsx
- frontend/src/hooks/useAdmin.ts (all admin queries + mutations)

Add recharts to frontend/package.json. No any types. Full file contents.
Final README: mark full roadmap complete, update setup guide. Commit, push.
```

---

## Summary

| Chunk | Scope | Key files | Status |
|---|---|---|---|
| 1 | Monorepo, Docker, Prisma, Config, Middleware | env.ts, jwt.ts, middleware/* | ✅ Done `e5082bd` |
| 2 | Auth module + Redis | redis.ts, auth.service/controller/routes | ✅ Done `1a938c0` |
| 3 | Users module | users.service/controller/routes | ⬜ |
| 4 | Vendors + QR Codes | vendors.*, qrcodes.* | ⬜ |
| 5 | Donations + Stripe webhook | donations.*, stripe.webhook.ts | ⬜ |
| 6 | Admin module + Jest tests | admin.*, __tests__/* | ⬜ |
| 7a | Brand setup: Tailwind, Navbar, sign-in page | tailwind.config.ts, Navbar.tsx, sign-in/page.tsx | ✅ Done (this session) |
| 7b | Frontend bootstrap + Auth wiring | providers, api.ts, auth store, login/register | ⬜ |
| 8 | Donor dashboard | WalletCard, scan, transactions | ⬜ |
| 9 | Vendor dashboard | BalanceCard, QRCodeCard | ⬜ |
| 10 | Admin panel + final polish | admin tables, analytics charts | ⬜ |

**Total remaining: 8 chunks**

---

## Chunk 7a — Brand Setup: Tailwind, Navbar, Sign-in Page ✅ DONE

**Commit:** *(this session — see git log)*

**Delivered:**
- `frontend/tailwind.config.ts` — brand color tokens (`brand.teal`, `brand.blue`, `brand.vivid`, `brand.bg`), Poppins font, card/btn/input border-radius, card shadow
- `frontend/postcss.config.mjs` — Tailwind + autoprefixer
- `frontend/src/app/globals.css` — Tailwind directives, `.btn-primary`, `.btn-outline`, `.input-field`, `.card` component classes
- `frontend/src/app/layout.tsx` — Poppins via `next/font/google`, favicon set to `/branding.png`, global CSS imported
- `frontend/src/components/ui/Navbar.tsx` — fixed top, logo (Logo.png), desktop nav links, animated hamburger for mobile, responsive
- `frontend/src/app/auth/sign-in/page.tsx` — full-bleed vivid blue background with SVG illustration (phone + coin), centered white card, email/password inputs, remember me checkbox, sign-in button + forgot password link, register link
- `frontend/src/app/page.tsx` — server-side `redirect("/auth/sign-in")`
- `frontend/tsconfig.json` — added `@/*` → `./src/*` path alias
- `frontend/public/logo.png` + `frontend/public/branding.png` — brand assets copied

**Assets:**
- `/public/logo.png` → horizontal logo → used in Navbar
- `/public/branding.png` → icon only → used as favicon

**Deviations from plan:**
- This chunk was inserted between Chunks 2 and original Chunk 7 due to brand/design requirements.
- Replaced Chakra UI as the primary styling system with Tailwind CSS v3 (Chakra UI packages remain in package.json but provider not initialised).
- Sign-in page illustration is an inline SVG approximation; original mockup used a stock illustration asset.
- Auth form wiring deferred to Chunk 7b (no API calls yet, form is UI shell only).

**Session prompt for Chunk 7b:**
```
Continue PocketChange frontend. Brand/Tailwind/Navbar already set up. Read: frontend/src/app/auth/sign-in/page.tsx, frontend/src/components/ui/Navbar.tsx, frontend/tailwind.config.ts, shared/src/schemas/auth.schema.ts.

Implement Chunk 7b — Frontend Auth Wiring:
- frontend/src/store/auth.store.ts (Zustand: user, accessToken, refreshToken, setAuth, clearAuth + localStorage)
- frontend/src/types/index.ts (User, Vendor, Transaction, Donation interfaces)
- frontend/src/lib/api.ts (update: Bearer interceptor, 401 refresh-retry)
- frontend/src/hooks/useAuth.ts (useLogin, useRegister, useLogout TanStack Query mutations)
- Wire sign-in/page.tsx form to useLogin hook
- frontend/src/app/auth/register/page.tsx (matching sign-in page style, DONOR/VENDOR role selector)

Install: zustand, @tanstack/react-query. No any types. Full file contents. Update README, chunking.md, commit, push.
```

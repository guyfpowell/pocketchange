# PocketChange — Implementation Plan

## Context
Implementing the full-stack PocketChange application from scratch, following architecture.md. The project has no source code yet — only the two planning docs. The user wants full working code, Docker Compose, and Jest unit tests for backend services.

## Key Architectural Decisions

1. **npm workspaces monorepo** — root `package.json` with `workspaces: ["backend", "frontend", "shared"]`
2. **TypeScript project references** — `shared/` has `composite: true`; backend and frontend reference it
3. **Refresh tokens are opaque random bytes** (`crypto.randomBytes(40).toString('hex')`), stored as a bcrypt hash in Redis under `refresh:<userId>` — never store raw tokens
4. **Prisma singleton** — shared `PrismaClient` instance via `globalThis` to prevent hot-reload exhaustion
5. **Stripe webhook must be registered before `express.json()`** — uses `express.raw({ type: 'application/json' })` on that route only
6. **Atomic wallet debit uses `updateMany`** (not `update`) — allows WHERE `walletBalance >= amount` guard; count=0 means insufficient funds
7. **Jest maps `@pocketchange/shared` directly to source `.ts` files** — no need to build shared before testing
8. **Chakra UI v2** — requires `@chakra-ui/next-js` CacheProvider in a `'use client'` providers wrapper

---

## Files to Create (ordered by dependency)

### Root (3 files)
| File | Purpose |
|------|---------|
| `package.json` | npm workspaces root (backend, frontend, shared) |
| `docker-compose.yml` | postgres:16-alpine + redis:7-alpine with health checks |
| `.gitignore` | node_modules, dist, .next, .env, .env.local, *.tsbuildinfo |

### shared/ (5 files)
| File | Purpose |
|------|---------|
| `package.json` | `@pocketchange/shared`, zod dep, tsc build script |
| `tsconfig.json` | composite: true, CommonJS, outDir: dist |
| `schemas/auth.schema.ts` | registerSchema, loginSchema + inferred types |
| `schemas/donation.schema.ts` | scanDonationSchema (token: cuid, amount: positive) |
| `schemas/vendor.schema.ts` | createVendorSchema, updateVendorSchema, topUpSchema |

### backend/ — Config & Infra (9 files)
| File | Purpose |
|------|---------|
| `package.json` | All deps + scripts (dev, build, test, db:migrate) |
| `tsconfig.json` | composite, references shared, paths alias |
| `jest.config.ts` | ts-jest, moduleNameMapper for shared → src |
| `.env.example` | All required env vars with placeholders |
| `prisma/schema.prisma` | Full Prisma schema (User, Vendor, QRCode, Donation, Transaction + enums) |
| `src/lib/prisma.ts` | Prisma singleton |
| `src/config/env.ts` | Zod-validated env (exits process on failure) |
| `src/config/redis.ts` | ioredis client + helpers: storeRefreshToken, getRefreshToken, deleteRefreshToken |
| `src/config/passport.ts` | passport-local strategy (generic 'Invalid credentials' message) |

### backend/ — Middleware (4 files)
| File | Purpose |
|------|---------|
| `src/middleware/authenticate.ts` | JWT verify, attaches req.user; augments Express.Request |
| `src/middleware/authorize.ts` | Role guard factory `authorize(...Role[])` |
| `src/middleware/validate.ts` | Zod schema middleware factory; replaces req.body with parsed data |
| `src/middleware/errorHandler.ts` | Global Express error handler + AppError class |

### backend/ — Modules (16 files: routes + controller + service × 5, plus webhook)
| Module | Files |
|--------|-------|
| auth | `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts` |
| users | `users.routes.ts`, `users.controller.ts`, `users.service.ts` |
| vendors | `vendors.routes.ts`, `vendors.controller.ts`, `vendors.service.ts` |
| donations | `donations.routes.ts`, `donations.controller.ts`, `donations.service.ts` |
| qrcodes | `qrcodes.routes.ts`, `qrcodes.controller.ts`, `qrcodes.service.ts` |
| admin | `admin.routes.ts`, `admin.controller.ts`, `admin.service.ts` |
| webhooks | `stripe.webhook.ts` (registered before json middleware) |

### backend/ — App entry + Tests (5 files)
| File | Purpose |
|------|---------|
| `src/app.ts` | Express app setup, middleware order, route registration, server start |
| `__tests__/singleton.ts` | jest-mock-extended mockDeep(PrismaClient) + jest.mock setup |
| `__tests__/auth.service.test.ts` | register, login, logout, refresh (mock Prisma + Redis) |
| `__tests__/donations.service.test.ts` | scan success, insufficient balance, used QR, unapproved vendor |
| `__tests__/users.service.test.ts` | getWallet, topUp (mock Stripe), getTransactions |

### frontend/ — Config (4 files)
| File | Purpose |
|------|---------|
| `package.json` | Next.js 15 + all frontend deps |
| `tsconfig.json` | Next.js defaults + references shared + paths alias |
| `next.config.ts` | Minimal; transpiles @pocketchange/shared |
| `.env.local.example` | NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY |

### frontend/ — App & Providers (4 files)
| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with `<Providers>` wrapper |
| `src/app/providers.tsx` | `'use client'` — CacheProvider + ChakraProvider + QueryClientProvider |
| `src/app/page.tsx` | Redirect to /auth/login or /donor/dashboard based on auth state |
| `src/lib/api.ts` | Axios instance (baseURL = NEXT_PUBLIC_API_URL), request interceptor adds Bearer token, response interceptor handles 401 → refresh → retry |

### frontend/ — Auth Store & Hooks (2 files)
| File | Purpose |
|------|---------|
| `src/store/auth.store.ts` | Zustand: { user, accessToken, refreshToken, setAuth, clearAuth } with localStorage persistence |
| `src/types/index.ts` | Shared TS types for API responses (User, Vendor, Transaction, Donation) |

### frontend/ — Auth Pages (2 files)
| File | Purpose |
|------|---------|
| `src/app/auth/login/page.tsx` | React Hook Form + Zod, POST /auth/login, redirect on success |
| `src/app/auth/register/page.tsx` | Register form with role selector (DONOR/VENDOR) |

### frontend/ — Donor Pages & Components (5 files)
| File | Purpose |
|------|---------|
| `src/app/(donor)/layout.tsx` | Donor nav sidebar |
| `src/app/(donor)/dashboard/page.tsx` | WalletCard + TopUpModal |
| `src/app/(donor)/scan/page.tsx` | @yudiel/react-qr-scanner → POST /donations/scan |
| `src/app/(donor)/transactions/page.tsx` | TransactionTable via TanStack Table |
| `src/components/donor/WalletCard.tsx` + `TopUpModal.tsx` + `TransactionTable.tsx` | UI components |

### frontend/ — Vendor Pages & Components (4 files)
| File | Purpose |
|------|---------|
| `src/app/(vendor)/layout.tsx` | Vendor nav |
| `src/app/(vendor)/dashboard/page.tsx` | BalanceCard + recent transactions |
| `src/app/(vendor)/qrcodes/page.tsx` | QRCodeCard list + generate button (qrcode lib for display) |
| `src/components/vendor/BalanceCard.tsx` + `QRCodeCard.tsx` | UI components |

### frontend/ — Admin Pages & Components (4 files)
| File | Purpose |
|------|---------|
| `src/app/(admin)/layout.tsx` | Admin nav |
| `src/app/(admin)/users/page.tsx` | UserTable with TanStack Table |
| `src/app/(admin)/vendors/page.tsx` | VendorTable with approve/reject buttons |
| `src/app/(admin)/analytics/page.tsx` | Recharts: donations over time, by vendor type |
| `src/components/admin/UserTable.tsx` + `VendorTable.tsx` + `AnalyticsCharts.tsx` | UI components |

### frontend/ — Hooks (5 files)
| File | Purpose |
|------|---------|
| `src/hooks/useAuth.ts` | login/register/logout mutations (TanStack Query) |
| `src/hooks/useWallet.ts` | useQuery for wallet balance, useMutation for topup |
| `src/hooks/useTransactions.ts` | paginated transaction list |
| `src/hooks/useVendor.ts` | vendor profile, QR codes, generate QR mutation |
| `src/hooks/useAdmin.ts` | users, vendors, approve/reject mutations, analytics |

**Total: ~70 files**

---

## Critical Implementation Details

### app.ts middleware order
```
1. express.raw() on /api/webhooks/stripe FIRST
2. helmet()
3. cors()
4. express.json()
5. express-rate-limit on /api/auth
6. passport.initialize()
7. Route registration
8. 404 handler
9. errorHandler (must be last, 4 args)
```

### Donation atomic pattern (donations.service.ts)
- Use `updateMany` + count === 0 check for wallet debit (Prisma WHERE compound)
- All 6 steps inside single `prisma.$transaction(async (tx) => { ... })`

### Stripe webhook (stripe.webhook.ts)
- Raw body middleware: `express.raw({ type: 'application/json' })`
- `stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.STRIPE_WEBHOOK_SECRET)`
- On `payment_intent.succeeded`: update `User.walletBalance += amount`, create `Transaction(WALLET_TOPUP)`

### Frontend 401 refresh flow (api.ts)
- Response interceptor: on 401, call `POST /auth/refresh` with stored refreshToken
- On success: update Zustand store with new accessToken, retry original request
- On failure: call `clearAuth()` and redirect to `/auth/login`

---

## Verification Steps
1. `cd pocketchange && docker compose up -d` → postgres + redis start
2. `cd backend && cp .env.example .env` → fill in secrets
3. `npx prisma migrate dev --name init` → creates DB tables
4. `npm run dev --workspace=backend` → Express starts on :4000
5. `curl -X POST http://localhost:4000/api/auth/register -H 'Content-Type: application/json' -d '{"email":"test@test.com","password":"password123","name":"Test","role":"DONOR"}'` → 201
6. `npm test --workspace=backend` → all Jest tests pass
7. `cd frontend && cp .env.local.example .env.local` → fill NEXT_PUBLIC_API_URL=http://localhost:4000
8. `npm run dev --workspace=frontend` → Next.js starts on :3000
9. Visit http://localhost:3000 → redirects to login, forms work end-to-end

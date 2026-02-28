# PocketChange

PocketChange is a full-stack monorepo application for managing donations, wallets, and QR code payments. Donors give money to homeless people via QR codes; funds can only be spent at registered hostels or food shops.

The project is structured as a TypeScript monorepo using npm workspaces, with:

- Express backend
- Next.js frontend
- Shared TypeScript workspace
- PostgreSQL (Docker)
- Redis (Docker)
- Prisma ORM

---

## Project Structure

```
pocketchange/
├─ backend/
│   ├─ prisma/                  # Prisma schema + migrations
│   └─ src/
│       ├─ config/              # env validation, JWT helpers
│       ├─ middleware/          # authenticate, authorize, validate, errorHandler
│       ├─ modules/             # feature modules (auth, users, vendors, ...)
│       ├─ types/               # Express type extensions
│       ├─ lib/                 # Prisma singleton
│       └─ app.ts
├─ shared/                      # Shared Zod schemas (FE + BE)
├─ frontend/                    # Next.js frontend (App Router)
├─ docker-compose.yml           # Postgres + Redis services
├─ package.json                 # Monorepo root (npm workspaces)
├─ tsconfig.base.json
├─ architecture.md
├─ plan.md
└─ scafolding.md
```

---

## Tech Stack

### Backend
- Express + TypeScript
- Prisma v6 (ORM + migrations)
- PostgreSQL via Docker
- Redis via Docker
- JWT (jsonwebtoken) — access + refresh tokens
- bcrypt — password hashing
- Zod v4 — request validation
- helmet, cors, express-rate-limit

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Axios, TanStack Query, Zustand, Chakra UI

### Monorepo
- npm workspaces
- TypeScript project references

---

## Current Status

### Completed

| Layer | Status |
|---|---|
| Monorepo + Docker (Postgres + Redis) | Done |
| Prisma schema + migrations | Done |
| Express server skeleton | Done |
| Config layer (`env.ts`, `jwt.ts`) | Done |
| Middleware (`authenticate`, `authorize`, `validate`, `errorHandler`) | Done |
| Express type extensions (`req.user`) | Done |

### Backend routes (current)
- `GET /` — health ping
- `GET /api/health` — `{ status: "ok" }`
- `GET /api/users` — all users from DB

### In progress
- Auth module (`POST /api/auth/register`, `POST /api/auth/login`)
- Users, Vendors, Donations, Admin modules
- Frontend

---

## Development Setup

### 1. Clone

```bash
git clone https://github.com/guyfpowell/pocketchange.git
cd pocketchange
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Docker services

Docker Desktop must be running.

```bash
docker compose up -d
```

Verify:

```bash
docker ps
# pocketchange-postgres
# pocketchange-redis
```

### 4. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env and fill in JWT secrets, Stripe keys, etc.
```

### 5. Run database migrations

```bash
npm run db:migrate --workspace=backend
```

### 6. Start backend

```bash
npm run dev --workspace=backend
# http://localhost:4000
```

### 7. Start frontend

```bash
npm run dev --workspace=frontend
# http://localhost:3000
```

---

## Environment Variables

See `backend/.env.example` for all required variables.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (≥32 chars) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (≥32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default: `7d`) |
| `REDIS_URL` | Redis connection string |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CORS_ORIGIN` | Allowed CORS origin (default: `http://localhost:3000`) |

---

## Database

Prisma schema (`backend/prisma/schema.prisma`) defines:

- `User` — email, hashed password, role, wallet balance
- `UserRole` enum — `DONOR`, `VENDOR`, `ADMIN`

---

## Notes

- Prisma v6 used throughout.
- Docker required for Postgres and Redis.
- Node.js 18+ recommended.
- Zod v4 — use `error.issues` (not `.errors`).
- Stripe webhook route uses `express.raw()` before `express.json()`.

---

## Roadmap

- [x] Monorepo + Docker
- [x] Prisma schema + migrations
- [x] Config + middleware layer (JWT, Zod, error handling)
- [ ] Auth module (register, login, refresh, logout)
- [ ] Users module (profile, wallet, top-up)
- [ ] Stripe webhook + wallet top-up flow
- [ ] Vendors module + QR code generation
- [ ] Donations scan endpoint (atomic Prisma transaction)
- [ ] Admin module + analytics
- [ ] Frontend auth pages
- [ ] Donor dashboard (wallet, scan, history)
- [ ] Vendor dashboard (balance, QR management)
- [ ] Admin panel (users, vendors, analytics)
- [ ] Jest unit tests
- [ ] Deployment configuration

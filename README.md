# PocketChange

PocketChange is a full-stack monorepo application (work in progress) for managing donations, wallets, and QR code payments.

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
├─ backend/                # Express + Prisma backend
├─ shared/                 # Shared TypeScript workspace
├─ frontend/               # Next.js frontend (App Router)
├─ docker-compose.yml      # Postgres + Redis services
├─ package.json            # Monorepo root (npm workspaces)
├─ tsconfig.base.json
├─ README.md
├─ architecture.md
├─ plan.md
```

---

## Tech Stack

### Backend
- Express
- TypeScript
- Prisma (v6)
- PostgreSQL (Docker)
- Redis (Docker)

### Frontend
- Next.js (App Router)
- TypeScript
- Axios

### Monorepo
- npm workspaces
- TypeScript project references

---

## Current Status

### Backend

- Running on: http://localhost:4000
- Connected to Docker Postgres
- Prisma migration applied
- Working DB query:

GET /api/users

Returns:

```json
[]
```

(Empty array if no users exist)

Available routes:

- GET / → "Backend is working!"
- GET /api/health → { message: "Backend is reachable!" }
- GET /api/users → returns all users from database

---

### Frontend

- Running on: http://localhost:3000
- Calls backend health endpoint
- Displays backend status

---

## Development Setup

### 1. Clone

```bash
git clone https://github.com/guyfpowell/pocketchange.git
cd pocketchange
```

---

### 2. Install Dependencies

From project root:

```bash
npm install
```

---

### 3. Start Database (Docker Required)

Make sure Docker Desktop is running.

From project root:

```bash
docker compose up -d
```

Verify:

```bash
docker ps
```

You should see:

- pocketchange-postgres
- pocketchange-redis

---

### 4. Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Backend runs on:

http://localhost:4000

---

### 5. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

http://localhost:3000

---

## Database

Prisma schema includes:

- User model
- UserRole enum

Database connection:

PostgreSQL (Docker)  
localhost:5432

---

## Notes

- Prisma v6 is used for stability.
- Docker is required for Postgres and Redis.
- Node.js 18+ recommended.
- Monorepo managed via npm workspaces.
- TypeScript project references enabled.

---

## Roadmap (Next Steps)

- Auth module (JWT + refresh tokens)
- Vendor & Donation modules
- Redis session storage
- Middleware (auth + validation)
- Frontend auth state (Zustand)
- Chakra UI integration
- Tests (Jest)
- Deployment configuration
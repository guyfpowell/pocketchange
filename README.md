# PocketChange

A full-stack monorepo application (work in progress) for managing donations, wallets, and QR code payments.  
Currently includes **shared**, **backend**, and **frontend** workspaces with TypeScript support.

---

## Project Structure

```
pocketchange/
├─ backend/        # Backend workspace (Express + TypeScript)
├─ shared/         # Shared TypeScript workspace (schemas, types, utils)
├─ frontend/       # Frontend workspace (Next.js + TypeScript)
├─ package.json    # Monorepo root, npm workspaces
├─ tsconfig.base.json  # Base TypeScript config
├─ README.md
├─ architecture.md
├─ plan.md
├─ scafolding.md
```

---

## Current Workspaces

### Shared

- Workspace: `@pocketchange/shared`
- TypeScript + Zod schemas
- Buildable via `npm run build`
- Path: `shared/`
- Example export:

```ts
import { sharedReady } from "@pocketchange/shared";
console.log(sharedReady); // true
```

### Backend

- Workspace: `@pocketchange/backend`
- Express + TypeScript setup
- Linked to shared workspace via TS project references
- Minimal server running on port 4000
- Scripts:

```bash
# Build TypeScript
npm run build

# Start server with hot reload
npm run dev
```

- Example routes:
  - `GET /` → "Backend is working!"
  - `GET /api/health` → "Backend is reachable!" ✅

---

### Frontend (Minimal Setup)

- Workspace: `@pocketchange/frontend`
- Next.js + TypeScript
- Minimal pages and layout created:
  - `src/app/layout.tsx` — Root layout
  - `src/app/page.tsx` — Homepage displays backend status
  - `src/lib/api.ts` — Axios instance pointing to `http://localhost:4000`
- Scripts:

```bash
# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

- Test: Visit [http://localhost:3000](http://localhost:3000) → should display "Backend is reachable!"  

---

## Development Setup

1. Clone the repo:

```bash
git clone https://github.com/guyfpowell/pocketchange.git
cd pocketchange
```

2. Install workspace dependencies:

```bash
# Shared
cd shared
npm install
npm run build

# Backend
cd ../backend
npm install
npm run build
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

3. Verify:

- Backend: [http://localhost:4000](http://localhost:4000) → "Backend is working!"  
- Frontend: [http://localhost:3000](http://localhost:3000) → "Backend is reachable!"  

---

## Next Steps

- Generate backend modules (users, vendors, donations) with Claude Code
- Generate frontend pages/hooks for each module
- Add Prisma schema and migrations
- Integrate Redis + JWT authentication
- Add Docker support for full-stack deployment

---

## Notes

- Node.js v24+ recommended
- Mac users: `.DS_Store` ignored globally
- `node_modules/`, `dist/`, `.next/` are ignored in Git
- Monorepo uses **npm workspaces**
- Current frontend is minimal; future pages will use Chakra UI and TanStack Query


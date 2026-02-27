# PocketChange

A full-stack monorepo application (work in progress) for managing donations, wallets, and QR code payments.  
Currently includes **shared** and **backend** workspaces with TypeScript support.

---

## Project Structure

```
pocketchange/
├─ backend/        # Backend workspace (Express + TypeScript)
├─ shared/         # Shared TypeScript workspace (schemas, types, utils)
├─ frontend/       # Frontend workspace (Next.js + TypeScript) – planned
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

- Example route: `GET /` → returns `"Backend is working!"`

---

## Development Setup

1. Clone the repo:

```bash
git clone https://github.com/guyfpowell/pocketchange.git
cd pocketchange
```

2. Install workspace dependencies (run in each workspace):

```bash
cd shared
npm install
npm run build

cd ../backend
npm install
npm run build
npm run dev
```

3. Verify backend is running:

Visit [http://localhost:4000](http://localhost:4000) in your browser — should display `"Backend is working!"`.

---

## Next Steps

- Setup **frontend workspace** with Next.js + Chakra UI
- Add **Prisma schema and migrations**
- Add **API routes, controllers, and services**
- Integrate **Redis + JWT authentication**
- Add **Docker support** for full-stack deployment

---

## Notes

- Node.js v24+ recommended
- Mac users: `.DS_Store` ignored globally
- `node_modules/` and `dist/` are ignored in Git
- Monorepo uses **npm workspaces**


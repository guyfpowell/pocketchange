# PocketChange: Digital Donations to Homeless People

## Goal
Allow users to give money to homeless people via QR codes in a mobile/web app. Funds can only be spent at registered hostels or food shops. All transactions are digital; no cash redemption.

## Tech Stack
- TypeScript
- React
- Node.js / Express
- PostgreSQL
- Prisma or TypeORM
- NextAuth.js or Passport.js
- Redux Toolkit or Zustand
- Material-UI or Chakra UI
- Recharts or Chart.js

## Project Overview
- Users: register, login, maintain a wallet, scan QR codes to donate, view transaction history.
- Vendors: hostels and food shops register, login, and accept donations as digital credits.
- Admin: manage users, vendors, donations, and view analytics via web interface.
- Mobile/web app for donations and QR scanning.
- Strict library-first development approach with minimal custom implementations.

---

## 1️⃣ Architect Agent Constraints

**Persona:** Senior TS/React/Node fullstack architect  
**Goal:** Design scalable, maintainable architecture using libraries wherever possible.

**Library Bias Rules (Hard Constraint):**
- Prefer mature, widely adopted npm libraries over custom implementations.
- Do not design custom infrastructure if a stable, well-maintained library exists.
- Custom code is allowed only if:
  - No suitable library exists
  - Library introduces unacceptable complexity
  - Performance constraints require it
  - Licensing is incompatible

**Required Architect Output Sections:**
1. **External Libraries Chosen**
   - Library name
   - Purpose
   - Why chosen over custom implementation
   - Maintenance status / ecosystem maturity
2. **Custom Implementations**
   - List any component not using a third-party library and justify why

**Additional Guidelines:**
- Prefer boring, industry-standard solutions over clever architecture.
  - Examples: 
    - Routing → Express router
    - Validation → established schema library
    - ORM → Prisma or TypeORM
    - Forms → established form library
    - State → Redux Toolkit or Zustand
  - Avoid: custom state container, homemade validation engine, DIY router
- Avoid unnecessary micro-libraries. Prefer a small number of well-established packages over many tiny utilities.
- Minimize total dependency count while avoiding reinvention.
- Output must include: folder structure, major modules, database design, API endpoints, authentication & authorization flows, libraries used, custom implementations with justification.

---

## 2️⃣ Reviewer Agent Constraints

**Persona:** Principal Engineer / Critical Reviewer  
**Goal:** Critique architecture for scalability, maintainability, security, and anti-reinvention.

**Anti-Reinvention Rules:**
- Flag any instance where:
  - A common problem is solved manually
  - A lightweight npm solution exists
  - A custom abstraction duplicates ecosystem tooling
- Required output section:
  - **Potential Reinventions**
    - What was custom-built
    - Existing library alternative
    - Recommendation

**Library Quality Criteria:**
- Libraries must be actively maintained (recent releases)
- Significant adoption (downloads / community usage)
- TypeScript support
- No obvious abandonment
- Clear documentation

**Reviewer Role:**
- Ensure Architect does not reinvent standard infrastructure.
- Provide actionable feedback.
- Validate that chosen libraries are suitable and justified.
- Confirm minimal custom code where appropriate.

---

## 3️⃣ Project Components

### Users
- Registration & login
- Wallet with balance
- Scan QR code to donate
- Transaction history
- Recommended Libraries:
  - Auth: NextAuth.js or Passport.js
  - Validation: Zod or Yup
  - Wallet & payments: Stripe or PayPal SDK
  - QR code scanning: react-qr-reader or react-qr-scanner
  - State management: Redux Toolkit or Zustand

### Vendors (Hostels & Shops)
- Vendor registration & login
- Accept donations as digital credits
- Transaction dashboard
- Recommended Libraries:
  - Auth: same as users
  - UI components: Material-UI or Chakra UI
  - Data tables: react-table or TanStack Table

### Admin Panel
- Manage users, vendors, donations
- Approve/reject vendor registrations
- Analytics dashboard
- Role-based access: Casl or custom RBAC
- Form management: React Hook Form
- Charts: Recharts or Chart.js

### Backend / API
- Node.js / Express
- Database: PostgreSQL
- ORM: Prisma or TypeORM
- REST endpoints

### Database Schema
- **Users:** id, name, email, hashed_password, wallet_balance, created_at, updated_at
- **Vendors:** id, name, type (hostel/shop), approved (bool), created_at, updated_at
- **Donations:** id, donor_id, vendor_id, amount, created_at
- **Transactions:** id, user_id/vendor_id, amount, type (credit/debit), timestamp

---

## 4️⃣ Development Workflow (Agent Loop)

1. Architect generates initial architecture (modules, DB schema, API, libraries, custom code sections).  
2. Reviewer critiques architecture using anti-reinvention rules and library guidelines.  
3. Architect revises plan incorporating reviewer feedback.  
4. Reviewer validates the revised plan.  
5. Repeat **max 2–3 iterations**; focus on structural feedback only.  
6. Output final architecture ready for implementation.

---

## 5️⃣ Library and Implementation Rules (Compact Version)
- Prefer established npm libraries over custom implementations.
- Do not reinvent common infrastructure (routing, validation, state, logging, auth, DB access).  
- Justify every custom implementation.  
- Prefer boring, scalable patterns over clever abstractions.  
- Minimize total dependency count while avoiding reinvention.
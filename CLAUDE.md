# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server on port 3000
pnpm build        # type-check + build for production
pnpm lint         # run ESLint
pnpm preview      # preview production build on port 5000
```

No test suite is configured.

## Architecture Overview

This is a **POS (Point of Sale)** web app for Steel Colors and Metal Products, built with React 19 + TypeScript + Vite.

### Routing

Uses **TanStack Router** with file-based routing under `src/routes/`. `src/routeTree.gen.ts` is auto-generated — never edit it manually. Each route file exports a `Route` created via `createFileRoute`. Route guards live in `src/guards/sirKupal.ts` and are called in `beforeLoad` hooks.

Two roles: `ADMIN` (dashboard, inventory, employees, transactions) and `CASHIER` (sales/POS only). Redirects are thrown as exceptions via `redirect()` from TanStack Router.

### Data Fetching

All server state uses **TanStack Query**. Custom hooks in `src/hooks/` wrap `useQuery`/`useMutation` calls. The shared Axios instance is at `src/lib/axios.ts` — it reads `VITE_API_URL` from env, attaches a Bearer token from `localStorage`, and auto-redirects to `/login` on 401.

### Client State

**Zustand** for global client state. Two stores:
- `src/stores/authStore.ts` — auth token + user, persisted to `localStorage`, restored on app init via `useAuthStore.getState().actions.restore()` called in `main.tsx`
- `src/stores/sales.ts` — POS cart state (items, scanned product, payment info, dialogs)

Pattern: each store exports named selector hooks (e.g., `useAuthUser`, `useSalesCartItems`) — prefer these over selecting manually.

### UI Components

Shadcn-style components live in `src/components/ui/`. These are Radix UI primitives styled with Tailwind. Import from `@/components/ui/...`. The `@` alias maps to `src/`.

### POS Flow (Sales page)

1. Cashier logs in → must open a cash session (enter opening cash) before processing sales
2. Barcode scanner input adds products to cart
3. Cart items support RETAIL or WHOLESALE pricing per item
4. Checkout supports CASH or CREDIT payment; CREDIT requires scanning employee barcode
5. At end of shift, cashier enters closing cash → prints cash checkout receipt
6. Print routes (`/print/:id`, `/print-cash-checkout/:id`) render in a plain white layout without the app header

### Environment Variables

```
VITE_API_URL=http://localhost:5000
VITE_CANTEEN_BRANCH_NAME=...
VITE_CANTEEN_BRANCH_ADDRESS=...
```

Copy `.env` and adjust `VITE_API_URL` to point at the backend API.

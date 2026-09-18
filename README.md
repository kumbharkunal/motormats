# Motormats

Premium custom-fit car mats — e-commerce storefront and admin panel.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) · React 19 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Data | MySQL · Drizzle ORM · mysql2 |
| Auth | Firebase Authentication (phone OTP + Google) with app-issued sessions |
| Payments | Razorpay |
| Media | Cloudinary (via a custom `next/image` loader) |
| Client state | Redux Toolkit (cart, wishlist, global UI) |
| Animation | Swiper (homepage deck + carousels) · Motion · Lenis |
| Admin | Material UI v9 — confined to the `(admin)` route group |
| Testing | Vitest · Playwright |

## Getting started

Requires **Node 22 LTS or newer**.

```bash
npm install
cp .env.example .env.development   # then fill in real credentials
npm run dev
```

The app boots with placeholder credentials, so the UI runs before the external
services are wired up. Replace each `PLACEHOLDER` value as you reach the phase
that needs it — `.env.example` documents where every value comes from.

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm start            # serve the production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest (unit + integration)
npm run test:e2e     # playwright
npm run db:generate  # create a migration from schema changes
npm run db:migrate   # apply migrations
npm run analyze      # bundle analysis
```

## Layout

```
db/            Drizzle schema and migrations
src/app/       Routes — (shop) storefront · (auth) · (admin) · api
src/features/  Domain modules: components, server logic, schemas, types
src/components ui · layout · deck · feedback
src/lib/       env, db client, auth, api helpers, logger, integrations
src/store/     Redux Toolkit slices
tests/         unit · integration · e2e
```

## Conventions

- **Server Components by default.** `"use client"` needs a real reason: a browser
  API, an event handler, or client state.
- **Layers:** `app/` routes → `features/<domain>/` business logic → `db/` data.
  Route handlers and Server Actions stay thin — validate, authorise, delegate.
- **TypeScript is strict.** No `any`, no `@ts-ignore`. Every external input is
  validated with zod at the boundary.
- **Money is always integer paise**, never floats. Externally exposed rows use an
  opaque ULID `public_id`; sequential ids never appear in URLs or API responses.
- **Never trust the client** for price, discount, tax, shipping, totals,
  inventory, payment status or permissions. The server recomputes every
  financial value from the database, and authorisation is enforced in the
  handler.
- **Design tokens live in `src/styles/globals.css`** under `@theme` — no
  hardcoded hex values in components.
- **Mobile, tablet and desktop are all first-class.** Fluid sizing over
  breakpoints, 44px touch targets, and no horizontal page overflow anywhere.
- **Animation ownership is fixed:** Swiper owns the homepage deck and carousels,
  Motion owns entrances and overlays, Lenis owns smooth scroll on non-deck
  routes. Only `transform` and `opacity` are animated.
- **Test what breaks money, access or data** — pricing, permissions, signature
  verification, idempotency, and the full purchase journey.

## Environment

Only three env files are used: `.env.development`, `.env.production` (both
gitignored) and `.env.example` (committed, placeholders only). Server secrets
are read through `src/lib/env.server.ts`, public values through
`src/lib/env.client.ts` — never `process.env` directly. On a managed host, set
production values in the host's environment settings rather than committing a
file.

## Deployment

Builds to a standard `next start` Node server with no host-specific coupling —
runs on Hostinger Web Apps, a VPS, Docker or Vercel unchanged. The process is
assumed to be restartable at any time, so nothing that matters for correctness
is kept in memory..

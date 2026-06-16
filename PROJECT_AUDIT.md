# Project Audit Report — cargo-site

**Date:** 2026-05-30  
**Auditor:** Claude Code (automated analysis)  
**Scope:** Full codebase review — architecture, security, performance, code quality

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Supabase Dependencies](#4-supabase-dependencies)
5. [Unused Files & Components](#5-unused-files--components)
6. [Dead Code](#6-dead-code)
7. [Duplicated Code](#7-duplicated-code)
8. [Potential Bugs](#8-potential-bugs)
9. [Security Issues](#9-security-issues)
10. [Performance Issues](#10-performance-issues)
11. [Technical Debt](#11-technical-debt)
12. [Summary Table](#12-summary-table)

---

## 1. Project Overview

**cargo-site** is a Next.js 16.2.4 (App Router) web application for a Kyrgyz cargo forwarding company called **3X Cargo**. The app serves two audiences:

- **Public users** — marketing pages, a shipping calculator, package tracking, contact form, and service descriptions.
- **Clients** — a personal dashboard to view their shipments and copy warehouse addresses for Chinese marketplaces (Pinduoduo, Taobao, 1688, Poizon).
- **Admins** — a full CRM with shipment management, batch tracking, client database, comments, and problem resolution.

**Stack:**
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 (App Router) |
| UI | React 19.2.4, Tailwind CSS 4 |
| Database / Auth | Supabase (PostgreSQL + GoTrue) |
| Icons | lucide-react 1.14.0 |
| Excel | xlsx 0.18.5 |
| Language | TypeScript 5 |

The application is **production-oriented** (not a prototype) and handles real client data.

---

## 2. Architecture

### 2.1 Current Architecture

```
Browser
  │
  ├── Public site  (app/(site)/*)     ← Static marketing content
  ├── Auth         (app/login, /register)
  ├── Dashboard    (app/dashboard/)   ← Client personal area
  ├── Admin CRM    (app/admin/*)      ← Internal management
  └── API          (app/api/telegram) ← Single Telegram webhook
          │
          ▼
    Supabase (PostgreSQL + Auth)
```

All data access goes through a single shared Supabase client (`lib/supabase.ts`) using the **anonymous public key** loaded directly in client-side components. There is **no server-side API layer** between the frontend and the database.

### 2.2 Architectural Issues

1. **No API abstraction layer.** Every page fetches data directly from Supabase using the public anon key. This means the database schema, table names, and column names are all exposed in the browser's network tab.

2. **No route-level authentication.** The admin area (`/admin/*`) has no Next.js middleware protecting it. Protection relies entirely on a client-side redirect in the dashboard, and admin pages have no auth check at all — they just render.

3. **No server components for data fetching.** All data-fetching components are marked `"use client"`, missing the performance and security benefits of React Server Components, which are the primary architectural advantage of Next.js App Router.

4. **Single Supabase client instance.** `lib/supabase.ts` exports one shared client. This is fine for browser-only usage, but problematic if server-side usage is added later.

---

## 3. Folder Structure

```
cargo-site/
├── app/
│   ├── (site)/                    ← Route group: public marketing site
│   │   ├── layout.tsx             ← TopBar + Header + Footer wrapper
│   │   └── [pages within group]
│   ├── admin/
│   │   ├── layout.tsx             ← Wraps AdminShell (NO auth check)
│   │   ├── page.tsx               ← Dashboard overview (KPIs, batches)
│   │   ├── shipments/
│   │   │   ├── page.tsx           ← Shipment list, import, export
│   │   │   └── [tracking_code]/page.tsx ← Shipment detail
│   │   ├── batches/
│   │   │   ├── page.tsx
│   │   │   └── [batch]/page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [code]/page.tsx
│   │   ├── comments/
│   │   │   ├── page.tsx
│   │   │   ├── batches/page.tsx
│   │   │   └── clients/page.tsx
│   │   ├── problems/page.tsx
│   │   └── unknown/page.tsx
│   ├── api/
│   │   └── telegram/route.ts      ← Contact form → Telegram bot
│   ├── calculator/page.tsx
│   ├── contact/page.tsx
│   ├── dashboard/page.tsx         ← Client personal account
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── services/                  ← 6 service sub-pages + index
│   ├── tracking/page.tsx
│   ├── layout.tsx                 ← Root layout
│   └── page.tsx                   ← Home page
├── components/
│   ├── admin/
│   │   └── AdminShell.tsx         ← Sidebar + shell (no auth)
│   ├── TopBar.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Services.tsx
│   ├── QuickActions.tsx
│   ├── HowItWorks.tsx
│   ├── WhyUs.tsx
│   ├── MiniCalculator.tsx
│   ├── MiniTracking.tsx
│   ├── DeliveryStats.tsx
│   ├── Reviews.tsx
│   ├── FAQ.tsx
│   └── CTA.tsx
├── lib/
│   └── supabase.ts                ← Supabase client (anon key)
├── public/                        ← Default Next.js SVG placeholders only
├── .gitignore                     ← Correctly excludes .env*
├── next.config.ts                 ← Empty config
├── package.json
└── tsconfig.json
```

**Notable:** The `public/` directory contains only the default Next.js placeholder SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`). Images used in the dashboard are loaded from Supabase Storage URLs.

---

## 4. Supabase Dependencies

### 4.1 Client Configuration

**File:** `lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

- Uses the anonymous key — intended for public, client-side read access governed by Row Level Security (RLS).
- The `!` (non-null assertion) means the app will throw a cryptic runtime error if env vars are missing, rather than a clear startup failure.

### 4.2 Tables Accessed

| Table | Operations | Files |
|-------|-----------|-------|
| `clients` | SELECT, INSERT, UPDATE | register, dashboard, admin/clients/*, admin/shipments/[code] |
| `shipments` | SELECT, INSERT, UPDATE, UPSERT, DELETE | admin/shipments/*, admin/page, admin/batches/*, admin/problems, admin/unknown, dashboard |
| `batches` | SELECT, INSERT, UPDATE | admin/batches/* |
| `batch_notes` | SELECT, INSERT | admin/batches/[batch], admin/comments/* |
| `tracking_events` | SELECT, INSERT | dashboard, admin/shipments/[code] |
| `leads` | INSERT | contact/page |

### 4.3 Inferred Schema

```sql
clients (
  id, user_id, client_code, first_name, last_name, phone, email,
  city, street, house, pickup_point, telegram_username, client_note,
  created_at, updated_at
)

shipments (
  id, client_code, tracking_code, batch_code, status, location,
  weight, note, created_at, updated_at
)

batches (
  batch_code, status, departure_date, arrival_date, note,
  created_at, updated_at
)

batch_notes (id, batch_code, note, created_at)

tracking_events (
  id, shipment_id, tracking_code, client_code, batch_code,
  status, location, note, created_at
)

leads (id, name, phone, message, created_at)
```

### 4.4 RLS Dependency Risk

The application relies entirely on Supabase Row Level Security policies to prevent unauthorized cross-user data access. These policies are not visible in this codebase. If RLS is misconfigured or disabled:

- Any authenticated client can read **all** other clients' shipment data by querying `shipments` with arbitrary `client_code` values.
- Admin functionality is fully accessible from the browser console since the same anon key is used for both client and admin operations.

---

## 5. Unused Files & Components

### 5.1 Public Folder — Default Placeholders

All five files in `public/` are the default Next.js placeholder assets. None are referenced in any source file:

| File | Referenced? |
|------|------------|
| `public/file.svg` | No |
| `public/globe.svg` | No |
| `public/next.svg` | No |
| `public/vercel.svg` | No |
| `public/window.svg` | No |

**Recommendation:** Delete all five — they are remnants of `create-next-app`.

### 5.2 Admin Menu Items Pointing to Non-Existent Pages

`components/admin/AdminShell.tsx` defines 19 menu items. Of these, **15 point to pages that do not exist**:

| Menu Label | Route | Page Exists? |
|-----------|-------|-------------|
| Главная | `/admin` | ✅ |
| Посылки | `/admin/shipments` | ✅ |
| Партии | `/admin/batches` | ✅ |
| Клиенты | `/admin/clients` | ✅ |
| **Склад** | `/admin/warehouse` | ❌ |
| **Сортировка** | `/admin/sorting` | ❌ |
| **Касса** | `/admin/cash` | ❌ |
| **Финансы** | `/admin/finance` | ❌ |
| **Заявки / Лиды** | `/admin/leads` | ❌ |
| **Диалоги** | `/admin/dialogs` | ❌ |
| **AI Ассистент** | `/admin/ai` | ❌ |
| **Карго партнёры** | `/admin/partners` | ❌ |
| **Юани** | `/admin/yuan` | ❌ |
| **Обучение** | `/admin/education` | ❌ |
| **Уведомления** | `/admin/notifications` | ❌ |
| **Уведомления для клиентов** | `/admin/client-notifications` | ❌ |
| **Сотрудники** | `/admin/staff` | ❌ |
| **Аналитика** | `/admin/analytics` | ❌ |
| **Настройки** | `/admin/settings` | ❌ |

Clicking any of the 15 broken links causes a Next.js 404 error. These links also appear in the Quick Actions panel on `admin/page.tsx`.

### 5.3 Unused `README.md`

The project root contains the default Next.js boilerplate `README.md`. It describes how to run the project but contains no project-specific information.

---

## 6. Dead Code

### 6.1 Unused Imports — `app/admin/page.tsx`

The admin dashboard imports a large number of icons from `lucide-react` that are never rendered. The following are imported but not used in JSX:

```typescript
// app/admin/page.tsx — imported but never used:
Home, Warehouse, ClipboardList, CreditCard, CircleDollarSign,
Target, MessageCircle, Bot, Handshake, BadgeJapaneseYen,
GraduationCap, Bell (used in JSX, actually), Megaphone,
UserCog, BarChart3, Settings, ScanLine, Send, UserSearch,
Menu, X
```

The TypeScript compiler would catch these if `noUnusedLocals: true` were set in `tsconfig.json` (it currently is not).

### 6.2 Inline `EyeIcon` Component — `app/register/page.tsx:44`

A custom SVG eye icon is defined inline inside `RegisterPage`:

```typescript
// app/register/page.tsx:44
const EyeIcon = ({ crossed = false }: { crossed?: boolean }) => (
  <svg width="22" height="22" ...>
    ...
  </svg>
);
```

`lucide-react` is already a dependency and provides `Eye` and `EyeOff` icons. This inline component is redundant and is re-created on every render of `RegisterPage`.

### 6.3 Placeholder Comment in Admin Weekly Stats — `app/admin/page.tsx:503`

```typescript
<p className="mt-1 text-xs text-blue-600/70">
  Позже сюда можно добавить график по дням: посылки, выдачи и выручка.
</p>
```

A TODO comment visible to end users rendered as UI text. This should be removed or replaced with actual chart functionality.

### 6.4 Empty `next.config.ts`

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  /* config options here */
};
```

The config file contains only the boilerplate comment. No custom configuration has been added. This is harmless but indicates no Next.js-level optimization has been considered (image domains, headers, redirects, etc.).

### 6.5 Unused `cargoName`/`cargoSubtitle` Variables — `AdminShell.tsx:56`

```typescript
const cargoName = "3X Cargo";
const cargoSubtitle = "Карго из Китая";
```

These are defined as local `const` variables rather than being extracted to a shared config. They are used only in that single component but the pattern should be moved to a central constants file when the app matures.

---

## 7. Duplicated Code

### 7.1 `statusOptions` / `statusMap` — Defined in 5+ Files

The shipment status list and its display-label mapping are copy-pasted across:

| File | What's Duplicated |
|------|------------------|
| `app/admin/page.tsx:60` | `statusOptions`, `statusMap` |
| `app/admin/shipments/page.tsx:49` | `statusOptions`, `statusMap`, `statusStyles` |
| `app/admin/shipments/[tracking_code]/page.tsx` | `statusOptions`, `statusMap` |
| `app/admin/batches/[batch]/page.tsx` | `statusOptions`, `statusMap` |
| `app/dashboard/page.tsx:42` | `statusMap` (with emoji variants) |

Adding a new status requires editing **5 or more files**. A single source of truth in `lib/constants.ts` would eliminate this.

### 7.2 `Shipment` Type — Defined in 4+ Files

```typescript
type Shipment = {
  id: number;
  client_code: string;
  tracking_code: string;
  batch_code: string | null;
  status: string | null;
  location: string | null;
  weight: number | null;
  note: string | null;
  created_at: string;
  updated_at: string | null;
};
```

This exact type (or a close variant) is declared locally in:
- `app/admin/page.tsx`
- `app/admin/shipments/page.tsx`
- `app/admin/batches/[batch]/page.tsx`
- `app/admin/clients/[code]/page.tsx`

Should be in `lib/types.ts`.

### 7.3 `activeStatuses` Array — Defined in 2 Files

```typescript
const activeStatuses = [
  "china_warehouse", "in_transit", "bishkek_arrived",
  "sorting", "ready_pickup", "problem",
];
```

Defined in both `app/dashboard/page.tsx:52` and `app/admin/clients/page.tsx:32`.

### 7.4 Client Segment Logic — Duplicated Calculation

The logic to classify a client as "new", "active", "VIP", or "inactive" appears in `app/admin/clients/page.tsx` inside a `useMemo`. If a clients detail page or export feature needs the same classification, it will be re-implemented from scratch.

### 7.5 Supabase Auth Check Pattern

Three pages (`dashboard/page.tsx`, `login/page.tsx`, `register/page.tsx`) each implement their own `supabase.auth.getUser()` check with their own redirect logic. A shared `useAuth()` hook would centralize this.

---

## 8. Potential Bugs

### 8.1 `client_code` Collision Risk — `app/register/page.tsx:185`

```typescript
const client_code = `3X-${Math.floor(1000 + Math.random() * 9000)}`;
```

- Generates a code in the range `3X-1000` to `3X-9999` — only **9,000 possible values**.
- No uniqueness check against the database before inserting.
- Two concurrent registrations can produce the same code, causing a silent data conflict if there is no `UNIQUE` constraint on `client_code` in Supabase, or a hard insert error if there is.
- `Math.random()` is not cryptographically random.

**Fix:** Query for an unused code in a loop, or use a UUID-derived code with a database sequence.

### 8.2 Telegram API Errors Silently Ignored — `app/api/telegram/route.ts:26`

```typescript
const res = await fetch(`https://api.telegram.org/...`, { ... });
return Response.json({ ok: true }); // Always returns ok: true
```

The response from the Telegram API (`res`) is fetched but never checked. If Telegram returns an error (invalid token, chat not found, rate limited), the route returns `{ ok: true }` anyway. The contact form will show success to the user even when the message was never delivered.

**Fix:** Check `res.ok` and propagate errors to the caller.

### 8.3 Admin Dashboard `weeklyStats` Computed Outside `useMemo` — `app/admin/page.tsx:264`

```typescript
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

const weeklyStats = {
  shipments: shipments.filter(...).length,
  ...
};
```

`weeklyStats` is defined at the component's top level but outside any `useMemo`. It recomputes on every render, not just when `shipments` changes. The `stats` and `activeBatches` variables above it are correctly wrapped in `useMemo` — `weeklyStats` was missed.

### 8.4 No Loading State for Admin Stats Causing Flash — `app/admin/shipments/page.tsx`

The `stats` object (total, active, ready, etc.) starts as `emptyStats` (all zeros). On initial load, the KPI cards flash zero counts before data arrives. There is a `statsLoading` flag defined but it is not used to conditionally render a skeleton — the zeros are shown directly.

### 8.5 Auth State Race Condition — `app/dashboard/page.tsx:72`

```typescript
const { data: authData } = await supabase.auth.getUser();
if (!authData.user) {
  router.push("/login");
  return;
}
```

The session check is performed asynchronously inside `useEffect`. Between component mount and the auth check completing, the component briefly renders with `loading: true` and `client: null`. If any child component renders before the check is done and doesn't handle `client === null`, it will throw.

More critically, there is no equivalent check on any admin page — the admin area renders immediately with no auth verification at all.

### 8.6 `fetch` in Register Not Awaited for Error Handling — `app/register/page.tsx:211`

```typescript
await fetch("/api/telegram", {
  method: "POST",
  ...
  body: JSON.stringify({ name, phone, message }),
});
```

The Telegram notification after registration is awaited but its result is not checked. A failure here (e.g., Telegram down) does not affect the success flow, which is arguably correct behavior — but if this call throws (network error), it will propagate up and show a generic error to a user who has already been registered successfully.

**Fix:** Wrap in a try/catch and log the error without blocking the registration success flow.

---

## 9. Security Issues

> Issues are listed by severity.

### 9.1 CRITICAL — No Authentication on Admin Routes

**File:** `app/admin/layout.tsx`

```typescript
export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
```

The admin layout renders `AdminShell` with no authentication check. There is no Next.js middleware (`middleware.ts`) in the project. Any unauthenticated visitor who navigates to `/admin` or any sub-route will see the full admin CRM interface and can interact with all admin functionality.

**Fix:** Create `middleware.ts` at the project root to verify the Supabase session cookie and redirect to `/login` for any request to `/admin/*`.

### 9.2 CRITICAL — No Role-Based Access Control

Even if auth is added to the admin layout, the `supabase` client used in admin pages is the same anon-key client used for the public site and user dashboard. There is no concept of an admin role being checked before executing privileged operations (bulk status updates, deleting shipments, viewing all client data).

**Fix:** Implement a Supabase service role key on the server side for admin operations, or configure RLS policies with role-based checks on the `auth.users` metadata.

### 9.3 HIGH — Telegram API Route Has No Authentication or Rate Limiting

**File:** `app/api/telegram/route.ts`

```typescript
export async function POST(req: Request) {
  const { name, phone, message } = await req.json();
  // No auth, no rate limit, no validation
  ...
}
```

- Any client can POST to `/api/telegram` without authentication.
- No rate limiting: an attacker can flood the Telegram bot with thousands of messages at no cost to themselves.
- No input length validation: a very long `message` will be forwarded verbatim to Telegram (Telegram has a 4096-character limit; exceeding it causes a silent failure with no error handling — see Bug 8.2).

**Fix:** Add rate limiting (e.g., by IP using a middleware or Upstash Redis), validate input lengths, and require a CSRF token or honeypot field on the contact form.

### 9.4 HIGH — Weak Client Code Generation

**File:** `app/register/page.tsx:185`

```typescript
const client_code = `3X-${Math.floor(1000 + Math.random() * 9000)}`;
```

- Only 9,000 unique codes possible.
- `Math.random()` is not cryptographically secure.
- No database uniqueness check before insert (see Bug 8.1).

If a client code is guessed or collides, an attacker could query shipments using that code, since shipments are filtered by `client_code` without verifying ownership in the dashboard.

**Fix:** Use `crypto.randomUUID()` for part of the code, or a database sequence with sufficient entropy. Always verify uniqueness before committing.

### 9.5 HIGH — Dashboard Shipment Query Trusts `client_code` from Database

**File:** `app/dashboard/page.tsx:94`

```typescript
const { data: shipmentData } = await supabase
  .from("shipments")
  .select("*")
  .eq("client_code", clientData.client_code)
```

The shipment query filters by `client_code`. If an authenticated user somehow modifies their `client_code` in the `clients` table (which would be possible if RLS on the `clients` table allows self-updates without restrictions), they could view any other client's shipments.

**Fix:** Filter shipments by `user_id` (joining via `clients.user_id`) rather than the human-readable `client_code`. This ties data access to the authenticated identity rather than a guessable string.

### 9.6 MEDIUM — Hardcoded Operational Data in Source Code

**File:** `app/dashboard/page.tsx:410, 432`

```typescript
"+8615739538448"  // Chinese warehouse phone number
"环市西路宇宙鞋城D543A档口"  // Chinese warehouse address
```

Warehouse contact details and physical address are hardcoded in the source. If the warehouse changes, a code deployment is required. More importantly, this data is now version-controlled and visible to anyone with repository access.

**Fix:** Move operational data (warehouse address, phone, price per kg, etc.) to a Supabase configuration table, or at minimum to environment variables.

### 9.7 MEDIUM — Supabase Storage URLs Hardcoded in Client Code

**File:** `app/dashboard/page.tsx:391`

```typescript
src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/site-images/..."
```

The Supabase project reference ID (`grrwtedzdbxtkaodfvvd`) is hardcoded in the source. Combined with the fact that the `NEXT_PUBLIC_SUPABASE_URL` variable already exposes this, it is not a secret — but it does create maintenance issues if the Supabase project is migrated.

**Fix:** Use `process.env.NEXT_PUBLIC_SUPABASE_URL` to construct storage URLs dynamically.

### 9.8 LOW — No Content Security Policy

The `next.config.ts` file is empty. No HTTP security headers (CSP, HSTS, X-Frame-Options, etc.) are configured.

**Fix:** Add `headers()` in `next.config.ts` to set appropriate security headers.

### 9.9 LOW — No CSRF Protection on Forms

All POST actions go directly to Supabase (via client SDK) or to `/api/telegram`. Neither uses CSRF tokens. Supabase's SDK includes some protection via the Bearer token pattern, but the Telegram route is fully open.

---

## 10. Performance Issues

### 10.1 All Shipments Loaded for Admin Dashboard Stats

**File:** `app/admin/page.tsx:78`

```typescript
const { data, error } = await supabase
  .from("shipments")
  .select("*")
  .order("created_at", { ascending: false });
// No .limit() — fetches ALL rows
```

The admin home page fetches every shipment row to compute KPI counts. At 1,000 shipments this is slow; at 10,000+ it will time out or cause memory issues in the browser.

**Fix:** Use Supabase's aggregate functions or separate count queries per status. Alternatively, a PostgreSQL view or RPC function should return pre-aggregated stats.

### 10.2 `weeklyStats` Recalculates on Every Render

**File:** `app/admin/page.tsx:264`

```typescript
const weeklyStats = {
  shipments: shipments.filter(...).length,
  completed: shipments.filter(...).length,
  ...
};
```

This object is computed at render time outside `useMemo`. It runs on every state change (e.g., typing in the search box triggers a re-render, which re-filters all shipments unnecessarily).

**Fix:** Wrap in `useMemo(() => ..., [shipments])`.

### 10.3 Batch Statistics Computed by In-Memory Group-By

**File:** `app/admin/page.tsx:116` and `app/admin/batches/page.tsx`

Active batches are determined by loading all shipments and grouping them in memory:

```typescript
const activeBatches = useMemo(() => {
  return batchOptions.filter((batch) => {
    const batchShipments = shipments.filter((s) => s.batch_code === batch);
    return !batchShipments.every((s) => s.status === "completed");
  });
}, [batchOptions, shipments]);
```

This is an O(n × m) operation (shipments × batches) done in JavaScript after transferring all data over the network.

**Fix:** Use a Supabase RPC function or a JOIN query that returns batch-level aggregates directly from the database.

### 10.4 No Pagination on Admin Dashboard Shipment Load

The admin home page has no pagination on its shipment load (see 10.1). The shipments page (`admin/shipments/page.tsx`) does implement pagination (20 per page) for the list view, but the dashboard's stats query bypasses this entirely.

### 10.5 Supabase Storage Images Have No Dimensions or Lazy Loading

**File:** `app/dashboard/page.tsx:390`

```typescript
<img
  src="https://grrwtedzdbxtkaodfvvd.supabase.co/..."
  alt="Pinduoduo address form"
  className="w-full rounded-3xl"
/>
```

Four instruction images (for Pinduoduo, Taobao, 1688, Poizon) are loaded without:
- `width` and `height` attributes → causes Cumulative Layout Shift (CLS)
- `loading="lazy"` → eagerly loads all four images on page load
- Next.js `<Image>` component → bypasses Next.js image optimization entirely

**Fix:** Replace `<img>` with Next.js `<Image>` from `next/image`. Add `width`, `height`, and configure the Supabase storage domain in `next.config.ts` under `images.remotePatterns`.

### 10.6 `"use client"` on Every Page Disables RSC Benefits

Every page in the app is marked `"use client"` due to using `useState`/`useEffect`. This sends the full component JavaScript bundle to the browser and runs all initial data fetches client-side (adding an extra network round-trip after page load).

The admin pages in particular should be Server Components that fetch data on the server and pass it as props to interactive client components.

### 10.7 No Memoization on Large Rendered Lists

Shipment rows in the admin list are re-rendered on every filter/search state change. With 20–100 rows in the DOM simultaneously and no `React.memo` on row components, this creates unnecessary reconciliation work.

---

## 11. Technical Debt

### 11.1 No Type Definitions File

Every page that uses `Shipment`, `Client`, or `Batch` declares its own local `type` definition. These types are slightly inconsistent across files (some include fields others omit). There is no `lib/types.ts` or `lib/database.types.ts`.

**Priority:** High — this is the fastest win for code maintainability.

### 11.2 No Shared Constants File

Status options, status maps, price per kg (`2.8`), and other business constants are scattered across files. A single `lib/constants.ts` would eliminate duplication and make configuration changes trivial.

### 11.3 No Tests

There are zero test files in the project. No unit tests, no integration tests, no Playwright end-to-end tests. Critical paths — registration, shipment creation, auth redirect — are entirely untested.

### 11.4 No Error Boundaries

No React error boundaries exist. A runtime error in any component (e.g., a null access during data loading) will crash the entire page with a white screen and no recovery path.

### 11.5 No Error Monitoring

All errors are handled with `console.error()`. There is no integration with Sentry, LogRocket, or any other error tracking service. Production errors are invisible unless someone is watching the browser console.

### 11.6 Inconsistent Code Formatting

Some files use 2-space indentation, others use 4-space. State declarations and function definitions are sometimes inside the component and sometimes outside, inconsistently. A configured Prettier would normalize this.

### 11.7 TypeScript Strictness Not Maximized

`tsconfig.json` has `"strict": true` but does not enable:
- `"noUnusedLocals": true` — would catch unused imports (see Dead Code section)
- `"noUnusedParameters": true`

These two flags alone would surface several issues automatically.

### 11.8 `xlsx` Package Security Risk

The `xlsx` (SheetJS) package at `^0.18.5` is the **community edition** that was archived in 2023. The package has known CVEs and is no longer maintained at this version. The project uses it to parse user-uploaded Excel files for bulk shipment import.

**Fix:** Upgrade to the Pro edition (`xlsx` → `@e965/xlsx` or `exceljs`), or migrate to `exceljs` which is actively maintained.

### 11.9 No Environment Validation at Startup

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing or empty, the Supabase client will silently receive `undefined` (the `!` assertion suppresses TypeScript errors). The app will boot but fail at runtime with confusing messages.

**Fix:** Add a startup validation (e.g., using `zod` or a simple guard) that throws a clear error during build if required env vars are missing.

### 11.10 `lucide-react` at Version 1.14.0

`lucide-react@1.14.0` is a non-standard version number — the published package versions on npm follow a `0.x.x` pattern (e.g., `0.474.0`). This may be a misconfigured version pinning. Verify the installed package is the intended one.

---

## 12. Summary Table

| # | Category | Issue | Severity | Effort to Fix |
|---|----------|-------|----------|--------------|
| 9.1 | Security | No auth on `/admin/*` routes | 🔴 Critical | Medium |
| 9.2 | Security | No RBAC — anon key used for admin ops | 🔴 Critical | High |
| 9.3 | Security | Telegram route: no auth, no rate limit | 🟠 High | Low |
| 9.4 | Security | Weak `client_code` generation | 🟠 High | Low |
| 9.5 | Security | Shipment query trusts `client_code` over `user_id` | 🟠 High | Low |
| 8.1 | Bug | `client_code` collision, no uniqueness check | 🟠 High | Low |
| 8.2 | Bug | Telegram API errors silently swallowed | 🟡 Medium | Low |
| 8.3 | Bug | `weeklyStats` outside `useMemo` | 🟡 Medium | Low |
| 10.1 | Performance | All shipments loaded for stats | 🟡 Medium | Medium |
| 10.5 | Performance | Images lack dimensions and lazy loading | 🟡 Medium | Low |
| 10.6 | Performance | All pages are client components | 🟡 Medium | High |
| 9.6 | Security | Hardcoded warehouse address/phone | 🟡 Medium | Low |
| 9.8 | Security | No security headers | 🟡 Medium | Low |
| 7.1 | Debt | `statusOptions`/`statusMap` duplicated in 5+ files | 🔵 Low | Low |
| 7.2 | Debt | `Shipment` type duplicated in 4+ files | 🔵 Low | Low |
| 5.2 | Debt | 15 admin menu items link to non-existent pages | 🔵 Low | Low |
| 6.2 | Debt | Inline `EyeIcon` component in register page | 🔵 Low | Low |
| 11.8 | Debt | `xlsx` package archived, has CVEs | 🔵 Low | Medium |
| 11.9 | Debt | No env var validation at startup | 🔵 Low | Low |
| 5.1 | Debt | Default Next.js placeholder files in `public/` | 🟢 Info | Trivial |

---

*End of audit report. No files were modified during this analysis.*

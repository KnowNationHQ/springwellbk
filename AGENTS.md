<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

# SpringWell Bank — Agent Guide

## Stack
- **Framework:** Next.js 16.3.3 (App Router)
- **Backend:** Convex (real-time DB + serverless functions)
- **Styling:** Tailwind CSS v4 + custom CSS in `globals.css`
- **UI:** Radix UI primitives, Lucide icons, custom components
- **Deploy:** Vercel (auto-deploys on push to `main`)

## Key Routes

### Public
- `/` — Homepage with hero, services, about, contact form
- `/login` — Customer/Admin login
- `/register` — New account registration (with photo upload, state/country)
- `/forgot-password` — Password reset flow

### Customer Portal (`/dashboard`)
- `/dashboard` — Main dashboard (balance, quick actions, transactions, card)
- `/transfer` — Dedicated transfer page (Domestic / International / Business)

### Admin Portal (`/admin`)
- `/admin` — Admin dashboard (user management, credit/debit, status, messages)
- `/admin/transfer` — Admin transfer page (Domestic / International / Business)

## Test Credentials
- **Customer:** `customer` / `Test123!@`
- **Admin:** `admin` / `Admin123!@`

## Architecture
- `convex/schema.ts` — DB schema (users, transactions, messages)
- `convex/auth.ts` — Auth mutations (login, register, transfer, updateProfile)
- `convex/admin.ts` — Admin mutations (creditDebit, transfer, updateUser, deleteUser)
- `convex/users.ts` — User queries/mutations
- `convex/transactions.ts` — Transaction queries
- `convex/messages.ts` — Message mutations
- `convex/email.ts` — SMTP email templates (welcome, OTP, reset) — needs env vars

## Key Components
- `bank-nav.tsx` — Responsive nav (3 rows: primary, logo bar, profile)
- `modal.tsx` — Centered modal (CSS in `.modal-overlay`/`.modal-box`)
- `toast.tsx` — Success notification (centered mobile, top-right desktop)
- `dashboard-footer.tsx` — Shared footer for all dashboards
- `profile-image-upload.tsx` — Avatar upload with Convex storage

## CSS Classes (globals.css)
- `.transfer-grid` — 3-col desktop, 1-col mobile
- `.form-row` — Side-by-side fields desktop, stacked mobile
- `.form-actions` — Button row (Cancel + Submit)
- `.page-container` — Overflow-x hidden wrapper
- `.modal-overlay` / `.modal-box` — Centered modal

## Conventions
- All modals centered on all devices (no bottom-sheet)
- Toast notifications for all success actions
- No comments in code
- Ponytail mode: full (shortest working diff)
- Greeting hardcoded as "Hello, Springwell"

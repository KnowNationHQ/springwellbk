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
- **Chat:** Smartsupp widget (lazy-loaded)

## Key Routes

### Public
- `/` — Homepage with hero, services, about, contact form
- `/login` — Customer/Admin login (show/hide password toggle)
- `/register` — New account registration (photo upload, state/country)
- `/forgot-password` — Password reset flow

### Customer Portal (`/dashboard`)
- `/dashboard` — Main dashboard (balance, quick actions, transactions, card, receipt download)
- `/transfer` — Dedicated transfer page (Domestic / International / Business)
- `/dashboard/pending` — Pending account activation page

### Admin Portal (`/admin`)
- `/admin` — Admin dashboard (user management, credit/debit, status, messages, password visibility)
- `/admin/transfer` — Admin transfer page (Domestic / International / Business)
- `/admin/frozen` — Frozen transfers management

## Test Credentials
- **Customer:** `customer` / `Test123!@`
- **Admin:** `admin` / `Admin123!@`

## Architecture
- `convex/schema.ts` — DB schema (users, transactions, loanApplications, messages, bankLinks)
- `convex/auth.ts` — Auth mutations (login, register, transfer, changePassword, updateProfile)
- `convex/admin.ts` — Admin mutations (creditDebit, transfer, updateUser, deleteUser, status, backdate)
- `convex/users.ts` — User queries (list, listForAdmin, getByEmail, getByAccountNumber)
- `convex/transactions.ts` — Transaction queries (recent, getByUser)
- `convex/messages.ts` — Message mutations (send, list, setStatus)
- `convex/loanApplications.ts` — Loan submission and queries
- `convex/email.ts` — SMTP email templates (welcome, OTP, reset) — needs env vars
- `convex/seed.ts` — Database seeder (test accounts)

## Key Components
- `bank-nav.tsx` — Responsive nav (3 rows: primary, logo bar, profile)
- `modal.tsx` — Centered modal (CSS in `.modal-overlay`/`.modal-box`)
- `toast.tsx` — Success notification (centered mobile, top-right desktop)
- `dashboard-footer.tsx` — Shared footer for all dashboards
- `profile-image-upload.tsx` — Avatar upload with Convex storage
- `receipt-modal.tsx` — Transaction receipt with Canvas API download (no html2canvas)
- `smartsupp-chat.tsx` — Lazy-loaded chat (interaction-based + 8s timer)
- `user-avatar.tsx` — User avatar display

## CSS Classes (globals.css)
- `.transfer-grid` — 3-col desktop, 1-col mobile
- `.form-row` — Side-by-side fields desktop, stacked mobile
- `.form-actions` — Button row (Cancel + Submit)
- `.page-container` — Overflow-x hidden wrapper
- `.modal-overlay` / `.modal-box` — Centered modal (max-height 90vh, overflow-y auto)

## Conventions
- All modals centered on all devices (no bottom-sheet)
- Toast notifications for all success actions
- No comments in code
- Ponytail mode: full (shortest working diff)
- Greeting hardcoded as "Hello, Springwell"
- Password show/hide: use native `<input>` with icon toggle (shadcn Input clips absolute children)
- Tailwind v4: arbitrary values like `max-w-[400px]` unreliable — use inline `style` instead
- Canvas API for receipt download (no html2canvas dependency)
- Smartsupp chat lazy-loaded on first user interaction (scroll/mousemove/touchstart/keydown) or 8s timeout
- Admin user cards: Show/Hide toggle for customer passwords via `users.listForAdmin` query

## Known Issues
- `npm run build` must pass 2x before every commit+deploy
- Git push sometimes hangs on network/credential issues (retry with longer timeout)
- No Python on machine — use Node.js Playwright (`npx playwright`) for testing
- Windows PowerShell: use `;` not `&&`, quote paths with parentheses

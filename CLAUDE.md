<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

# SpringWell Bank

Full-stack digital banking demo. Next.js 16 (App Router) + Convex + Tailwind CSS v4.

## Quick Reference

- **Customer login:** `customer` / `Test123!@`
- **Admin login:** `admin` / `Admin123!@`
- **Deploy:** Push to `main` (Vercel auto-deploy), then `npx convex deploy` for backend
- **Build:** `npm run build` must pass 2x before every commit

## Project Layout

- `src/app/(auth)/` — login, register, forgot-password
- `src/app/(dashboard)/dashboard/` — customer dashboard + pending page
- `src/app/(dashboard)/transfer/` — customer transfer
- `src/app/(dashboard)/admin/` — admin dashboard, transfer, frozen
- `convex/` — schema, auth, admin, users, transactions, messages, loanApplications, email

## Conventions

- No comments in code
- Password show/hide: native `<input>` + icon toggle (not shadcn Input wrapper)
- Tailwind v4: use inline `style` for max-width (arbitrary values unreliable)
- Receipt download: Canvas API (no html2canvas)
- Smartsupp chat: lazy-loaded on interaction or 8s timeout
- Windows PowerShell: `;` not `&&`, quote paths with parentheses
- All modals centered on all devices

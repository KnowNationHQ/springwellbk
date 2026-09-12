# SpringWell Bank

> Modern, secure online banking — open an account in minutes, manage balances, move money, and apply for loans from any device.

SpringWell Bank is a full-stack digital banking platform that delivers a responsive, mobile-first experience for both **customers** and **bank administrators**. It pairs a polished Next.js front end with a real-time Convex backend and ships continuously to Vercel.

---

## About

SpringWell Bank is a demonstration digital bank that mirrors the core experience of a modern retail bank: account onboarding, live dashboards with balances and transaction history, peer-to-peer transfers, spending insights, loan applications, and an administrative console for staff to manage customers, balances, and approvals.

The product is designed mobile-first — every page and admin tool adapts cleanly from a 360px phone to a desktop, with card-based layouts on small screens and dense tables on large ones.

**Live site:** [https://springwellbk.vercel.app](https://springwellbk.vercel.app)

---

## Features

### Customers (`/dashboard`)
- **Account overview** — branded bank card, masked account number, live balance and available credit.
- **Transactions** — chronological history with running detail, credits and debits.
- **Receipt download** — downloadable transaction receipt with SpringWell branding (Canvas API, no external dependencies).
- **Peer-to-peer transfers** — send funds to another customer by email, with balance validation and atomic ledger updates.
- **Spending summary** — money in vs. money out with a proportional visual breakdown from real transaction data.
- **Activity center** — quick shortcuts to transfer funds, apply for a loan, and more.
- **Profile & security** — update profile details, upload avatar, and change password with show/hide toggle.

### Administrators (`/admin`)
- **Portfolio stats** — total customers, active accounts, aggregate balance, pending loans, unread messages.
- **Account actions** — credit/debit balances, initiate fund transfers, activate or suspend accounts.
- **Customer management** — searchable card-based list with inline edit, role toggle, and status control.
- **Password visibility** — Show/Hide toggle on each customer card to reveal or mask passwords.
- **Transaction history** — view per-user transaction history with backdate capability.
- **Frozen transfers** — manage pending frozen transfers with completion workflow.
- **Loan & message oversight** — review loan applications and support messages.

### Public site
- Marketing homepage (hero, promotions, services, about, rates, contact).
- Self-service **loan application** flow.
- Authentication: **register** (with photo upload), **login** (with show/hide password), and **forgot password**.
- **Live chat** via Smartsupp widget (lazy-loaded on user interaction).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, shadcn/ui, Radix UI, Tailwind CSS v4 |
| Backend | Convex (real-time database, queries, mutations, crons) |
| Integrations | Smartsupp (live chat), Plaid (account sync scaffolding) |
| Icons | lucide-react |
| Hosting | Vercel (front end) + Convex (backend) |

---

## Project Structure

```
src/
  app/
    (main)/              # Public site: home, loan
    (auth)/              # register, login, forgot-password
    (dashboard)/
      dashboard/         # Customer dashboard + pending page
      transfer/          # Customer transfer (Domestic / International / Business)
      admin/             # Admin dashboard, transfer, frozen transfers
  components/
    layout/              # bank-nav, header, footer, dashboard-footer
    sections/            # Homepage sections (hero, promos, services, about, etc.)
    ui/                  # shadcn/ui primitives (button, card, modal, toast, etc.)
    receipt-modal.tsx    # Transaction receipt with Canvas API download
    smartsupp-chat.tsx   # Lazy-loaded Smartsupp chat widget
    profile-image-upload.tsx  # Avatar upload with Convex storage
    user-avatar.tsx      # User avatar display component
convex/
  schema.ts              # Data model (users, transactions, loanApplications, messages, bankLinks)
  auth.ts                # Auth mutations (login, register, transfer, changePassword, updateProfile)
  users.ts               # User queries (list, listForAdmin, getByEmail, getByAccountNumber)
  transactions.ts        # Transaction queries (recent, getByUser)
  admin.ts               # Admin mutations (creditDebit, transfer, updateUser, deleteUser, status)
  messages.ts            # Message mutations (send, list, setStatus)
  loanApplications.ts    # Loan submission and queries
  email.ts               # SMTP email templates (welcome, OTP, reset)
  seed.ts                # Database seeder (test accounts)
  crons.ts               # Scheduled tasks
  plaid.ts / plaidSync.ts  # Plaid integration scaffolding
```

---

## Data Model

### Users
| Field | Type | Notes |
|---|---|---|
| username | string (optional) | Unique login identifier |
| email | string | Unique, indexed |
| password | string | Plain text (demo only) |
| firstName / lastName | string | Profile name |
| accountNumber | string | Auto-generated `SWB-XXXXXXXX` |
| accountType | checking / savings / business | |
| currency | USD / GBP / EUR | |
| balance | number | Primary balance |
| creditBalance | number (optional) | Credit line balance |
| status | active / suspended / pending | |
| role | customer / admin | |
| imageId | string (optional) | Convex storage file ID |

### Transactions
| Field | Type | Notes |
|---|---|---|
| userId | User ID | Owner of transaction |
| type | credit / debit / transfer | |
| amount | number | |
| status | successful / pending / failed | |
| counterpartyId | User ID (optional) | For transfers |
| backDate | string (optional) | Admin backdate |
| cotCode / bsacCode / vatCode | string (optional) | Fee codes |

---

## Getting Started

### Prerequisites
- Node.js 18.18+ (Node 20 LTS recommended)
- A free [Convex](https://convex.dev) account
- A [Vercel](https://vercel.com) account (for deployment)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the Convex backend (follow prompts to link/create a project)
npx convex dev

# 3. Run the Next.js app (in a second terminal)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test Credentials

| Role | Username | Password |
|---|---|---|
| Customer | `customer` | `Test123!@` |
| Admin | `admin` | `Admin123!@` |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Auto-generated by Convex; links the app to your backend. |
| `CONVEX_DEPLOY_KEY` | Used for CI/deploy-time `convex deploy`. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email sending (optional). |
| `PLAID_CLIENT_ID` / `PLAID_SECRET` / `PLAID_ENV` | Optional — only required if enabling Plaid sync. |

`.env.local` is gitignored and should never be committed.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Production build (must pass 2x before deploy). |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npx convex dev` | Run the Convex backend locally with hot reload. |
| `npx convex deploy` | Deploy the Convex backend to production. |

---

## Deployment

1. **Convex backend** — `npx convex deploy` (requires `CONVEX_DEPLOY_KEY`).
2. **Front end** — push to `main` for automatic Vercel deployments.
3. Verify at [https://springwellbk.vercel.app](https://springwellbk.vercel.app).

---

## Conventions

- All modals centered on all devices (no bottom-sheet pattern).
- Toast notifications for all success actions.
- No comments in code.
- Password show/hide uses native `<input>` with icon toggle (not shadcn Input wrapper).
- Tailwind v4: avoid arbitrary values like `max-w-[400px]` — use inline `style` instead.
- Canvas API for receipt download (no html2canvas dependency).
- Smartsupp chat lazy-loaded on first user interaction.

---

## License

This project is provided for demonstration and educational purposes.

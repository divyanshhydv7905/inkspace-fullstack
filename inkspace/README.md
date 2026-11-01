# InkSpace — AI-Powered Editorial & Blog Management Platform

InkSpace is a full-stack editorial publishing platform and content governance workspace built with **Next.js (App Router)**, **TypeScript (Strict Mode)**, **Tailwind CSS**, **PostgreSQL + Prisma ORM**, **Auth.js**, **Tiptap**, and the **Anthropic Claude SDK**.

---

## 1. Architecture Overview

- **Public Digital Magazine (`/`, `/articles`, `/articles/[slug]`, `/categories/[slug]`, `/search`)**: Minimalist, typography-first editorial experience (`#FAF9F6` warm ivory paper, `#191919` charcoal ink, `#2D4A3E` muted forest green accent, Playfair Display + Inter typography). Only `PUBLISHED` articles are exposed on public pages and search endpoints.
- **Writer Workspace (`/dashboard`)**: Role-protected environment for composing essays with Tiptap rich-text formatting, debounced autosave with stale-write protection (`clientUpdatedAt`), slug collision resolution, revision snapshots (`ArticleRevision`), AI Writing Copilot, and AI SEO Assistant.
- **Administrator Governance Console (`/admin`)**: Server-enforced RBAC + ABAC moderation queue, article inspection with AI Editorial Quality & Moderation assessments, state-machine-verified review actions (`APPROVE`, `PUBLISH`, `REQUEST_CHANGES`, `REJECT`, `ARCHIVE`, `UNPUBLISH`), mandatory feedback validation, in-app author notifications, user role/status governance with self-lockout protection, and immutable `AuditLog` tracking.

---

## 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required and optional variables:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Auth.js encryption secret (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical base URL (e.g., `http://localhost:3000`) |
| `ANTHROPIC_API_KEY` | Optional | Server-only Anthropic Claude API key (`sk-ant-...`). When omitted, InkSpace runs normally and displays a clear configuration notice on AI actions. |
| `ANTHROPIC_MODEL` | Optional | Defaults to `claude-sonnet-4-20250514` |
| `INITIAL_ADMIN_EMAIL` | Bootstrap only | Target email for the CLI administrator bootstrap script |
| `INITIAL_ADMIN_PASSWORD` | Bootstrap only | Strong password (min 12 chars, upper, lower, digit) for bootstrap |

---

## 3. Installation, Database Migration & Startup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client and run PostgreSQL migrations
npx prisma generate
npx prisma migrate dev

# 3. Seed demonstration categories, tags, and fictional articles
npm run db:seed

# 4. Provision your Administrator account securely (never hardcoded in seed)
INITIAL_ADMIN_EMAIL="admin@yourdomain.com" INITIAL_ADMIN_PASSWORD="StrongAdminPassword2026!" npm run admin:bootstrap

# 5. Start the development server
npm run dev
```

---

## 4. Configuring Anthropic Claude AI

1. Create an API key in the [Anthropic Console](https://console.anthropic.com/).
2. Add `ANTHROPIC_API_KEY="sk-ant-..."` to your server `.env` file (never expose it in `NEXT_PUBLIC_*`).
3. All AI requests run exclusively on the server via `src/lib/ai/client.ts`, wrap article content in `<untrusted_article_content>` delimiters to prevent prompt injection, enforce per-user rate limits, and validate responses through strict Zod schemas (`src/lib/ai/schemas.ts`).

---

## 5. Running Tests & Production Build

```bash
# Run core unit & integration verification suite
npm test

# Run Vitest unit & integration suites
npm run test:unit
npm run test:integration

# Run Playwright E2E suite
npm run test:e2e

# Typecheck & Production Build
npm run typecheck
npm run build
```

---

## 6. Deployment (Vercel + Managed PostgreSQL)

1. Provision a managed PostgreSQL database (Neon, Supabase, RDS, or Vercel Postgres).
2. Configure `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `ANTHROPIC_API_KEY` in Vercel Project Settings.
3. Set the Vercel build command to `npx prisma migrate deploy && npm run build`.
4. Run the administrator bootstrap once against your production database using `npm run admin:bootstrap`.

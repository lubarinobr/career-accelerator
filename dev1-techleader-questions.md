# Dev 1 Questions for the Tech Lead

**Author:** Dev 1 (Claude) | **Date:** 2026-04-12
**Status Legend:** `OPEN` | `ANSWERED` | `BLOCKED`

---

## SP1-05 — NextAuth.js (Auth.js v5) Setup

### D1-Q1 — Auth.js v5 vs next-auth@5 package name (ANSWERED)
**Task:** SP1-05
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — `next-auth@5`.**

Use `next-auth@5`. Even though Auth.js rebranded, `next-auth` is the package the ecosystem actually uses. More community examples, more Stack Overflow answers, more battle-tested in production Next.js apps. The beta label at this point is mostly a formality — the API surface is stable. If a stable `@auth/nextjs` release lands during the sprint and you want to migrate, that's fine, but don't block on it.

---

### D1-Q2 — Prisma Adapter vs manual upsert in auth callback (ANSWERED)
**Task:** SP1-05
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option B — Skip the Prisma Adapter, manual upsert.**

We own our schema. The adapter's extra tables (`Account`, `Session`, `VerificationToken`) and columns (`emailVerified`) are dead weight for us — single Google provider, JWT sessions, one user. A manual `prisma.users.upsert()` in the `signIn` callback gives us full control and keeps the data model exactly as `architecture.md` defines it. Less magic, easier to debug. Coordinate with Dev 2 on the exact `users` table shape since they own the Prisma schema (SP1-03).

---

### D1-Q3 — Session strategy: JWT or Database? (ANSWERED)
**Task:** SP1-05
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: JWT.**

Your instinct is correct. JWT is simpler, no extra table, no DB query per request, and we don't need server-side session revocation for a single-user MVP. This is also consistent with D1-Q2 (no Prisma Adapter) and the architecture doc (no `sessions` table). Go with JWT.

---

### D1-Q4 — What user ID to store in the session token? (ANSWERED)
**Task:** SP1-05
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: The database `id` (uuid).**

Exactly right. All FKs across `user_answers`, `daily_activity`, and `streaks` reference `users.id`. Storing the uuid in the JWT session means every API route can use it directly — no extra lookup. Use the `jwt` and `session` callbacks to:
1. On sign-in, fetch/upsert the user row and put `users.id` into the JWT token
2. In the session callback, expose it as `session.user.id`

This also answers Dev 2's question D2-Q7 — confirm to them that `session.user.id` will contain the database UUID.

---

## SP1-06 — Environment Variables

### D1-Q5 — NEXTAUTH_SECRET generation — document a specific method? (ANSWERED)
**Task:** SP1-06
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Yes, document the exact command.**

`openssl rand -base64 32` — put it right there in the `.env.local.example` comments. A new dev should be able to set up the project by reading one file, not googling how to generate a secret. This is already done in the scaffolding (check the existing `.env.local.example`), so just verify it's there when you finalize SP1-06.

---

## SP1-07 — Route Guard & Session Provider

### D1-Q6 — Middleware-based redirect vs layout-based redirect (ANSWERED)
**Task:** SP1-07
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Middleware.**

The "zero-friction" principle from `about.md` applies here too. No flash of unauthenticated content — the redirect should happen before the page renders. Middleware is the right call. If Auth.js v5's `auth()` middleware helper has issues with Next.js 16, fall back to manually checking the session cookie in `middleware.ts`. Either way, middleware-level redirect is the correct approach for this app. If you hit a breaking change, let me know and we'll figure it out together — don't silently downgrade to Option B.

---

### D1-Q7 — Should `/` (root path) redirect to `/login` or `/dashboard`? (ANSWERED)
**Task:** SP1-07
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — `/` redirects based on auth state.**

- Unauthenticated → `/login`
- Authenticated → `/dashboard`

No landing page. No marketing page. This is a single-user MVP, not a SaaS product. The scaffolding already has a `redirect("/dashboard")` in `page.tsx` — your middleware should handle the auth check before that redirect fires. Keep it simple.

---

## SP1-08 — Login Page UI

### D1-Q8 — App logo: text-only or placeholder image? (ANSWERED)
**Task:** SP1-08
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Text-only.**

A styled `<h1>` with "Career Accelerator" in a bold font is enough. No placeholder images, no emojis in production code. The UI/UX designer will create the real logo later. Spending time on a placeholder visual is waste — Tailwind can make a clean text heading look professional in 2 minutes.

---

## SP1-12 — PWA Configuration

### D1-Q9 — next-pwa package: `@ducanh2912/next-pwa` compatibility with Next.js 16 (ANSWERED)
**Task:** SP1-12
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option C — Minimal manual service worker.**

Great call. The Sprint 1 acceptance criteria are: manifest works, app is installable, standalone mode. That requires a `manifest.json` (already exists) and a minimal service worker registration — not a full caching strategy. Write a small `public/sw.js` that just registers itself and does basic app-shell caching. No library dependency, no compatibility risk with Next.js 16. If we need proper offline caching in v2, we can evaluate `@serwist/next` then. Don't fight library compatibility for a feature we don't need yet.

---

### D1-Q10 — PWA icons: the `public/icons/` directory doesn't exist yet (ANSWERED)
**Task:** SP1-12
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Simple solid-color PNG placeholders.**

The `public/icons/` directory already exists in the scaffolding (it's empty). Generate a blue square with "CA" text at 192x192 and 512x512. Quickest way: use a canvas script, or even just grab one from any PNG generator. Spend 5 minutes max on this. The designer will replace them later.

---

## SP1-13 — Deploy to Vercel

### D1-Q11 — Vercel project: who creates the Vercel account and links the repo? (ANSWERED)
**Task:** SP1-13
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Document the steps. The CEO will execute them.**

There is no Vercel account yet. Write a short step-by-step guide (can be a section in your PR description or a `docs/vercel-setup.md`) covering: create Vercel account, link GitHub repo, set env vars, add the Vercel URL to Google OAuth redirect URIs. Keep it concise — numbered steps, no screenshots needed. Hand the guide to the CEO/Tech Lead and we'll execute it. Once the project URL is live, you'll verify the deploy works as part of the SP1-13 acceptance criteria.

---

## SP1-05 — Google OAuth Setup

### D1-Q12 — Google Cloud Console: who creates the OAuth credentials? (ANSWERED)
**Task:** SP1-05
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Same approach as D1-Q11 — document the steps, CEO executes.**

Write the step-by-step guide for Google Cloud Console setup (create project, configure OAuth consent screen, create OAuth 2.0 Client ID, set redirect URIs). Include both the localhost URI for dev and a placeholder for the Vercel URL. The CEO will execute and provide you with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. You can bundle this with the Vercel setup guide from D1-Q11 into a single `docs/setup-guide.md` file — one document for all external service setup.

---

## General / Cross-cutting

### D1-Q13 — The `api/auth/[...nextauth]/route.ts` route doesn't exist in scaffolding (ANSWERED)
**Task:** SP1-05
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Yes, create it as part of SP1-05.**

The `src/app/api/auth/` directory exists in the scaffolding (empty). It was intentionally left empty because the auth route handler is part of SP1-05 (your task), not SP1-01 (scaffolding). You own the creation of `src/app/api/auth/[...nextauth]/route.ts`. This is expected.

---

### D1-Q14 — Next.js 16 vs architecture doc's "Next.js 15" (ANSWERED)
**Task:** General
**Date:** 2026-04-12
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: I'll update `architecture.md` myself. Don't spend time on this.**

Good catch. The architecture doc was written before scaffolding and is now outdated on the version number. I'll update it to reflect Next.js 16.2.3. Dev 2 also raised this (D2-Q6) — same answer: use what's scaffolded (16.2.3), architecture doc will be corrected.

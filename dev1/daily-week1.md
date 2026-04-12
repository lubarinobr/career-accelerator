# Dev 1 — Week 1 Report

**Sprint:** Sprint 1 — Foundation
**Week:** 1 (2026-04-12)
**Dev:** Dev 1 (Claude)

---

## Day 1 — Saturday, 2026-04-12

### Onboarding & Questions

Started by reading all project documentation: `CLAUDE.md`, `about.md`, `features.md`, `architecture.md`, `roles.md`, `roadmap.md`, `kanban-sprint1.md`, `dev-workflow.md`, `test-plan-sprint1.md`, and `questions.md`.

Reviewed the full Sprint 1 kanban to understand my task assignments, dependencies, and sync points. Identified 14 specific questions for the Tech Lead before writing any code. Wrote them in `dev1-techleader-questions.md` with my recommendation for each. All 14 were answered the same day.

**Key decisions from Tech Lead:**
- Use `next-auth@5` (beta channel), not `@auth/nextjs`
- Skip Prisma Adapter, manual upsert in signIn callback
- JWT sessions (no sessions table)
- Store database UUID in session token as `session.user.id`
- Middleware-based route guard (not layout-level)
- Minimal manual service worker for PWA (no library)
- Text-only logo on login page
- Document Google Cloud + Vercel setup for CEO to execute

### Implementation

Dev 2 completed SP1-02, SP1-03, and SP1-04 (Supabase, Prisma schema, Prisma client) before I started — SYNC-1 was already cleared.

**SP1-05 — NextAuth.js (Auth.js v5) setup** — DONE
- Installed `next-auth@5.0.0-beta.30`
- Created `src/lib/auth.ts`: Google OAuth provider, JWT strategy, `prisma.user.upsert()` in signIn callback (upserts by `google_id`, sets defaults `total_xp=0`, `level=1`, `streak_freezes_available=0`), `jwt` callback fetches DB user ID, `session` callback exposes it as `session.user.id`
- Created `src/app/api/auth/[...nextauth]/route.ts`: exports GET and POST handlers from auth config
- Created `src/types/next-auth.d.ts`: augments Session type to include `user.id`

**SP1-06 — Environment variables template** — DONE
- `.env.local.example` already created by Dev 2 with all required vars. Verified it includes `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` (with `openssl rand -base64 32` command), `NEXTAUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `ANTHROPIC_API_KEY`. No changes needed.

**SP1-07 — Auth session provider & route guard** — DONE
- Created `src/middleware.ts`: checks auth via `auth()` from next-auth. Unauthenticated users on protected routes redirect to `/login`. Authenticated users on `/login` or `/` redirect to `/dashboard`. Matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `icons`, `sw.js`, `manifest.json`.
- Created `src/components/SessionWrapper.tsx`: client component wrapping `SessionProvider` from `next-auth/react`
- Updated `src/app/layout.tsx`: wrapped `<main>` with `<SessionWrapper>`
- Updated `src/app/page.tsx`: removed TODO comment, root still has `redirect("/dashboard")` as fallback (middleware handles auth check before this fires)
- **SYNC-2 delivered** — Dev 2 unblocked to start SP1-09

**SP1-08 — Login page UI** — DONE
- Rewrote `src/app/login/page.tsx`: client component with `signIn("google", { callbackUrl: "/dashboard" })`
- Text-only `<h1>` "Career Accelerator" (bold, `text-blue-800`), tagline "Master AWS in 5 minutes a day", single Google sign-in button with official "G" SVG logo
- Mobile-first centered card layout, Tailwind styling, clean appearance at 375px

**SP1-12 — PWA configuration** — DONE
- Created `public/sw.js`: minimal service worker with app-shell precaching (`/login`, `/dashboard`, `/quiz`), network-first with cache fallback on fetch. No external library.
- Created `src/components/ServiceWorkerRegister.tsx`: client component that registers `/sw.js` on mount
- Added `<ServiceWorkerRegister />` to root `layout.tsx`
- Generated placeholder blue PNG icons (192x192 and 512x512) in `public/icons/`
- `manifest.json` already existed from scaffolding with correct config

**docs/setup-guide.md** — DONE
- Wrote step-by-step guide for CEO covering: Google Cloud Console OAuth setup (project creation, consent screen, credentials, redirect URIs), Vercel deployment (account, repo link, env vars), Supabase connection string location, and local dev setup

### Build Verification

- `npm run build` — passes. All routes compile. Middleware detected.
- `npm run lint` — passes. No issues.

### Kanban Updates

Moved SP1-05, SP1-06, SP1-07, SP1-08, SP1-12 to DONE in `kanban-sprint1.md` with completion notes.

---

## Blockers

**SP1-13 (Deploy to Vercel)** is blocked on external actions:
- CEO needs to create Google Cloud OAuth credentials using `docs/setup-guide.md`
- CEO needs to create Vercel account and link the GitHub repo
- Once credentials and Vercel URL are available, I can verify the staging deploy and update Google OAuth redirect URIs

**SP1-14 (Smoke test)** is blocked on SP1-13 + Dev 2 completing SP1-09, SP1-10, SP1-11.

---

## Week 1 Summary

| Task | Status | Notes |
|:-----|:-------|:------|
| SP1-05 — NextAuth setup | DONE | Google OAuth, JWT, manual upsert |
| SP1-06 — Env vars template | DONE | Verified Dev 2's file, complete |
| SP1-07 — Route guard | DONE | Middleware approach, SYNC-2 delivered |
| SP1-08 — Login page | DONE | Text-only logo, mobile-first |
| SP1-12 — PWA config | DONE | Manual SW, placeholder icons |
| SP1-13 — Vercel deploy | BLOCKED | Waiting on CEO for accounts/credentials |
| SP1-14 — Smoke test | BLOCKED | Waiting on SP1-13 + Dev 2 tasks |
| docs/setup-guide.md | DONE | Google + Vercel setup for CEO |

**All code tasks for Week 1 are complete.** Waiting on external dependencies for deploy and smoke test.

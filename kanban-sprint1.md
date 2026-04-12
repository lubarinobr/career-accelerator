# Sprint 1 — Dev Kanban

**Sprint Goal:** A deployed skeleton app where a user can log in with Google and see their empty dashboard. All infrastructure working end-to-end.

**Sprint Duration:** 2 weeks (2026-04-14 to 2026-04-25)
**Team:** Dev 1 (Senior BE) | Dev 2 (Senior BE)
**Tech Lead:** Reviews all PRs, unblocks technical decisions

**Status Legend:** `TODO` | `DOING` | `READY TO TEST` | `DONE`

---

## Sync Points — READ THIS FIRST

There are **3 moments** where one dev must wait for the other. Everything else is parallel.

| Sync Point | Who waits | Who delivers | Trigger |
|:-----------|:----------|:-------------|:--------|
| **SYNC-1** | Dev 1 (SP1-05) | Dev 2 (SP1-04) | Dev 2 notifies Dev 1 when SP1-04 (Prisma client) is merged. Dev 1 cannot start SP1-05 (auth) until then. |
| **SYNC-2** | Dev 2 (SP1-09) | Dev 1 (SP1-07) | Dev 1 notifies Dev 2 when SP1-07 (route guard) is merged. Dev 2 cannot start SP1-09 (dashboard) until then. |
| **SYNC-3** | Both (SP1-14) | Both (SP1-11 + SP1-13) | Both devs must finish all their tasks before the joint smoke test. Last one to finish notifies the other. |

```
WEEK 1 — parallel start, sync at end
  Dev 1: SP1-01 ────────────────────→ (wait SYNC-1) ──→ SP1-05 → SP1-06
  Dev 2: SP1-02 → SP1-03 → SP1-04 → (notify SYNC-1)

WEEK 2 — sync at start, parallel middle, sync at end
  Dev 1: SP1-07 → (notify SYNC-2) → SP1-08 → SP1-12 → SP1-13 → (wait SYNC-3)
  Dev 2: (wait SYNC-2) ────────────→ SP1-09 → SP1-10 → SP1-11 → (wait SYNC-3)
  Both:                                                            SP1-14
```

---

## Week 1 — Infrastructure & Auth

### TODO

---

~~**SP1-01 — Project scaffolding**~~ **DONE**
- **Assignee:** Tech Lead (completed during scaffolding)
- **Priority:** P0
- **Completed:** 2026-04-12
- **Result:** Next.js 16.2.3, TypeScript (strict), Tailwind 4, ESLint 9, React 19. Full folder structure created. `npm run dev`, `npm run build`, `npm run lint` all pass. Placeholder files with TODO comments for every Sprint 1 and Sprint 2 task.

---

~~**SP1-02 — Supabase project setup**~~ **DONE**
- **Assignee:** Dev 2
- **Priority:** P0
- **Completed:** 2026-04-12
- **Region:** `eu-west-1` (Ireland) — `sa-east-1` unavailable on free tier. IPv4 requires Session Pooler connection.
- **Result:** Supabase project `career-accelerator` live. Connection string tested with Prisma. Session Pooler used for IPv4 compatibility.

---

~~**SP1-03 — Prisma setup & schema**~~ **DONE**
- **Assignee:** Dev 2
- **Priority:** P0
- **Completed:** 2026-04-12
- **Result:** Prisma 7.7.0 installed. All 5 tables defined in `prisma/schema.prisma` with `gen_random_uuid()` PKs, proper relations, composite unique on `daily_activity(user_id, activity_date)`, unique `user_id` on `streaks`. Migration `20260412201226_init` applied. Prisma 7 config in `prisma/prisma.config.ts` (replaces schema-level `url`/`directUrl`).

---

~~**SP1-04 — Prisma client singleton**~~ **DONE**
- **Assignee:** Dev 2
- **Priority:** P0
- **Completed:** 2026-04-12
- **SYNC-1: Dev 1 notified — unblocked to start SP1-05.**
- **Result:** `src/lib/db.ts` exports `prisma` singleton using Prisma 7 Driver Adapter pattern (`@prisma/adapter-pg` + `pg` Pool). Hot-reload safe via `globalThis`.

---

~~**SP1-05 — NextAuth.js (Auth.js v5) setup**~~ **DONE**
- **Assignee:** Dev 1
- **Priority:** P0
- **Completed:** 2026-04-12
- **Result:** `next-auth@5.0.0-beta.30` installed. `src/lib/auth.ts` with Google OAuth, JWT strategy, manual `prisma.user.upsert()` in signIn callback (no Prisma Adapter). `src/app/api/auth/[...nextauth]/route.ts` created. Session exposes `user.id` (database UUID). Type augmentation in `src/types/next-auth.d.ts`. Google Cloud Console setup documented in `docs/setup-guide.md`.

---

~~**SP1-06 — Environment variables template**~~ **DONE**
- **Assignee:** Dev 1 + Dev 2
- **Priority:** P0
- **Completed:** 2026-04-12
- **Result:** `.env.local.example` exists with all required vars (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `ANTHROPIC_API_KEY`), redirect URI examples, and `openssl` command for secret generation. Dev 2 created the initial file; Dev 1 verified completeness.

---

### DOING
_No tasks in progress._

### READY TO TEST
_No tasks ready for testing._

### DONE
- **SP1-01** — Project scaffolding (Tech Lead, 2026-04-12)
- **SP1-02** — Supabase project setup (Dev 2, 2026-04-12)
- **SP1-03** — Prisma setup & schema (Dev 2, 2026-04-12)
- **SP1-04** — Prisma client singleton (Dev 2, 2026-04-12) — **SYNC-1 delivered**
- **SP1-05** — NextAuth.js setup (Dev 1, 2026-04-12)
- **SP1-06** — Environment variables template (Dev 1 + Dev 2, 2026-04-12)

---

## Week 2 — UI Shells, PWA & Deploy

### TODO

---

~~**SP1-07 — Auth session provider & route guard**~~ **DONE**
- **Assignee:** Dev 1
- **Priority:** P1
- **Completed:** 2026-04-12
- **SYNC-2: Dev 2 notified — unblocked to start SP1-09.**
- **Result:** `src/middleware.ts` with auth-based redirects (middleware approach per Tech Lead D1-Q6). Unauthenticated → `/login`, authenticated on `/login` or `/` → `/dashboard`. `SessionProvider` wrapper in `src/components/SessionWrapper.tsx`, applied in root `layout.tsx`. Matcher excludes static assets, sw.js, manifest.

---

~~**SP1-08 — Login page UI**~~ **DONE**
- **Assignee:** Dev 1
- **Priority:** P1
- **Completed:** 2026-04-12
- **Result:** `src/app/login/page.tsx` — mobile-first centered card with text-only "Career Accelerator" heading (bold, blue-800), tagline, Google sign-in button with official Google "G" SVG. Uses `signIn("google", { callbackUrl: "/dashboard" })`. Styled with Tailwind. Renders cleanly at 375px.

---

~~**SP1-09 — Dashboard page (shell)**~~ **DONE**
- **Assignee:** Dev 2
- **Priority:** P1
- **Completed:** 2026-04-12
- **Result:** `src/app/dashboard/page.tsx` — server component using `auth()` to get session. Shows user name + Google avatar (via `next/image` with `lh3.googleusercontent.com` in `next.config.ts`). 3 placeholder stat cards: Streak (0), XP (0), Level (Intern). Mobile-friendly grid layout with `pb-20` for bottom nav clearance.

---

~~**SP1-10 — Bottom navigation bar**~~ **DONE**
- **Assignee:** Dev 2
- **Priority:** P2
- **Completed:** 2026-04-12
- **Result:** `src/components/BottomNav.tsx` — client component using `usePathname()` for active state. Fixed bottom bar with Dashboard and Quiz tabs. SVG outline icons (Heroicons-style). Active tab highlighted in blue-600, inactive in gray-400. Included in both `/dashboard` and `/quiz` pages.

---

~~**SP1-11 — Quiz page (empty shell)**~~ **DONE**
- **Assignee:** Dev 2
- **Priority:** P2
- **Completed:** 2026-04-12
- **SYNC-3: Dev 2 tasks complete. Dev 1 — waiting on SP1-13 (deploy) for joint smoke test.**
- **Result:** `src/app/quiz/page.tsx` — server component with auth guard. Placeholder icon + "Coming in Sprint 2" message. Bottom nav included and links correctly.

---

~~**SP1-12 — PWA configuration**~~ **DONE**
- **Assignee:** Dev 1
- **Priority:** P1
- **Completed:** 2026-04-12
- **Result:** Minimal manual service worker (`public/sw.js`) per Tech Lead D1-Q9 — no library dependency. Registers via `src/components/ServiceWorkerRegister.tsx` (client component). `manifest.json` already existed from scaffolding. Placeholder blue icons generated at 192x192 and 512x512 in `public/icons/`. Meta tags for PWA (theme-color, apple-mobile-web-app-capable) already in root layout metadata from scaffolding.

---

**SP1-13 — Deploy to Vercel (staging)**
- **Assignee:** Dev 1
- **Priority:** P1
- **Depends on:** SP1-12 (needs PWA config) + all Dev 2 tasks should be merged to `main` for a complete deploy.
- **Blocks:** SP1-14 (smoke test) — **SYNC-3: Notify Dev 2 when deploy is live if Dev 2 is already waiting.**
- **Description:** Connect GitHub repo to Vercel. Configure environment variables on Vercel (all from `.env.local.example`). Set `NEXTAUTH_URL` to the Vercel staging URL. Verify build passes. Verify Google OAuth works on the deployed URL (requires adding Vercel URL to Google OAuth authorized redirect URIs).
- **Acceptance Criteria:** App accessible via `https://<project>.vercel.app`. Google login works. Dashboard shows user info. No console errors.

---

**SP1-14 — End-to-end smoke test**
- **Assignee:** Both
- **Priority:** P0
- **Depends on:** SP1-13 + SP1-11 — **SYNC-3: Both devs must have all tasks DONE. Last one to finish triggers the smoke test.**
- **Blocks:** None — this is the final task of Sprint 1.
- **Description:** Both devs test the full flow on mobile browser: Open Vercel URL → see login page → sign in with Google → redirected to dashboard → see name + avatar + placeholders → tap Quiz tab → see placeholder → tap Dashboard tab → back to dashboard. Report any bugs.
- **Acceptance Criteria:** Full flow works on Chrome Android and Chrome Desktop. No broken routes, no auth errors, no layout issues.

---

### DOING
_No tasks in progress._

### READY TO TEST
_No tasks ready for testing._

### DONE
- **SP1-07** — Auth session provider & route guard (Dev 1, 2026-04-12) — **SYNC-2 delivered**
- **SP1-08** — Login page UI (Dev 1, 2026-04-12)
- **SP1-09** — Dashboard page shell (Dev 2, 2026-04-12)
- **SP1-10** — Bottom navigation bar (Dev 2, 2026-04-12)
- **SP1-11** — Quiz page shell (Dev 2, 2026-04-12) — **SYNC-3: Dev 2 side complete**
- **SP1-12** — PWA configuration (Dev 1, 2026-04-12)

---

## Task Assignment Summary

| Dev | Week 1 Tasks | Week 2 Tasks | Total |
|:----|:-------------|:-------------|:------|
| **Dev 1** | SP1-01 (scaffolding), SP1-05 (auth), SP1-06 (env vars) | SP1-07 (route guard), SP1-08 (login page), SP1-12 (PWA), SP1-13 (deploy) | **7 tasks** |
| **Dev 2** | SP1-02 (Supabase), SP1-03 (Prisma schema), SP1-04 (Prisma client) | SP1-09 (dashboard shell), SP1-10 (bottom nav), SP1-11 (quiz shell) | **6 tasks** |
| **Both** | — | SP1-14 (smoke test) | **1 shared** |

## Dependency & Sync Summary

| Task | Depends On | Blocks | Sync Point |
|:-----|:-----------|:-------|:-----------|
| SP1-01 | — | SP1-05, SP1-12 | — |
| SP1-02 | — | SP1-03 | — |
| SP1-03 | SP1-02 | SP1-04 | — |
| SP1-04 | SP1-03 | SP1-05 | **SYNC-1:** Dev 2 → notify Dev 1 |
| SP1-05 | SP1-01, **SP1-04** | SP1-06, SP1-07 | **SYNC-1:** Dev 1 ← waits for Dev 2 |
| SP1-06 | SP1-05 | — | — |
| SP1-07 | SP1-05 | SP1-08, SP1-09 | **SYNC-2:** Dev 1 → notify Dev 2 |
| SP1-08 | SP1-07 | — | — |
| SP1-09 | **SP1-07** | SP1-10 | **SYNC-2:** Dev 2 ← waits for Dev 1 |
| SP1-10 | SP1-09 | SP1-11 | — |
| SP1-11 | SP1-10 | SP1-14 | **SYNC-3:** last to finish triggers |
| SP1-12 | SP1-01 | SP1-13 | — |
| SP1-13 | SP1-12 | SP1-14 | **SYNC-3:** last to finish triggers |
| SP1-14 | SP1-11, SP1-13 | — | **SYNC-3:** both devs test together |

## Notes for Devs

1. **Dev 2 will likely finish Week 1 before Dev 1** (Supabase + Prisma is faster than scaffolding + full OAuth). Once SP1-04 is done and merged, **immediately notify Dev 1** — they are blocked. Use the idle time to review Dev 1's SP1-01 PR or research Week 2 tasks.
2. **Dev 1 owns the Week 2 gate.** SP1-07 (route guard) blocks Dev 2's entire Week 2. Prioritize getting SP1-07 merged ASAP on Monday of Week 2. **Notify Dev 2 the moment it's merged.**
3. **Google OAuth setup** requires creating a project in Google Cloud Console, enabling the OAuth API, and configuring authorized redirect URIs (`http://localhost:3000/api/auth/callback/google` for dev, plus the Vercel URL later). Dev 1 should document these steps.
4. **No pixel-perfect UI expected.** The UI/UX designer hasn't joined yet. Use clean Tailwind defaults. The goal is functional, mobile-friendly layouts — not beautiful design. That refinement comes later.
5. **All PRs require Tech Lead review** before merge to `main`.
6. **Branch naming convention:** `sprint1/SP1-XX-short-description` (e.g., `sprint1/SP1-05-google-auth`).

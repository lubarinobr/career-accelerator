# Dev 2 — Week 1 Daily Log

**Sprint:** Sprint 1
**Week:** 1 (2026-04-12 to 2026-04-17)
**Dev:** Dev 2 (Database, Data Model & API Logic)

---

## Day 1 — Saturday, 2026-04-12

### What I did

**1. Onboarding & Project Review**
- Read all project documentation: `about.md`, `features.md`, `architecture.md`, `roles.md`, `dev-workflow.md`, `kanban-sprint1.md`, `questions.md`, `test-plan-sprint1.md`, `job-roles.md`
- Understood the full MVP scope: AI-powered quiz app for AWS Cloud Practitioner, Duolingo-style, single user (CEO), PWA

**2. Technical Questions (D2-Q1 through D2-Q8)**
- Wrote 8 specific questions for the Tech Lead before touching any code
- Created `dev2-techleader-question.md` to track them
- All 8 answered same day — no blockers, all aligned with my recommendations
- Key decisions: `gen_random_uuid()` at DB level, composite unique on `daily_activity`, keep `streaks` separate, defer Zod to Sprint 2, use Next.js 16.2.3 as scaffolded

**3. SP1-02 — Supabase Project Setup (DONE)**
- Created Supabase project `career-accelerator`
- Region: `eu-west-1` (Ireland) — `sa-east-1` (São Paulo) unavailable on free tier
- Hit IPv4 issue: Supabase direct connection requires IPv6. Switched to Session Pooler connection string (IPv4 compatible)
- Updated `.env.local` with connection strings, cleaned credentials from `.env.local.example`

**4. SP1-03 — Prisma Setup & Schema (DONE)**
- Installed Prisma 7.7.0 and `@prisma/client`
- Discovered Prisma 7 breaking change: `url`/`directUrl` no longer supported in `schema.prisma`. Migrated to `prisma.config.ts` with `datasource.url` pattern
- Wrote full schema: 5 tables (`users`, `questions`, `user_answers`, `daily_activity`, `streaks`) with all columns, types, relations, and constraints matching `architecture.md`
- Ran migration `20260412201226_init` — all tables created successfully in Supabase

**5. SP1-04 — Prisma Client Singleton (DONE)**
- Discovered Prisma 7 requires Driver Adapter pattern (no more direct URL in PrismaClient constructor)
- Installed `@prisma/adapter-pg` and `pg`
- Implemented singleton in `src/lib/db.ts` using `PrismaPg` adapter with `pg.Pool`, hot-reload safe via `globalThis`
- **SYNC-1 delivered** — notified Dev 1 they are unblocked for SP1-05 (auth)

**6. Tech Lead Review — Action Item Fixed**
- Tech Lead flagged missing IPv4/Session Pooler documentation in `.env.local.example` (see `dev2/tech-lead-review-week1.md`)
- Updated `.env.local.example` with clear instructions for IPv4 vs IPv6 connections, Session Pooler usage, and what `DATABASE_URL` vs `DIRECT_URL` are for

**7. SYNC-2 Received — Week 2 Tasks Started**
- Dev 1 completed SP1-05 (auth), SP1-06 (env vars), SP1-07 (route guard), SP1-08 (login page) — all on same day
- Reviewed Dev 1's auth implementation: JWT strategy, `prisma.user.upsert()` in signIn callback, `session.user.id` exposes DB UUID (as agreed in D2-Q7)

**8. SP1-09 — Dashboard Page Shell (DONE)**
- Server component using `auth()` to get session
- Displays user name + Google avatar using `next/image` (added `lh3.googleusercontent.com` to `next.config.ts` remote patterns)
- 3 placeholder stat cards in a responsive grid: Streak (0), XP (0), Level (Intern)
- `pb-20` padding to clear the fixed bottom nav

**9. SP1-10 — Bottom Navigation Bar (DONE)**
- Client component using `usePathname()` for active tab detection
- Fixed bottom bar with Dashboard and Quiz tabs
- SVG outline icons (Heroicons-style grid and question mark)
- Active tab: blue-600, inactive: gray-400
- Included in both `/dashboard` and `/quiz` pages

**10. SP1-11 — Quiz Page Shell (DONE)**
- Server component with auth guard (redirect to `/login` if no session)
- Placeholder icon + "Coming in Sprint 2" message
- Bottom nav included and linking correctly

**11. SP1-14 — End-to-End Smoke Test (DONE)**
- Verified login page loads on Vercel: app name, tagline, Google button — PASS
- Verified auth guard: `/dashboard` without session redirects to `/login` — PASS
- CEO ran full interactive flow on phone: Google login, dashboard with name + avatar + stats, bottom nav switching, quiz placeholder — ALL PASS
- Initial 500 error on `/api/auth/error` was a Vercel env var config issue, resolved by CEO

**12. Kanban Updated**
- All Sprint 1 tasks marked DONE with completion dates and results
- SP1-14 closed — Sprint 1 complete

### Blockers
None.

### Unexpected findings
- **Prisma 7 breaking changes:** The architecture doc and common tutorials reference Prisma 5/6 patterns. Prisma 7.7.0 (installed via latest npm) requires `prisma.config.ts` for connection URLs and Driver Adapters for client instantiation. Both are significant departures from previous versions. Dev 1 should be aware when building auth — the Prisma client import works the same (`import { prisma } from "@/lib/db"`), but the underlying setup is different.
- **Supabase IPv4:** Free tier direct connections are IPv6-only. Any dev on an IPv4 network must use Session Pooler. This should be documented in `.env.local.example` for onboarding. (Fixed after Tech Lead review.)
- **Next.js 16 `middleware` deprecation:** Build warns that `middleware.ts` is deprecated in favor of `proxy`. Not breaking for now, but Dev 1 should be aware for Sprint 2.

---

## Sprint 1 Summary

| Task | Status | Date |
|:-----|:-------|:-----|
| SP1-02 — Supabase setup | DONE | 2026-04-12 |
| SP1-03 — Prisma schema | DONE | 2026-04-12 |
| SP1-04 — Prisma client singleton | DONE | 2026-04-12 |
| SP1-09 — Dashboard page shell | DONE | 2026-04-12 |
| SP1-10 — Bottom navigation bar | DONE | 2026-04-12 |
| SP1-11 — Quiz page shell | DONE | 2026-04-12 |
| SP1-14 — Smoke test (joint) | DONE | 2026-04-12 |

**All 7 tasks completed. Sprint 1 finished. Ready for Sprint 2.**

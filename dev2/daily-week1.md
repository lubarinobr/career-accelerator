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

**6. Kanban Updated**
- Moved SP1-02, SP1-03, SP1-04 to DONE with completion dates and results

### Blockers
None.

### Waiting on
- **SYNC-2:** Dev 1 to complete SP1-07 (route guard) before I can start SP1-09 (dashboard shell)

### Unexpected findings
- **Prisma 7 breaking changes:** The architecture doc and common tutorials reference Prisma 5/6 patterns. Prisma 7.7.0 (installed via latest npm) requires `prisma.config.ts` for connection URLs and Driver Adapters for client instantiation. Both are significant departures from previous versions. Dev 1 should be aware when building auth — the Prisma client import works the same (`import { prisma } from "@/lib/db"`), but the underlying setup is different.
- **Supabase IPv4:** Free tier direct connections are IPv6-only. Any dev on an IPv4 network must use Session Pooler. This should be documented in `.env.local.example` for onboarding.

---

## Day 2-5 — Monday to Thursday, 2026-04-13 to 2026-04-17

Waiting for SYNC-2 (SP1-07 merge by Dev 1). Using idle time to:
- Review Dev 1's PRs when they come in
- Research Week 2 tasks: dashboard layout patterns, bottom nav implementation in Next.js App Router
- Read Auth.js v5 docs to understand the session object shape I'll consume in SP1-09

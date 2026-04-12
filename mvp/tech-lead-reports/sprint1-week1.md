# Tech Lead Report — Sprint 1, Week 1

**Author:** Tech Lead
**Period:** 2026-04-12 (Sprint 1 completed in a single day)
**Sprint:** 1 of 3 | **Status:** COMPLETE

---

## Summary

Sprint 1 is done. All 14 tasks are DONE, the app is live at `https://career-accelerator-lemon.vercel.app`, and the smoke test passed. We went from zero codebase to a deployed, working app with Google auth, dashboard, navigation, and PWA — in one day. Both devs delivered all their tasks, all sync points were hit cleanly, and two production deployment issues were caught and fixed (Prisma generate, edge function size).

---

## What I Did

### Architecture & Planning

- Reviewed the P.O.'s feature list (`features.md`) and project vision (`about.md`)
- Created `questions.md` with 10 blocking questions for the P.O. — all 10 answered same day
- Wrote the **technical architecture document** (`architecture.md`): tech stack (Next.js, TypeScript, Tailwind, Supabase, Prisma, Claude API, Vercel), data model (5 tables), project structure, API design, XP/leveling formulas, streak logic, and a 3-sprint plan
- Reviewed the P.O.'s roadmap (`roadmap.md`) and raised 5 additional technical questions (Q11-Q15) — these are Sprint 2 blockers, not Sprint 1

### Team Setup

- Created the **dev kanban** (`kanban-sprint1.md`) with 14 tasks, explicit dependency chains, and 3 sync points (SYNC-1, SYNC-2, SYNC-3)
- Wrote the **developer workflow guide** (`dev-workflow.md`) covering git conventions, code review culture, testing philosophy, sync point protocol, weekly reports, and task status ownership (devs move to READY TO TEST, only Tech Lead moves to DONE)
- Wrote **job descriptions** (`job-roles.md`) for both senior engineer roles
- Created the **Sprint 1 test plan** (`test-plan-sprint1.md`) with 7 test scenarios for the P.O./QA

### Hands-on Engineering

- Completed **SP1-01 (Project scaffolding):**
  - Next.js 16.2.3, TypeScript (strict), Tailwind 4, ESLint 9, React 19
  - Full folder structure matching architecture doc
  - Placeholder files with TODO comments for every Sprint 1 and Sprint 2 task
  - `.env.local.example`, PWA `manifest.json`, API route stubs
- Fixed **Vercel deployment blocker** — Prisma client not generating during build:
  - Added `prisma generate` to the `build` script in `package.json`
- Fixed **Vercel edge function size limit** (1.38MB > 1MB limit):
  - Replaced heavy `auth()` middleware (imported Prisma + pg) with a lightweight cookie-based check
  - Auth validation still happens server-side in page components
- Assisted CEO with **Google Cloud OAuth** setup and **Vercel configuration**

### Dev Reviews

- Reviewed **Dev 2's Week 1 work** against code — all verified, 1 action item (IPv4/Session Pooler documentation in `.env.local.example`)
- Reviewed **Dev 1's Week 1 work** against code — all verified, noted process issue (moved tasks to DONE instead of READY TO TEST)
- Answered **14 questions from Dev 1** and **8 questions from Dev 2**
- Identified cross-dev dependency (D1-Q4 ↔ D2-Q7) and ensured both devs aligned on `session.user.id` carrying the database UUID

---

## Final Sprint 1 Kanban

### All 14 tasks DONE

| Task   | Owner           | Description                                          |
| :----- | :-------------- | :--------------------------------------------------- |
| SP1-01 | Tech Lead       | Project scaffolding                                  |
| SP1-02 | Dev 2           | Supabase project setup (eu-west-1)                   |
| SP1-03 | Dev 2           | Prisma schema (5 tables, Prisma 7)                   |
| SP1-04 | Dev 2           | Prisma client singleton — **SYNC-1 delivered**       |
| SP1-05 | Dev 1           | NextAuth.js setup (Google OAuth, JWT, manual upsert) |
| SP1-06 | Dev 1 + Dev 2   | Environment variables template                       |
| SP1-07 | Dev 1           | Auth route guard (middleware) — **SYNC-2 delivered** |
| SP1-08 | Dev 1           | Login page UI                                        |
| SP1-09 | Dev 2           | Dashboard page shell                                 |
| SP1-10 | Dev 2           | Bottom navigation bar                                |
| SP1-11 | Dev 2           | Quiz page shell                                      |
| SP1-12 | Dev 1           | PWA configuration (manual service worker)            |
| SP1-13 | CEO + Tech Lead | Deploy to Vercel                                     |
| SP1-14 | Both            | End-to-end smoke test — **ALL TESTS PASS**           |

### Sync Points

- **SYNC-1:** Dev 2 → Dev 1 (SP1-04 done, unblocked SP1-05) — delivered cleanly
- **SYNC-2:** Dev 1 → Dev 2 (SP1-07 done, unblocked SP1-09) — delivered cleanly
- **SYNC-3:** Both → SP1-14 (all tasks done, smoke test triggered) — delivered cleanly

---

## Production Issues Found & Fixed

| Issue                                                        | Root Cause                                                       | Fix                                                         |
| :----------------------------------------------------------- | :--------------------------------------------------------------- | :---------------------------------------------------------- |
| Vercel build fails: `Can't resolve '.prisma/client/default'` | Vercel doesn't run `prisma generate` automatically               | Added `prisma generate` to `build` script in `package.json` |
| Vercel deploy fails: edge function 1.38MB exceeds 1MB limit  | Middleware imported `auth()` which pulled in Prisma + pg adapter | Replaced with lightweight cookie-based session check        |
| Vercel 404 on all routes                                     | Framework preset not set to Next.js                              | CEO set Framework Preset to Next.js in Vercel settings      |

---

## Blockers Resolved

| Blocker                  | How It Was Resolved                                                               |
| :----------------------- | :-------------------------------------------------------------------------------- |
| Google OAuth credentials | CEO created Google Cloud project and OAuth client following `docs/setup-guide.md` |
| Vercel account           | CEO configured Vercel, linked GitHub repo, set env vars                           |
| Supabase region          | Accepted eu-west-1 (Ireland) — sa-east-1 unavailable on free tier                 |
| P.O. questions Q11-Q15   | Still open — these block Sprint 2, not Sprint 1                                   |

---

## Remaining Open Items for Sprint 2

| Item                                                                                           | Owner     | Priority                            |
| :--------------------------------------------------------------------------------------------- | :-------- | :---------------------------------- |
| P.O. must answer Q11-Q15 (question exhaustion, XP overlap, quality validation, streak minimum) | P.O.      | **High** — blocks Sprint 2 planning |
| Dev 2 must update `.env.local.example` with IPv4/Session Pooler documentation                  | Dev 2     | Low                                 |
| Next.js 16 middleware deprecation — migrate to `proxy.ts` when stable                          | Tech Lead | Low — still works, just a warning   |
| Dev workflow updated: devs must move to READY TO TEST, not DONE                                | Both devs | Process — enforce in Sprint 2       |

---

## Key Decisions Made

| Decision                            | Rationale                                             | Impact                        |
| :---------------------------------- | :---------------------------------------------------- | :---------------------------- |
| Skip Prisma Adapter, manual upsert  | Full schema control, no unused tables/columns         | Auth implementation           |
| JWT sessions (no sessions table)    | Simpler, no DB hit per request, single user           | Architecture, performance     |
| DB UUID in session token            | All FKs reference `users.id`, avoids extra lookups    | Every API route in Sprint 2-3 |
| Lightweight cookie-based middleware | Full auth middleware exceeded Vercel's 1MB edge limit | Deployment compatibility      |
| `gen_random_uuid()` at DB level     | Works for batch scripts and manual inserts            | Data integrity                |
| Minimal manual service worker       | Avoids Next.js 16 compatibility risk                  | PWA scope                     |
| Keep streaks as separate table      | Separation of concerns                                | Data model                    |

---

## Sprint 1 Verdict

**Sprint 1 Definition of Done from roadmap.md:**

> A user can open the Vercel URL on their phone, log in with Google, and see a dashboard with their name. The database has all tables ready.

**Status: MET.** The app is live, auth works, dashboard shows user data, all 5 tables exist in Supabase, navigation works, and the PWA is installable. Sprint 1 is complete. Ready for Sprint 2.

# Tech Lead Report — Sprint 1, Week 1

**Author:** Tech Lead
**Period:** 2026-04-12 (Day 1 of Sprint 1)
**Sprint:** 1 of 3 | **Week:** 1 of 2

---

## Summary

Week 1 was a planning-heavy day zero. We went from zero codebase to a fully scaffolded project with a live database, answered all stakeholder questions, onboarded two senior devs, and established the team's workflow. Dev 2 completed all Week 1 tasks. Dev 1 is unblocked and ready for SP1-05 (auth).

---

## What I Did

### Architecture & Planning
- Reviewed the P.O.'s feature list (`features.md`) and project vision (`about.md`)
- Created `questions.md` with 10 blocking questions for the P.O. — all 10 answered same day
- Wrote the **technical architecture document** (`architecture.md`): tech stack (Next.js, TypeScript, Tailwind, Supabase, Prisma, Claude API, Vercel), data model (5 tables), project structure, API design, XP/leveling formulas, streak logic, and a 3-sprint plan
- Reviewed the P.O.'s roadmap (`roadmap.md`) and raised 5 additional technical questions (Q11-Q15) — these are Sprint 2 blockers, not Sprint 1

### Team Setup
- Created the **dev kanban** (`kanban-sprint1.md`) with 14 tasks, explicit dependency chains, and 3 sync points (SYNC-1, SYNC-2, SYNC-3)
- Wrote the **developer workflow guide** (`dev-workflow.md`) covering git conventions, code review culture, testing philosophy, sync point protocol, and conflict resolution
- Wrote **job descriptions** (`job-roles.md`) for both senior engineer roles
- Created the **Sprint 1 test plan** (`test-plan-sprint1.md`) with 7 test scenarios for the P.O./QA

### Hands-on Engineering
- Completed **SP1-01 (Project scaffolding)** myself:
  - Next.js 16.2.3, TypeScript (strict), Tailwind 4, ESLint 9, React 19
  - Full folder structure matching architecture doc
  - Placeholder files with TODO comments referencing kanban ticket IDs for every Sprint 1 and Sprint 2 task
  - Root layout with PWA metadata, app name, viewport config
  - API route stubs (quiz, answer, user) returning 501
  - Prisma schema boilerplate with datasource configured
  - `.env.local.example` with all env vars documented
  - PWA `manifest.json` ready
  - `npm run dev`, `npm run build`, `npm run lint` all passing

### Dev Support
- Answered **14 questions from Dev 1** (`dev1-techleader-questions.md`): auth package choice (next-auth@5), skip Prisma Adapter (manual upsert), JWT sessions, DB UUID in session token, middleware-based route guard, minimal manual service worker for PWA, text-only logo, setup guide delegation to CEO
- Answered **8 questions from Dev 2** (`dev2-techleader-question.md`): direct DB connection for MVP, `gen_random_uuid()` at DB level, composite unique on daily_activity, keep streaks as separate table, defer Zod validation to Sprint 2, pure Prisma client export
- Identified cross-dev dependency (D1-Q4 ↔ D2-Q7): ensured both devs are aligned that `session.user.id` will carry the database UUID
- Updated `architecture.md` to reflect actual Next.js version (16 instead of 15) after both devs flagged the discrepancy

---

## Dev Progress

### Dev 1
| Task | Status | Notes |
|:-----|:-------|:------|
| SP1-05 (Auth) | **Unblocked** | SYNC-1 delivered by Dev 2. Ready to start. Waiting on Google OAuth credentials from CEO. |
| SP1-06 (Env vars) | TODO | Depends on SP1-05 |

### Dev 2
| Task | Status | Notes |
|:-----|:-------|:------|
| SP1-02 (Supabase) | **DONE** | Region: `eu-west-1` (Ireland) — `sa-east-1` unavailable on free tier. Session Pooler used for IPv4. |
| SP1-03 (Prisma schema) | **DONE** | All 5 tables migrated. Prisma 7.7.0 with Driver Adapter pattern. Composite unique on daily_activity confirmed. |
| SP1-04 (Prisma client) | **DONE** | Singleton exported from `@/lib/db`. SYNC-1 delivered to Dev 1. |

### Kanban Summary
| Status | Count | Tasks |
|:-------|:------|:------|
| DONE | 4 | SP1-01, SP1-02, SP1-03, SP1-04 |
| TODO | 9 | SP1-05 through SP1-13 |
| DOING | 0 | — |

---

## Blockers & Risks

| Item | Severity | Owner | Notes |
|:-----|:---------|:------|:------|
| Google OAuth credentials not yet created | **Medium** | CEO | Dev 1 is writing a setup guide (D1-Q12). CEO needs to execute it before SP1-05 can be fully tested. |
| Vercel account not yet created | **Low** | CEO | Needed for SP1-13 (Week 2). Dev 1 documenting steps (D1-Q11). |
| Supabase region is Ireland, not São Paulo | **Low** | — | ~180ms latency instead of ~20ms. Acceptable for single user MVP. Documented in SP1-02 result. |
| P.O. questions Q11-Q15 still unanswered | **Low** | P.O. | These block Sprint 2 decisions, not Sprint 1. P.O. noted them as first priority for next day. |

---

## Plan for Week 2

### Dev 1 (critical path)
1. **SP1-05** — Complete Google OAuth with manual upsert, JWT sessions, UUID in session token
2. **SP1-06** — Finalize env vars template
3. **SP1-07** — Middleware-based route guard (**SYNC-2 — unblocks Dev 2's Week 2**)
4. **SP1-08** — Login page (text logo, Google button)
5. **SP1-12** — PWA (minimal service worker, placeholder icons)
6. **SP1-13** — Deploy to Vercel (requires CEO to create account)

### Dev 2 (blocked until SYNC-2)
1. Wait for SP1-07 (route guard) from Dev 1
2. While waiting: review Dev 1's PRs for SP1-05/SP1-06, prepare Week 2 page templates
3. **SP1-09** — Dashboard shell (name, avatar, placeholder stats)
4. **SP1-10** — Bottom navigation bar
5. **SP1-11** — Quiz page (empty shell)

### Joint
6. **SP1-14** — End-to-end smoke test on deployed Vercel URL

### CEO Action Items
- [ ] Create Google Cloud project and OAuth credentials (follow Dev 1's setup guide)
- [ ] Create Vercel account and link GitHub repo (follow Dev 1's setup guide)
- [ ] Provide `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` to the team

---

## Key Decisions Made This Week

| Decision | Rationale | Impact |
|:---------|:----------|:-------|
| Skip Prisma Adapter, manual upsert | Full schema control, no unused tables/columns | Dev 1 auth implementation |
| JWT sessions (no sessions table) | Simpler, no DB hit per request, single user | Architecture, performance |
| DB UUID in session token | All FKs reference `users.id`, avoids extra lookups | Every API route in Sprint 2-3 |
| Middleware-based route guard | No flash of unauthenticated content, zero-friction UX | User experience |
| `gen_random_uuid()` at DB level | Works for batch scripts and manual inserts too | Data integrity |
| Minimal manual service worker (no library) | Avoids Next.js 16 compatibility risk, Sprint 1 only needs installability | PWA scope |
| Keep streaks as separate table | Separation of concerns, cleaner Sprint 3 implementation | Data model |

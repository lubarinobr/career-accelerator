# Dev 2 → Tech Lead — Questions Before Sprint 1

**Author:** Dev 2 | **Date:** 2026-04-12
**Status Legend:** `OPEN` | `ANSWERED` | `BLOCKED`

---

## D2-Q1 — Supabase Free Tier: Connection Pooling (ANSWERED)

**Task:** SP1-02 (Supabase project setup)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Configure both, use direct for everything in MVP.**

Set up both `DATABASE_URL` (direct, port 5432) and `DIRECT_URL` (also direct, port 5432) in `.env.local`. For a single-user MVP with no concurrency, the pooled connection adds zero value and can cause issues with Prisma migrations. Use the direct connection for everything. Update `.env.local.example` to document both vars with a comment explaining which is which. If we ever scale beyond a single user, switching `DATABASE_URL` to the pooled connection is a one-line change.

---

## D2-Q2 — Prisma Schema: `uuid` Generation Strategy (ANSWERED)

**Task:** SP1-03 (Prisma schema)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option B — `gen_random_uuid()` at the database level.**

Your reasoning is spot on. The batch generation script (Sprint 2) will likely do bulk inserts, and having the DB generate UUIDs means we never have to worry about ID collisions or missing IDs regardless of how data enters the system. The Supabase dashboard argument is also valid — if the P.O. ever needs to manually insert a test question, it just works. Go with `@default(dbgenerated("gen_random_uuid()"))` for all PKs.

---

## D2-Q3 — `daily_activity` Unique Constraint (ANSWERED)

**Task:** SP1-03 (Prisma schema)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Yes, composite unique on `@@unique([userId, activityDate])`.**

Correct — one row per user per day. A unique on `activityDate` alone would be a bug. Good catch flagging this before migration. The composite unique also serves as a natural index for the most common query pattern: "get today's activity for user X."

---

## D2-Q4 — `streaks` Table: One Row Per User (ANSWERED)

**Task:** SP1-03 (Prisma schema)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Keep it separate.**

Agree with your recommendation. The `users` table is about identity (auth, profile, XP). The `streaks` table is about behavior (consistency tracking). Mixing them creates a fat table that grows every time we add a gamification feature. Separation of concerns matters here — especially since Sprint 3 will have a dedicated `lib/streak.ts` module that operates on the `streaks` table independently. One extra join is a negligible cost for a single-user app. Keep the architecture as designed.

---

## D2-Q5 — `options` Column Type: `jsonb` Validation (ANSWERED)

**Task:** SP1-03 (Prisma schema)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Defer to Sprint 2.**

Correct — no data flows through this table in Sprint 1. Writing Zod schemas for empty tables is exactly the kind of premature work the `dev-workflow.md` warns against. You won't get flagged in PR review for this. When Sprint 2 starts (S2-01 batch generation), the dev building that script will define the Zod schema as part of the output validation step. That's the right time.

---

## D2-Q6 — Next.js Version: 15 vs 16 (ANSWERED)

**Task:** SP1-03, SP1-04
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Use Next.js 16.2.3 as scaffolded. Do not downgrade.**

Your assumption is correct. The architecture doc was written before scaffolding and the version number is outdated. I'll update `architecture.md` to reflect 16.2.3. Dev 1 also raised this same question (D1-Q14). Use what's installed, don't touch the version.

---

## D2-Q7 — SP1-09 Dashboard: Session Access Pattern (ANSWERED)

**Task:** SP1-09 (Dashboard page shell)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Yes, `session.user.id` will contain the database UUID.**

I've already answered this on Dev 1's side (D1-Q4). Dev 1 will extend the `jwt` and `session` callbacks in SP1-05 to include `users.id` (the database UUID) in the session. You'll be able to access `session.user.id`, `session.user.name`, and `session.user.image` from the session object.

For Sprint 1 (SP1-09), you only need `name` and `image` for the placeholder dashboard. But `id` will be there and ready for Sprint 3 when you need it for DB queries. No extra lookups needed.

**Action for you:** When SP1-07 (SYNC-2) is merged by Dev 1, verify that `session.user.id` is a UUID string before building the dashboard page. If it's missing, flag it immediately.

---

## D2-Q8 — SP1-04 Prisma Client: `@/lib/db` Import Path (ANSWERED)

**Task:** SP1-04 (Prisma client singleton)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Pure client export only. Types from `@prisma/client` directly.**

Agree with your recommendation. `@/lib/db` exports the `prisma` client instance — that's it. Types come from `@prisma/client` via normal imports. Re-exporting types creates a maintenance layer that adds no value. Prisma already generates types, IDE auto-imports work fine, and the convention is well-known. Keep it simple.

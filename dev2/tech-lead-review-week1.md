# Tech Lead Review — Dev 2 Week 1

**Reviewer:** Tech Lead | **Date:** 2026-04-12
**Reviewed file:** `dev2/daily-week1.md`
**Code verified against:** `prisma/schema.prisma`, `prisma/prisma.config.ts`, `prisma/migrations/`, `src/lib/db.ts`, `package.json`, `.env.local.example`, `kanban-sprint1.md`

---

## Verdict: APPROVED with 1 action item

Excellent Week 1. All 3 tasks (SP1-02, SP1-03, SP1-04) are verified against the code. The Prisma 7 adaptation was handled well — discovering and solving breaking changes without escalating unnecessarily shows strong ownership. SYNC-1 was delivered promptly. Weekly log is detailed and accurate.

---

## Code Verification

### SP1-02 — Supabase project setup
- **Status:** VERIFIED
- Kanban matches: region `eu-west-1`, Session Pooler for IPv4 documented in kanban completion notes
- `package.json` has all required Prisma + pg dependencies

### SP1-03 — Prisma setup & schema
- **Status:** VERIFIED
- All 5 tables present: `users`, `questions`, `user_answers`, `daily_activity`, `streaks`
- `gen_random_uuid()` on all PKs — matches D2-Q2 decision
- Composite unique `@@unique([userId, activityDate])` on `daily_activity` — matches D2-Q3 decision
- Unique `user_id` on `streaks` — matches D2-Q4 decision (separate table)
- `@@map()` on all models/columns for snake_case DB naming — good practice
- `options` column is `Json` type (no Zod) — matches D2-Q5 decision (defer to Sprint 2)
- Relations and FKs correctly defined
- Migration SQL matches schema exactly
- `prisma.config.ts` handles Prisma 7 connection pattern correctly

### SP1-04 — Prisma client singleton
- **Status:** VERIFIED
- `src/lib/db.ts` uses `PrismaPg` Driver Adapter with `pg.Pool`
- Hot-reload safe via `globalThis` pattern
- Export is clean: `export const prisma` — matches D2-Q8 decision (pure client export)

---

## Issue Found

### ACTION REQUIRED: `.env.local.example` missing IPv4/Session Pooler documentation

In your weekly log you wrote:

> *"Supabase IPv4: Free tier direct connections are IPv6-only. Any dev on an IPv4 network must use Session Pooler. This should be documented in `.env.local.example` for onboarding."*

However, the current `.env.local.example` does **not** include this information. The DATABASE_URL comments say:

```
# For MVP (single user): both use the direct connection (port 5432)
# To scale later: change DATABASE_URL to the pooled connection (port 6543)
```

This is misleading — on IPv4 networks, the direct connection **will not work at all**. A new dev following these instructions will hit a connection timeout and not know why.

**Fix needed:** Update `.env.local.example` to mention that Supabase free tier requires the **Session Pooler connection string** if the dev is on an IPv4 network. Include both options clearly so the next person onboarding doesn't waste time debugging connectivity.

This is a small fix — update the comments in `.env.local.example` and you're done.

---

## Positive callouts

1. **Prisma 7 adaptation** — You discovered two breaking changes (`prisma.config.ts` requirement, Driver Adapter pattern) and solved both without blocking the team. This was not documented in the architecture doc or kanban. Well handled.
2. **Proactive questions** — All 8 questions were specific, well-reasoned, and included your own recommendation. This is exactly how senior engineers should operate.
3. **SYNC-1 timing** — Delivered all 3 tasks and notified Dev 1 same day, giving them maximum runway for SP1-05.
4. **Weekly log quality** — Detailed, honest (includes unexpected findings), and matches the actual code. The "Day 2-5" idle plan is transparent and constructive (PR reviews, research).

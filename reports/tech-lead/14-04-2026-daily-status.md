# Tech Lead Daily Status — 14-04-2026

**Author:** Tech Lead
**Date:** 2026-04-14
**Type:** Security hotfix + post-mortem

---

## Summary

Supabase flagged `rls_disabled_in_public` on 2026-04-13 despite Sprint 3's RLS migration being deployed. Root cause: the Sprint 3 migration enabled RLS on the 5 application tables but missed Prisma's own `_prisma_migrations` bookkeeping table, which also lives in the `public` schema. Deployed a new migration to enable RLS + deny-all policies on it. Verified against prod.

Note: P.O. instructed the Tech Lead to execute this hotfix directly (overriding the "no overstepping" rule for this one task). Recorded here for traceability.

---

## Root Cause

Prior Sprint 3 claim ("all 5 tables locked") was accurate but incomplete. Supabase's Security Advisor scans every table in `public`, including `_prisma_migrations`. That table is auto-created by Prisma on first migration and was not covered by `20260412_enable_rls`.

The Sprint 3 smoke test was file-based (migration exists in repo) rather than checking prod state. Running `SELECT rowsecurity FROM pg_tables WHERE schemaname='public'` against prod would have caught this.

---

## Fix

- New migration `prisma/migrations/20260414_enable_rls_prisma_migrations/migration.sql`
  - `ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY`
  - 4 deny-all policies (select/insert/update/delete WITH CHECK / USING false)
  - Postgres table-owner role (Prisma's connection) bypasses RLS, so migrations continue to work
- Applied via `prisma migrate deploy` against prod
- Added diagnostic script `scripts/check-rls.ts` to list RLS state + policies for every public table

## Verification

Re-ran `scripts/check-rls.ts` against prod:

| Table | rowsecurity |
|---|---|
| _prisma_migrations | true |
| daily_activity | true |
| questions | true |
| streaks | true |
| user_answers | true |
| users | true |

All 6 public tables now have RLS enabled.

---

## Process Fix

Updating the security smoke-test checklist so this class of issue is caught at the source, not by Supabase's alert email:

1. After any RLS-related migration, run `scripts/check-rls.ts` against prod and confirm every row of `pg_tables` (not just app tables) shows `rowsecurity=true`.
2. File-based "migration exists in repo" is not sufficient evidence of prod state.
3. Add `scripts/check-rls.ts` to the pre-release checklist.

---

## Blockers

None.

## What's Next

- Sprint 5 audit finding still open: `streak-freeze/buy/route.ts:61` has no floor guard on `{ decrement: cost }`. Route to Dev 2 next sprint.
- P.O. returns from vacation — sync on priorities.

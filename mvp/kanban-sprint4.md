# Sprint 4 — Security Hardening Kanban

**Sprint Goal:** Fix all code-level security findings from the sec team audit. No external service tasks — only what lives in the codebase.

**Sprint Duration:** 1 week (2026-04-14 to 2026-04-18)
**Team:** Tech Lead (BE + infra) | Dev 3 (Senior React Frontend)
**Tech Lead:** Owns all BE tasks, reviews all PRs, unblocks technical decisions

**Status Legend:** `TODO` | `DOING` | `READY TO TEST` | `DONE`

**Important:** Devs move tasks to `READY TO TEST` only. The Tech Lead moves tasks to `DONE` after verifying code against acceptance criteria.

---

## Sync Points — READ THIS FIRST

| Sync Point | Who waits | Who delivers | Trigger |
| :--------- | :-------- | :----------- | :------ |
| **SYNC-10** | Dev 3 (SEC-03b) | Tech Lead (SEC-03a) | Tech Lead notifies when SEC-03a (signOut API) is merged. Dev 3 needs it for the logout button. |
| **SYNC-11** | All (SEC-05) | All | All tasks must be done before the security smoke test. |

```
DAY 1-2 — critical fixes (parallel)
  Tech Lead: SEC-01 (rate limiting) + SEC-02 (JWT expiry)
  Dev 3:     SEC-04 (npm audit fix) — no dependencies

DAY 3 — logout flow (sequential)
  Tech Lead: SEC-03a (signOut API wiring) → (notify SYNC-10)
  Dev 3:     (wait SYNC-10) → SEC-03b (logout button UI)

DAY 4-5 — verify + test
  Tech Lead: SEC-05 (security smoke test)
```

---

## Day 1-2 — Critical Fixes

### TODO

---

~~**SEC-01 — Rate limiting on sensitive endpoints**~~ **READY TO TEST**

- **Assignee:** Tech Lead
- **Priority:** P0
- **Completed:** 2026-04-13
- **Blocks:** SEC-05 (smoke test)
- **Description:** Add in-memory rate limiting middleware to protect sensitive API routes. Create `src/lib/rate-limit.ts` with a sliding-window or token-bucket limiter (no external dependency — use in-memory Map with TTL cleanup). Apply to:
  - `POST /api/answer` — max 30 req/min per user (prevents XP farming)
  - `POST /api/streak-freeze/buy` — max 5 req/min per user (prevents abuse)
  - `GET /api/quiz` — max 20 req/min per user (prevents scraping)
  - `/api/auth/*` — max 10 req/min per IP (brute-force protection)
- **Acceptance Criteria:**
  - Rate limiter returns `429 Too Many Requests` with `Retry-After` header when limit exceeded
  - Limits keyed by userId for authenticated routes, by IP for auth routes
  - Unit tests cover: under limit (allow), at limit (block), window expiry (reset)
  - No external dependencies added (in-memory is acceptable for single-region Vercel deployment)
- **Result:** `src/lib/rate-limit.ts` — sliding window limiter, zero deps, in-memory Map with TTL cleanup. Applied to all 4 route categories: answer (30/min), quiz (20/min), streak-freeze (5/min), auth (10/min by IP in middleware). 7 unit tests in `src/lib/rate-limit.test.ts`. Returns 429 + Retry-After header. Caveat: resets on cold start (acceptable for MVP).
- **Note:** Vercel serverless functions are stateless — in-memory rate limiting resets on cold start. This is acceptable for MVP. For v2, consider Vercel KV or Upstash Redis.

---

~~**SEC-02 — Reduce JWT session maxAge**~~ **READY TO TEST**

- **Assignee:** Tech Lead
- **Priority:** P0
- **Completed:** 2026-04-13
- **Blocks:** SEC-05 (smoke test)
- **Result:** Added `maxAge: 7 * 24 * 60 * 60` (604800s / 7 days) to session config in `src/lib/auth.ts:14`. Was using NextAuth default of 30 days. Build + 41 tests pass.

---

## Day 3 — Logout Flow

---

~~**SEC-03a — Wire up signOut server action**~~ **READY TO TEST**

- **Assignee:** Tech Lead
- **Priority:** P1
- **Completed:** 2026-04-13
- **Blocks:** SEC-03b (SYNC-10)
- **Result:** Verified NextAuth built-in `/api/auth/signout` works via catch-all route at `src/app/api/auth/[...nextauth]/route.ts`. No new route needed. Cookie cleared on signout, redirects to `/login`. JWT expires after 7 days (SEC-02).

---

~~**SEC-03b — Add logout button to UI**~~ **READY TO TEST**

- **Assignee:** Dev 3
- **Priority:** P1
- **Completed:** 2026-04-13
- **Depends on:** SEC-03a — **SYNC-10: Wait for Tech Lead to confirm signout works**
- **Blocks:** SEC-05 (smoke test)
- **Description:** Add a "Sign Out" button to the dashboard page. Should be visible but not dominant (bottom of dashboard, after streak freeze card).
- **Implementation:**
  - Import `signOut` from `next-auth/react`
  - Call `signOut({ callbackUrl: "/login" })` on click
  - Show brief loading state while signing out
- **Acceptance Criteria:**
  - Logout button visible on dashboard
  - Clicking it signs out and redirects to `/login`
  - After logout, navigating to `/dashboard` redirects to `/login`
  - Touch target >= 44px (mobile)
- **Result:** Added "Sign Out" button in `src/app/dashboard/DashboardContent.tsx` below streak freeze card. Uses `signOut` from `next-auth/react` with `callbackUrl: "/login"`. Shows "Signing out..." loading state. Touch target: `min-h-[44px]` full width. Build passes, 41 tests pass.

---

## Day 2 — Independent Fix

---

~~**SEC-04 — npm audit fix**~~ **READY TO TEST**

- **Assignee:** Dev 3
- **Priority:** P1
- **Completed:** 2026-04-13
- **Depends on:** —
- **Blocks:** SEC-05 (smoke test)
- **Description:** Run `npm audit` and resolve findings. Current state: 3 moderate vulnerabilities in `@prisma/dev` → `@hono/node-server` (path traversal CWE-22). Fix by upgrading Prisma if compatible, or document as accepted risk if upgrade breaks.
- **Implementation:**
  - Run `npm audit` to confirm current state
  - Try `npm audit fix` first
  - If that doesn't resolve, try upgrading `prisma` and `@prisma/client` to latest patch
  - If upgrade introduces breaking changes, document the accepted risk with justification (dev-only dependency, not in production bundle)
- **Acceptance Criteria:**
  - `npm audit` shows 0 critical and 0 high vulnerabilities
  - If moderate vulns remain (dev-only), document justification in PR description
  - `npm run build` still passes after any dependency changes
  - All existing tests still pass
- **Result:** `npm audit fix` cannot resolve — requires `--force` downgrade to prisma@6.19.3 (breaking change). 3 moderate vulns remain, all in dev-only chain: `prisma` → `@prisma/dev` → `@hono/node-server` (path traversal CWE-22 in `serveStatic`). Accepted risk: dev-only dependency, not in production bundle, `serveStatic` not used. 0 critical, 0 high. Build passes, 41 tests pass.

---

## Day 4-5 — Verification

---

~~**SEC-05 — Security smoke test**~~ **DONE**

- **Assignee:** Tech Lead
- **Priority:** P0
- **Depends on:** SEC-01, SEC-02, SEC-03a, SEC-03b, SEC-04 — **SYNC-11: all tasks done**
- **Blocks:** — (final task)
- **Description:** End-to-end verification of all security fixes:
  1. **Rate limiting:** Hit `/api/answer` rapidly — verify 429 after limit
  2. **JWT expiry:** Login, inspect cookie — verify expiry ~7 days from now
  3. **Logout:** Click sign out — verify cookie cleared, `/dashboard` redirects to `/login`
  4. **npm audit:** Run `npm audit` — verify 0 critical/high
  5. **Regression:** Full user journey still works (login → quiz → dashboard → XP → streak)
- **Acceptance Criteria:** All 5 checks pass. No regressions in core flow.

---

### DOING

_No tasks in progress._

### READY TO TEST

_No tasks pending review._

### DONE

- **SEC-01** — Rate limiting on sensitive endpoints (Tech Lead, 2026-04-13)
- **SEC-02** — Reduce JWT session maxAge to 7 days (Tech Lead, 2026-04-13)
- **SEC-03a** — Wire up signOut (Tech Lead, 2026-04-13)
- **SEC-03b** — Add logout button to UI (Dev 3, 2026-04-13)
- **SEC-04** — npm audit fix (Dev 3, 2026-04-13)
- **SEC-05** — Security smoke test (Tech Lead, 2026-04-13)

---

## Task Assignment Summary

| Dev | Day 1-2 Tasks | Day 3 Tasks | Day 4-5 Tasks | Total |
| :-- | :------------ | :---------- | :------------ | :---- |
| **Tech Lead** (BE + Security) | SEC-01 (rate limiting), SEC-02 (JWT expiry) | SEC-03a (signOut wiring) | SEC-05 (smoke test) | **4 tasks** |
| **Dev 3** (Frontend) | SEC-04 (npm audit fix) | SEC-03b (logout button) | — | **2 tasks** |

## Dependency & Sync Summary

| Task | Depends On | Blocks | Sync Point |
| :--- | :--------- | :----- | :--------- |
| SEC-01 | — | SEC-05 | — |
| SEC-02 | — | SEC-05 | — |
| SEC-03a | — | SEC-03b | **SYNC-10:** Tech Lead → Dev 3 |
| SEC-03b | **SEC-03a** | SEC-05 | **SYNC-10:** Dev 3 ← waits for Tech Lead |
| SEC-04 | — | SEC-05 | — |
| SEC-05 | All | — | **SYNC-11:** all test together |

## Notes for Devs

1. **SEC-01 is the highest-risk fix.** Without rate limiting, `/api/answer` can be spammed to farm unlimited XP. Ship this first.
2. **Rate limiter must be zero-dependency.** No Redis, no Upstash, no external packages. In-memory Map with TTL is correct for single-region Vercel serverless. Document the cold-start caveat.
3. **SEC-02 is a one-line config change** but has big impact — reduces token exposure window from 30 days to 7.
4. **SEC-03 uses NextAuth's built-in signout.** Don't reinvent — verify the catch-all route handler works, then Dev 3 wires up the button.
5. **SEC-04 may be a no-op** if the vulns are dev-only and unfixable without a major version bump. Document and move on if so.
6. **All PRs require Tech Lead review** before merge to `main`.
7. **Branch naming:** `sprint4/SEC-XX-short-description`.

## Out of Scope (External Service — Flag to Sec Team)

These items from the checklist require action outside the codebase:

| Item | Where | Action Required |
| :--- | :---- | :-------------- |
| DB backups configured + tested | Supabase Dashboard | Enable Point-in-Time Recovery, test restore |
| Separate dev/prod databases | Supabase Dashboard | Create separate project for dev |
| Non-root DB user | Supabase Dashboard | Create app-specific role with minimal privileges |
| Env vars on production | Vercel Dashboard | Verify all vars match `.env.local.example` |
| SSL certificate valid | Vercel | Auto-managed, verify via browser |
| Firewall (80/443 only) | Vercel | Platform-managed, no action needed |
| Process manager | Vercel | Serverless — no PM2/systemd needed |
| Rollback plan | Vercel | Use instant rollback feature, document procedure |
| Staging test before prod | Vercel | Use preview deployments as staging |

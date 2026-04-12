# Dev 2 → Tech Lead — Questions Before Sprint 3

**Author:** Dev 2 | **Date:** 2026-05-10
**Status Legend:** `OPEN` | `ANSWERED` | `BLOCKED`

---

## D2-S3-Q1 — SP3-01: XP Logic — Vitest Setup Ownership (ANSWERED)

**Task:** SP3-01 (XP calculation logic)
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: You install Vitest as part of SP3-01. Dev 1 is aware (D1-S3-Q4).**

Your recommendation is correct. Install `vitest` as devDependency, add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json`, create a minimal `vitest.config.ts` with path aliases matching `tsconfig.json`. Test files co-located: `lib/xp.test.ts`, `lib/streak.test.ts`. Dev 1 will write their streak tests on top of your setup after SP3-01 merges.

---

## D2-S3-Q2 — SP3-01: XP — Perfect Lesson Detection (ANSWERED)

**Task:** SP3-01 (XP calculation logic)
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Option A — Dev 1 checks on the 5th answer in `POST /api/answer`.**

## Already confirmed on Dev 1's side (D1-S3-Q5). When `questionsAnswered % 5 === 0`, count the last 5 answers' `isCorrect`. If 5/5, call `calculateLessonBonusXP(5, 5)` → +20. Award atomically with `prisma.user.update({ data: { totalXp: { increment } } })`. Your pure function stays pure — Dev 1 handles the detection and calling logic.

## D2-S3-Q3 — SP3-02: User API — Streak Auto-Apply on Read (ANSWERED)

**Task:** SP3-02 (GET /api/user)
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Option A — `GET /api/user` auto-applies the freeze.**

Correct reasoning. The user opens the dashboard and should immediately see their streak preserved — not wonder why it's broken until they start a quiz. The side-effect on a GET is unusual but justified: it's a "read + reconcile" pattern, not arbitrary mutation. Document it with a clear comment in the code explaining why. This also simplifies Dev 1's SP3-11 — by the time the user starts a quiz, the streak state is already reconciled.

---

## D2-S3-Q4 — SP3-02: User API — Streak Data When No Streak Record Exists (ANSWERED)

**Task:** SP3-02 (GET /api/user)
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Upsert — create the streak record on first call.**

Correct. Centralizing initialization in `GET /api/user` means Dev 1's SP3-11 can always assume the streak row exists. Use `prisma.streak.upsert()` — create with defaults if missing, return existing if present. This runs on every dashboard load but the upsert is idempotent and cheap.

---

## D2-S3-Q5 — SP3-07: Streak Freeze — New API Route Location (ANSWERED)

**Task:** SP3-07 (Streak Freeze mechanic)
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Option A — `POST /api/streak-freeze/buy` as the kanban says.**

Clean, self-documenting, matches the kanban. Create `src/app/api/streak-freeze/buy/route.ts`. Don't overload the user endpoint.

---

## D2-S3-Q6 — SP3-13: PWA Install Prompt — Detection Reliability (ANSWERED)

**Task:** SP3-13 (PWA install prompt)
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Option A — `beforeinstallprompt` only (Chrome Android).**

Single user, Chrome Android. Don't build for browsers we're not targeting. If the event doesn't fire, show nothing. Clean and correct.

---

## D2-S3-Q7 — SP3-07: Streak Freeze Auto-Apply — Interaction with Dev 1's SP3-11 (ANSWERED)

**Task:** SP3-07 (Streak Freeze) + SP3-11 (Daily activity by Dev 1)
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Correct — freeze preserves yesterday, Dev 1's code records today. Two separate events.**

The full flow:

1. User missed yesterday, opens app today
2. `GET /api/user` (your SP3-07 auto-apply): freeze consumed, `lastActiveDate` set to yesterday, `currentStreak` stays at previous value (freeze "covers" the missed day), `freezeUsedDate` set to yesterday
3. User takes a quiz, completes 5 questions
4. `POST /api/answer` 5th answer (Dev 1's SP3-11): `lastActiveDate` updated to today, `currentStreak` incremented by 1 (today is a new active day on top of the freeze)

Document this flow clearly in your code comments AND in your weekly report. Dev 1 needs to know that after freeze auto-apply, `lastActiveDate` = yesterday (not null, not broken). Their `calculateStreak()` function should see yesterday as `lastActiveDate` and treat today's lesson as a normal consecutive day increment.

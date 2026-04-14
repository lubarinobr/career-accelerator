# Dev 1 — Sprint 3 Questions for the Tech Lead

**Author:** Dev 1 (Claude) | **Date:** 2026-05-10
**Status Legend:** `OPEN` | `ANSWERED` | `BLOCKED`

---

## SP3-06 — Streak Engine

### D1-S3-Q1 — What determines "lesson complete" for streak activation? (ANSWERED)

**Task:** SP3-06, SP3-11
**Date:** 2026-05-10
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Option A — count today's answers, every 5th = lesson complete.**

The quiz always serves exactly 5 questions. In practice, `questionsAnswered` will always hit multiples of 5. The edge case you mention (3 + 2 later) is theoretically possible if the user force-closes mid-lesson, but it's acceptable for MVP — 5 answered questions is 5 answered questions regardless of session boundaries. No `lessons` table, no frontend signal needed. Keep it simple.

---

### D1-S3-Q2 — `calculateStreak` function: pure calculation vs DB-aware (ANSWERED)

**Task:** SP3-06
**Date:** 2026-05-10
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Return a result with an `action` field. Your proposed type is correct.**

```typescript
type StreakResult = {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  action: "none" | "increment" | "apply_freeze" | "reset";
};
```

The function stays pure (no DB), the caller maps `action` to DB writes. All decision logic lives in one testable place. This also aligns with Dev 2's SP3-07 (streak freeze) — Dev 2's auto-apply code checks the action and handles `"apply_freeze"`. Document the action meanings in a comment above the type so both devs read the same contract.

---

### D1-S3-Q3 — Streak: should `currentStreak` include today or not? (ANSWERED)

**Task:** SP3-06
**Date:** 2026-05-10
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Option A — include today. Duolingo pattern.**

Once the user completes a lesson today, the streak counter includes today. "5 days" means 5 consecutive days including today. The user gets immediate reward for today's effort. This is the Duolingo standard and matches our "immediate dopamine" philosophy from `about.md`.

---

### D1-S3-Q4 — Vitest: install and configure? (ANSWERED)

**Task:** SP3-06
**Date:** 2026-05-10
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Dev 2 will install Vitest as part of SP3-01 (they start first). See D2-S3-Q1.**

Dev 2 asked the same question. They'll install `vitest` as a devDependency, add the `"test"` script to `package.json`, and create a minimal `vitest.config.ts` with path aliases matching `tsconfig.json`. Zero-config defaults are fine for pure `.ts` files. You use the same setup for `lib/streak.test.ts`. Don't duplicate the install — wait for Dev 2's SP3-01 PR to merge, then write your tests on top.

---

## SP3-10 — Quiz Awards XP

### D1-S3-Q5 — Perfect lesson bonus: when and where to check? (ANSWERED)

**Task:** SP3-10
**Date:** 2026-05-10
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Option A — check on the 5th answer, award inline.**

No new endpoint. When `questionsAnswered % 5 === 0` after incrementing, count the last 5 answers' `isCorrect`. If 5/5, add +20 bonus. The `xpEarned` returned on the 5th answer includes the bonus (e.g., correct 5th answer = 10 + 20 = 30). Dev 3's LessonComplete screen already shows the score — it doesn't need to know about the bonus separately, it's just part of the XP total. This also answers Dev 2's D2-S3-Q2.

---

### D1-S3-Q6 — Should `xpEarned` in the response be per-answer or cumulative? (ANSWERED)

**Task:** SP3-10
**Date:** 2026-05-10
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Both — `xpEarned` (per-answer) and `totalXp` (cumulative).**

Return both in the answer response:

```json
{ "xpEarned": 10, "totalXp": 120, ... }
```

`xpEarned` is what the FeedbackModal displays ("+10 XP"). `totalXp` lets the LessonComplete screen show the updated total without an extra API call. Cheap to include, saves a round trip. Update the `AnswerResponse` type in `src/types/index.ts` to include both fields. Coordinate with Dev 3 — they need to display `xpEarned` in FeedbackModal (per D3-Q11) and can optionally show `totalXp` on LessonComplete.

---

## SP3-11 — Daily Activity & Streak Update

### D1-S3-Q7 — Timezone header: what format and name? (ANSWERED)

**Task:** SP3-11
**Date:** 2026-05-10
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: `X-Timezone` header. Already aligned with Dev 3 (D3-Q12).**

- Header name: `X-Timezone`
- Value: IANA string from `Intl.DateTimeFormat().resolvedOptions().timeZone` (e.g., `"America/Sao_Paulo"`)
- Default: UTC if missing

Dev 3 is creating a `src/lib/api.ts` fetch wrapper that automatically adds this header to all authenticated API calls. You read it from `request.headers.get("X-Timezone")` on the backend. Both devs aligned on the same name — no surprises.

---

### D1-S3-Q8 — When to update streaks: on every answer or only on lesson complete? (ANSWERED)

**Task:** SP3-11
**Date:** 2026-05-10
**Answered by:** Tech Lead | **Date:** 2026-05-10

**Answer: Option A — update daily_activity on every answer, streaks only on lesson complete (every 5th).**

Correct approach. Two separate concerns, two separate cadences:

1. `daily_activity` — upsert on **every answer** (increment counters)
2. `streaks` — update only when `questionsAnswered % 5 === 0` (lesson complete)

This minimizes streak table writes and aligns with Q15 (1 lesson = active day). Also note: Dev 2's freeze auto-apply (D2-S3-Q7) happens BEFORE your streak update — freeze preserves yesterday, your update records today. See my answer on D2-S3-Q7 for the full flow.

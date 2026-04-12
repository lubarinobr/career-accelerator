# Dev 1 — Week 3 Report (Sprint 3)

**Sprint:** Sprint 3 — Gamification & Polish
**Week:** Sprint 3, full (2026-05-10)
**Dev:** Dev 1 (Claude)

---

## Day 1 — 2026-05-10

### Sprint 3 Kickoff & Questions

Read `kanban-sprint3.md`. My tasks:
- **Week 1:** SP3-06 (streak engine) — no dependencies
- **Week 2:** SP3-10 (quiz XP), SP3-11 (daily activity + streak update) — depends on SYNC-7

Wrote 8 questions for the Tech Lead in `dev1/sprint3-techleader-questions.md`. All answered.

**Key decisions:**
- Lesson complete = every 5th answer today (count-based, D1-S3-Q1)
- `calculateStreak` returns `action` field for caller to handle DB writes (D1-S3-Q2)
- Streak includes today (Duolingo-style, D1-S3-Q3)
- Vitest installed by Dev 2 in SP3-01 (D1-S3-Q4)
- Perfect lesson bonus awarded inline on 5th answer (D1-S3-Q5)
- Response returns both `xpEarned` (per-answer) and `totalXp` (cumulative) (D1-S3-Q6)
- Timezone via `X-Timezone` header, default UTC (D1-S3-Q7)
- `daily_activity` on every answer, `streaks` only on lesson complete (D1-S3-Q8)

### Codebase State

Dev 2 completed SP3-01 (XP logic + Vitest) and SP3-03 (leveling). SYNC-7 cleared. Dev 3 completed SP3-04, SP3-05, SP3-08 (UI components). All Week 1 tasks done by other devs.

### Implementation

**SP3-06 — Streak engine** — READY TO TEST

`src/lib/streak.ts`:
- `calculateStreak(lastActiveDate, today, currentStreak, longestStreak, freezeUsedDate, hasFreezesAvailable)` — pure function returning `StreakResult` with `action: "none" | "increment" | "apply_freeze" | "reset"`
- `getLocalDate(timezone)` — IANA timezone to YYYY-MM-DD using `Intl.DateTimeFormat`, falls back to UTC
- Helper functions: `diffDays()`, `addDays()` for date math

`src/lib/streak.test.ts` — 13 unit tests:
- First-time user (null lastActive) → increment to 1
- Already active today → none
- Consecutive day → increment
- Longest streak update on new record
- Missed 1 day with freeze → apply_freeze
- Freeze saves a record streak → updates longest
- Missed 1 day without freeze → reset to 1
- Freeze already applied for missed day → increment (not double-freeze)
- Missed 2+ days with freeze → reset (freeze can't save)
- Missed many days → reset
- First-time user preserves existing longestStreak
- Timezone formatting (valid, UTC, invalid fallback)

**SP3-10 — Update quiz flow to award XP** — READY TO TEST

Updated `POST /api/answer` (`src/app/api/answer/route.ts`):
- Calls `calculateAnswerXP(isCorrect)` — correct=10, wrong=2
- Saves real `xpEarned` to `user_answers` (no longer hardcoded 0)
- Updates `user.totalXp` atomically via Prisma `increment`
- On every 5th answer (lesson complete): queries last 5 answers, checks for 5/5 perfect, awards +20 bonus
- Bonus added to `xpEarned` and `daily_activity.xpEarned`
- Returns `xpEarned` (per-answer, includes bonus) and `totalXp` (cumulative after update)
- Added `totalXp: number` to `AnswerResponse` in `src/types/index.ts`

**SP3-11 — Update quiz flow to record daily activity** — READY TO TEST

Updated `POST /api/answer` (same file):
- Reads `X-Timezone` header (default UTC)
- Uses `getLocalDate(timezone)` to determine today's date
- Upserts `daily_activity` on every answer: increments `questionsAnswered`, `correctCount`, `xpEarned`
- On lesson complete (every 5th answer): reads streak from DB, calls `calculateStreak()`, performs DB write based on `action`:
  - `"increment"` → upsert streak with new count + today as lastActiveDate
  - `"apply_freeze"` → same + decrement freezesAvailable + set freezeUsedDate to yesterday
  - `"reset"` → upsert streak with count=1 + today as lastActiveDate
  - `"none"` → no streak write

### Build & Test Verification

- `npm run build` — passes
- `npm test` — 34 tests pass (13 streak + 21 XP)
- `npm run lint` — passes

---

## Blockers

None. All Dev 1 Sprint 3 tasks are complete.

---

## Sprint 3 Summary

| Task | Status | Notes |
|:-----|:-------|:------|
| SP3-06 — Streak engine | READY TO TEST | Pure functions + 13 unit tests |
| SP3-10 — Quiz awards XP | READY TO TEST | Real XP calc, atomic update, perfect bonus, returns xpEarned + totalXp |
| SP3-11 — Daily activity + streaks | READY TO TEST | Upsert daily_activity, streak update on lesson complete, freeze auto-apply |

**All Dev 1 Sprint 3 tasks are complete and READY TO TEST.** The answer route now handles the full flow: save answer → calculate XP → AI feedback (wrong only) → update daily activity → update streaks (every 5th) → update user total XP → return response.

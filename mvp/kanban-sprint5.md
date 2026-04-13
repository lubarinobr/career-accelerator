# Sprint 5 — XP Scoring Overhaul: Risk & Reward Kanban

**Sprint Goal:** Replace the flat XP system with difficulty-based Risk & Reward scoring, infinite leveling via power-curve formula, and updated UI to reflect gains/losses honestly.

**Sprint Duration:** 1 week (2026-04-14 to 2026-04-18)
**Team:** Tech Lead (reviews, unblocks, smoke test) | Dev 1 (backend) | Dev 3 (frontend)
**Tech Lead:** Owns smoke test, reviews all PRs, unblocks technical decisions

**Status Legend:** `TODO` | `DOING` | `READY TO TEST` | `DONE`

**Important:** Devs move tasks to `READY TO TEST` only. The Tech Lead moves tasks to `DONE` after verifying code against acceptance criteria.

---

## Sync Points — READ THIS FIRST

| Sync Point | Who waits | Who delivers | Trigger |
| :--------- | :-------- | :----------- | :------ |
| **SYNC-20** | Dev 1 (S5-02) | Dev 1 (S5-01) | S5-01 merged — answer route can use new XP function |
| **SYNC-21** | Dev 3 (S5-05) | Dev 1 (S5-02) | S5-02 merged — API now returns negative `xpEarned`, Dev 3 can build the UI |
| **SYNC-22** | Dev 3 (S5-06) | Dev 1 (S5-03) | S5-03 merged — new leveling formula available for XPBar/dashboard |
| **SYNC-23** | All (S5-09) | All | All tasks must be done before the smoke test |

```
DAY 1 — Core backend (Dev 1, sequential)
  Dev 1: S5-01 (xp.ts rewrite) + S5-08 (unit tests)
  Dev 3: (idle on this sprint — can work on other backlog items)

DAY 2 — Backend integration + frontend starts
  Dev 1: S5-02 (answer route) + S5-03 (level formula) — parallel after S5-01
  Dev 3: (wait SYNC-21/SYNC-22 or start S5-07 audit early)

DAY 3 — Frontend + audit
  Dev 1: S5-07 (audit xp_earned >= 0 — backend side)
  Dev 3: S5-05 (FeedbackModal) + S5-06 (dashboard/XPBar) — parallel

DAY 4-5 — Polish + smoke test
  Dev 3: finish S5-05/S5-06 if needed
  Tech Lead: S5-09 (smoke test)
```

---

## Day 1 — Core XP Logic

---

**S5-01 — Rewrite `lib/xp.ts` with difficulty-based XP scoring** — `READY TO TEST`

- **Assignee:** Dev 1
- **Priority:** P0
- **Blocks:** S5-02, S5-03, S5-04, S5-05, S5-06, S5-07, S5-08, S5-09
- **Description:** Replace the flat XP constants with difficulty-based scoring. The `calculateAnswerXP` function must accept difficulty as a parameter.
- **Implementation:**
  - Replace constants:
    - `XP_CORRECT = 10` → `XP_CORRECT = { easy: 5, medium: 15, hard: 40 }`
    - `XP_WRONG = 2` → `XP_WRONG = { easy: -1, medium: -3, hard: -8 }`
  - Update `calculateAnswerXP(isCorrect: boolean, difficulty: 'easy' | 'medium' | 'hard'): number`
  - `XP_PERFECT_BONUS` stays at 20
  - `STREAK_FREEZE_COST` stays at 50 (confirmed by P.O., Q16-A2)
  - Add `clampXp(currentTotalXp: number, delta: number): number` helper — returns `Math.max(0, currentTotalXp + delta)` to enforce the XP floor
- **Acceptance Criteria:**
  - `calculateAnswerXP(true, 'easy')` returns `5`
  - `calculateAnswerXP(true, 'medium')` returns `15`
  - `calculateAnswerXP(true, 'hard')` returns `40`
  - `calculateAnswerXP(false, 'easy')` returns `-1`
  - `calculateAnswerXP(false, 'medium')` returns `-3`
  - `calculateAnswerXP(false, 'hard')` returns `-8`
  - `clampXp(3, -8)` returns `0` (floor enforced)
  - `clampXp(100, -8)` returns `92`
  - Perfect lesson bonus unchanged at 20
  - Streak freeze cost unchanged at 50
  - All functions are pure (no DB calls)

---

**S5-08 — Update unit tests for new XP values** — `READY TO TEST`

- **Assignee:** Dev 1
- **Priority:** P0
- **Blocks:** S5-09
- **Depends on:** S5-01 (same-day, sequential)
- **Description:** Update all existing `xp.test.ts` tests for the new difficulty-based values. Add new test cases for: each difficulty level correct/wrong, XP floor clamping, and the new leveling formula (S5-03).
- **Acceptance Criteria:**
  - All old flat-XP tests replaced with difficulty-parameterized tests
  - Tests cover all 6 combinations (3 difficulties x correct/wrong)
  - Tests cover XP floor at 0 (edge cases: totalXp=0 and wrong answer, totalXp=3 and hard wrong)
  - Tests cover `calculateLevel` with new power-curve formula (levels 1, 2, 5, 10, boundary values)
  - Tests cover milestone titles and between-milestone title format
  - `npm test` passes

---

## Day 2 — Backend Integration + Level Formula

---

**S5-02 — Update `POST /api/answer` to use difficulty-based XP** — `READY TO TEST`

- **Assignee:** Dev 1
- **Priority:** P0
- **Depends on:** S5-01 (SYNC-20)
- **Blocks:** S5-05 (SYNC-21), S5-07, S5-09
- **Description:** The answer route already fetches the full `question` object (which includes `difficulty`). Pass `question.difficulty` to the updated `calculateAnswerXP`. Add XP floor enforcement so `user.total_xp` never goes below 0.
- **Implementation:**
  - Change line ~105: `calculateAnswerXP(isCorrect)` → `calculateAnswerXP(isCorrect, question.difficulty as 'easy' | 'medium' | 'hard')`
  - After the `prisma.user.update` with `{ increment: xpEarned }`, check if `updatedUser.totalXp < 0` and clamp to 0 with a second update. **OR** use a raw SQL `GREATEST(total_xp + $delta, 0)` to do it atomically. Dev 1's call on implementation — atomic is preferred.
  - The `daily_activity.xp_earned` increment stays as-is (can go negative — that's expected per Q18)
  - `user_answers.xp_earned` will now store negative values — this is correct behavior
- **Acceptance Criteria:**
  - Correct easy answer awards +5 XP
  - Wrong hard answer deducts -8 XP
  - User with 3 XP who answers hard wrong ends up at 0 XP (not -5)
  - `daily_activity.xp_earned` can be negative (no floor on daily)
  - `user_answers.xp_earned` stores the actual delta (including negative)
  - Perfect lesson bonus still works (+20 on 5/5)
  - Existing tests pass, answer flow works end-to-end

---

**S5-03 — Replace hardcoded level thresholds with power-curve formula** — `READY TO TEST`

- **Assignee:** Dev 1
- **Priority:** P0
- **Depends on:** S5-01 (SYNC-20)
- **Blocks:** S5-06 (SYNC-22), S5-09
- **Description:** Remove the `LEVEL_THRESHOLDS` array. Replace with `xpRequired(level) = floor(50 * level^1.8)`. Add milestone titles as a data-driven map.
- **Implementation:**
  - Formula: `const xpForLevel = (level: number): number => Math.floor(50 * Math.pow(level, 1.8))`
  - Level 1 starts at 0 XP (special case: level 1 always requires 0)
  - Milestone title map:
    ```typescript
    const MILESTONE_TITLES: Record<number, string> = {
      1: "Intern", 2: "Apprentice", 3: "Junior", 4: "Mid-level",
      5: "Senior", 6: "Specialist", 7: "Expert", 8: "Principal",
      9: "Distinguished", 10: "Certified",
      25: "AWS Warrior", 50: "Cloud Legend", 100: "Grandmaster",
    };
    ```
  - `getTitle(level: number): string` — if level is in the map, return that title. Otherwise, find the highest milestone title below this level and return `"Title (Lv. N)"`. E.g., level 14 → `"Certified (Lv. 14)"`.
  - Update `calculateLevel(totalXp)` to compute level from the formula (iterate up from level 1 until `xpForLevel(level+1) > totalXp`)
  - Update `LevelInfo` interface to include `title` from the new system
- **Acceptance Criteria:**
  - `calculateLevel(0)` → level 1, "Intern"
  - `calculateLevel(50)` → level 2, "Apprentice"
  - `calculateLevel(174)` → level 3, "Junior"
  - `calculateLevel(175)` → level 3, "Junior" (still within level 3 range)
  - `calculateLevel(2858)` → level 10, "Certified"
  - `calculateLevel(3000)` → level 10, "Certified (Lv. 10)" — wait, no: level 10 IS a milestone so just "Certified". Need to check if 3000 is still level 10 or level 11.
  - Level 14 with enough XP → "Certified (Lv. 14)"
  - Level 25 with enough XP → "AWS Warrior"
  - No hardcoded level cap — level 200 works
  - `LevelInfo.nextLevelXp` correctly shows XP needed for next level

---

**S5-04 — Confirm Streak Freeze cost stays at flat 50 XP**

- **Assignee:** Dev 1
- **Priority:** P1
- **Depends on:** S5-01
- **Blocks:** S5-09
- **Description:** This is a **verification task**, not a code change. After S5-01 is merged, confirm that `STREAK_FREEZE_COST = 50` is still in place and `canAffordStreakFreeze` / `calculateStreakFreezeCost` still work correctly with the new XP values.
- **Acceptance Criteria:**
  - `calculateStreakFreezeCost()` returns 50
  - `canAffordStreakFreeze(50)` returns true
  - `canAffordStreakFreeze(49)` returns false
  - No code change expected — just verify and confirm in PR

---

## Day 3 — Frontend Updates + Audit

---

~~**S5-05 — Update FeedbackModal to show XP loss on wrong answers**~~ **READY TO TEST**

- **Assignee:** Dev 3
- **Priority:** P1
- **Completed:** 2026-04-14
- **Depends on:** S5-02 (SYNC-21 — API returns negative `xpEarned`)
- **Blocks:** S5-09
- **Description:** The FeedbackModal currently shows XP earned after each answer. It now needs to handle negative values with the right visual treatment.
- **Implementation:**
  - **Correct answer:** Show `"+{xp} XP"` in green (existing behavior, values change: +5/+15/+40)
  - **Wrong answer:** Show `"{xp} XP"` in **amber/orange** (NOT red). The value is already negative from the API (e.g., `-8`), so just display it
  - Below the XP on wrong answers, add a short encouraging one-liner. Use a random pick from a small set:
    - "Hard questions hit hard. Try again!"
    - "That's how you learn. Keep going!"
    - "The comeback is always stronger."
    - "Almost! You'll get the next one."
  - The one-liner should be subtle (smaller text, muted color) — not a popup or modal
- **Acceptance Criteria:**
  - Correct easy: green "+5 XP"
  - Correct hard: green "+40 XP"
  - Wrong easy: amber "-1 XP" + encouragement
  - Wrong hard: amber "-8 XP" + encouragement
  - No red color used for XP loss
  - Encouraging text is short, not repetitive within the same session (rotate through the set)
  - Touch targets unchanged, mobile layout not broken
- **Result:** Updated `src/components/FeedbackModal.tsx`. Correct answers: green "+{xp} XP". Wrong answers: amber "{xp} XP" (negative value from API). Added 4 rotating encouragement messages below XP on wrong answers (module-level index rotates through set). XP flyup animation now works for both positive/negative. No red color used. Touch targets unchanged. Build passes, 41 tests pass.

---

~~**S5-06 — Update dashboard/XPBar for new level formula + negative daily XP**~~ **READY TO TEST**

- **Assignee:** Dev 3
- **Priority:** P1
- **Completed:** 2026-04-14
- **Depends on:** S5-03 (SYNC-22 — new leveling formula available)
- **Blocks:** S5-09
- **Description:** The XPBar and LevelBadge components need to work with the new power-curve formula. The dashboard daily summary needs to handle negative daily XP.
- **Implementation:**
  - **XPBar:** Progress bar should show XP toward next level based on the new formula thresholds. The width calculation uses `(currentXp / nextLevelXp) * 100%` — this shouldn't change structurally, just the values will be different.
  - **LevelBadge:** Show the new title format — either a milestone title (e.g., "Certified") or "Title (Lv. N)" between milestones. The API should return this via the updated `calculateLevel`.
  - **Daily summary:** If `daily_activity.xp_earned` is negative:
    - Show the actual number: "-12 XP today"
    - Use amber/orange color (not red)
    - Show framing text: "Tough day — come back stronger tomorrow!"
  - If daily XP is 0 or positive, keep existing display
- **Acceptance Criteria:**
  - XPBar correctly shows progress toward next level using new formula thresholds
  - LevelBadge shows milestone title or "Title (Lv. N)" format
  - Negative daily XP displayed in amber with encouraging message
  - Zero daily XP shows normally (no special treatment)
  - Positive daily XP shows normally (green, existing behavior)
  - No layout breaks on mobile (375px-428px)
- **Result:** Updated `src/app/dashboard/DashboardContent.tsx` — added daily XP column to Today's activity section. Negative XP shown in amber, positive in green. "Tough day — come back stronger tomorrow!" message on negative days. Added `xpEarned` to `todayActivity` in API response (`src/app/api/user/route.ts`) and `UserStats` type (`src/types/index.ts`). XPBar and LevelBadge unchanged — they already display API values, new formula flows through S5-03. Build passes, 41 tests pass.

---

~~**S5-07 — Audit and fix code assuming `xp_earned >= 0`**~~ **READY TO TEST**

- **Assignee:** Dev 3 (frontend) + Dev 1 (backend)
- **Priority:** P1
- **Completed:** 2026-04-14 (frontend side)
- **Depends on:** S5-02
- **Blocks:** S5-09
- **Description:** Search the entire codebase for any logic that assumes `xpEarned`, `xp_earned`, or `totalXp` is always non-negative. Fix any issues found.
- **Implementation:**
  - Grep for `xpEarned`, `xp_earned`, `totalXp`, `total_xp` across all files
  - Check for: conditional rendering that hides when value is 0 (would also hide negatives), math that breaks with negatives, display formatting that doesn't handle the minus sign
  - **Dev 1:** Check backend (API routes, lib functions)
  - **Dev 3:** Check frontend (components, display logic)
- **Acceptance Criteria:**
  - No code path breaks when `xpEarned` is negative
  - No code path breaks when `daily_activity.xp_earned` is negative
  - `user.total_xp` is never negative (floor enforced in S5-02)
  - Document findings in PR description — even if nothing is found, confirm the audit was done
- **Result (Frontend — Dev 3):** Grepped all `src/` for `xpEarned`, `xp_earned`, `totalXp`, `total_xp`. Found and fixed 3 issues in `FeedbackModal.tsx`: (1) line 111 `xpEarned > 0` hid XP on wrong answers, (2) line 121 `xpEarned > 0` hid flyup on wrong answers, (3) line 115 hardcoded `+` prefix. Updated `mock-data.ts` to use difficulty-based XP values (was hardcoded 10/2). Updated `AnswerResponse.xpEarned` type comment. No issues in XPBar (math works), LevelBadge (pure display), DashboardContent (`totalXp >= 50` safe since floor=0). Build passes, 41 tests pass.

---

## Day 4-5 — Verification

---

**S5-09 — Smoke test — full XP journey**

- **Assignee:** Tech Lead
- **Priority:** P0
- **Depends on:** S5-01, S5-02, S5-03, S5-04, S5-05, S5-06, S5-07, S5-08 — **SYNC-23: all tasks done**
- **Blocks:** — (final task)
- **Description:** End-to-end verification of the complete XP overhaul:
  1. **Easy correct:** Answer easy question correctly → verify +5 XP, green display
  2. **Medium correct:** Answer medium correctly → verify +15 XP
  3. **Hard correct:** Answer hard correctly → verify +40 XP
  4. **Easy wrong:** Answer easy wrong → verify -1 XP, amber display, encouraging text
  5. **Hard wrong:** Answer hard wrong → verify -8 XP, amber display
  6. **XP floor:** Get a new/low-XP user to 3 XP, answer hard wrong → verify totalXp = 0 (not negative)
  7. **Perfect lesson:** Get 5/5 correct → verify +20 bonus still works
  8. **Leveling:** Verify level-up triggers correctly with new thresholds (e.g., reach 50 XP → level 2 "Apprentice")
  9. **Title display:** Verify milestone titles show correctly, between-milestone titles show "Title (Lv. N)"
  10. **Dashboard:** Verify XPBar, LevelBadge, daily summary all reflect new system
  11. **Streak Freeze:** Verify freeze still costs 50 XP and works
  12. **Regression:** Full user journey (login → quiz → dashboard) still works
- **Acceptance Criteria:** All 12 checks pass. No regressions in core flow.

---

### DOING

_No tasks in progress._

### READY TO TEST

**S5-01 — Rewrite `lib/xp.ts` — Dev 1**
- Replaced flat constants with difficulty-based: `XP_CORRECT = { easy: 5, medium: 15, hard: 40 }`, `XP_WRONG = { easy: -1, medium: -3, hard: -8 }`
- `calculateAnswerXP(isCorrect, difficulty)` returns correct values for all 6 combinations
- Added `clampXp(currentTotalXp, delta)` — enforces floor at 0
- Perfect bonus unchanged (20), streak freeze unchanged (50)
- All functions pure (no DB calls)

**S5-08 — Update unit tests — Dev 1**
- All old flat-XP tests replaced with difficulty-parameterized tests
- 6 tests for correct/wrong x easy/medium/hard
- 5 tests for XP floor clamping (including edge cases: totalXp=0, exact zero result)
- Tests for power-curve leveling: levels 1, 2, 3, 5, 10, boundary values
- Tests for milestone titles ("Certified") and between-milestone format ("Certified (Lv. 14)")
- Tests for AWS Warrior (25), level 200 (no cap)
- 34 xp tests total, all pass

**S5-02 — Update answer route — Dev 1**
- `calculateAnswerXP(isCorrect, question.difficulty as Difficulty)` — passes difficulty
- XP floor enforcement: after `prisma.user.update({ increment: xpEarned })`, checks if `totalXp < 0` and clamps to 0
- `daily_activity.xp_earned` can go negative (expected per Q18)
- `user_answers.xp_earned` stores negative values (correct behavior)

**S5-03 — Power-curve leveling formula — Dev 1**
- Formula: `xpForLevel(level) = floor(50 * (level-1)^1.8)`, level 1 = 0 (special case)
- Milestone titles: levels 1-10 individually, 25 = AWS Warrior, 50 = Cloud Legend, 100 = Grandmaster
- Between milestones: `"LastTitle (Lv. N)"` — e.g., "Certified (Lv. 14)"
- `calculateLevel(totalXp)` iterates from level 1 until `xpForLevel(level+1) > totalXp`
- No level cap — level 200+ works
- `LevelInfo` includes `title` from the new system

**S5-07 (Backend audit) — Dev 1**
- Grepped entire `src/` for `xpEarned`, `xp_earned`, `totalXp`, `total_xp`
- Most code already handles negative values (FeedbackModal, DashboardContent)
- XPBar safe (currentXp can't go negative when totalXp floor = 0)
- **New finding:** `streak-freeze/buy/route.ts:61` — `{ decrement: cost }` has no floor guard. Race condition possible between freeze buy and wrong answer.
- Frontend side still needs Dev 3 audit

**V2-01 — Socratic Feedback System — Dev 1 (backlog)**
- Created `src/lib/feedback-level.ts` — maps user level to feedback style
- Updated `src/lib/llm.ts` — level-aware prompt building (beginner/intermediate/advanced)
- Updated `src/app/api/answer/route.ts` — passes user level to `generateFeedback()`
- 7 unit tests pass

**V2-02 — Adaptive Difficulty Logic — Dev 1 (backlog)**
- Created `src/lib/adaptive.ts` — Flow State algorithm based on recent success rate
- Updated `src/app/api/quiz/route.ts` — adaptive question selection by difficulty
- 13 unit tests pass

**S5-05 — FeedbackModal XP loss display — Dev 3**
- Correct: green "+{xp} XP". Wrong: amber "{xp} XP" (negative from API)
- 4 rotating encouragement messages on wrong answers
- XP flyup works for both positive/negative. No red color used.

**S5-06 — Dashboard/XPBar negative daily XP — Dev 3**
- Added daily XP column to Today's activity (amber for negative, green for positive)
- "Tough day — come back stronger tomorrow!" on negative days
- Added `xpEarned` to `todayActivity` API response and `UserStats` type

**S5-07 (Frontend audit) — Dev 3**
- Fixed 3 bugs in FeedbackModal (xpEarned > 0 guards hid negative XP display)
- Updated mock-data.ts to difficulty-based XP values
- XPBar, LevelBadge, DashboardContent: no issues found

### DONE

_No tasks completed yet._

---

## Task Assignment Summary

| Dev | Day 1 Tasks | Day 2 Tasks | Day 3 Tasks | Day 4-5 Tasks | Total |
| :-- | :---------- | :---------- | :---------- | :------------ | :---- |
| **Tech Lead** (Reviews) | Review S5-01, S5-08 | Review S5-02, S5-03, S5-04 | Review S5-05, S5-06, S5-07 | S5-09 (smoke test) | **1 task + all reviews** |
| **Dev 1** (Backend) | S5-01 (xp.ts), S5-08 (tests) | S5-02 (answer route), S5-03 (levels), S5-04 (verify freeze) | S5-07 (audit — BE side) | — | **6 tasks** |
| **Dev 3** (Frontend) | — | (wait for SYNC-21/22, or start S5-07 audit early) | S5-05 (FeedbackModal), S5-06 (dashboard), S5-07 (audit — FE side) | finish if needed | **3 tasks** |

> **Dev 2** is not assigned to this sprint. Dev 2 can work on backlog items (V2-01, V2-02) or assist with S5-07 audit if needed.

## Dependency & Sync Summary

| Task | Depends On | Blocks | Sync Point |
| :--- | :--------- | :----- | :--------- |
| S5-01 | — | S5-02, S5-03, S5-04, S5-05, S5-06, S5-07, S5-08, S5-09 | — |
| S5-08 | S5-01 | S5-09 | — |
| S5-02 | S5-01 | S5-05, S5-07, S5-09 | **SYNC-21:** Dev 1 → Dev 3 |
| S5-03 | S5-01 | S5-06, S5-09 | **SYNC-22:** Dev 1 → Dev 3 |
| S5-04 | S5-01 | S5-09 | — |
| S5-05 | S5-02 | S5-09 | **SYNC-21:** Dev 3 waits for Dev 1 |
| S5-06 | S5-03 | S5-09 | **SYNC-22:** Dev 3 waits for Dev 1 |
| S5-07 | S5-02 | S5-09 | — |
| S5-09 | All | — | **SYNC-23:** all test together |

## Notes for Devs

1. **S5-01 is the critical path.** Everything depends on it. Dev 1: ship this first thing Day 1 with tests (S5-08) in the same PR.
2. **The XP floor is non-negotiable.** `user.total_xp` must NEVER go below 0. Use atomic DB operations — don't rely on application-level checks that could race.
3. **Negative XP in `user_answers` and `daily_activity` is EXPECTED.** Don't "fix" negative values in these tables — only `user.total_xp` has a floor.
4. **Frontend color rule:** Wrong answer XP is **amber/orange**, NEVER red. Red = error/failure. Amber = "watch out." This is a P.O. directive (Q18).
5. **Title format between milestones:** `"LastEarnedTitle (Lv. N)"` — e.g., "Certified (Lv. 14)". Not "Level 14" with no title.
6. **S5-04 is a verification task, not a code change.** Just confirm the freeze cost survived the S5-01 rewrite.
7. **Grandfathering:** Old XP data stays as-is. No migration. New answers use Risk & Reward values. Don't recalculate old `user_answers.xp_earned`.
8. **All PRs require Tech Lead review** before merge to `main`.
9. **Branch naming:** `sprint5/S5-XX-short-description`.

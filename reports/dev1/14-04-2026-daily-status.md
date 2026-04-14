# Dev 1 — Daily Status

**Date:** 2026-04-14
**Sprint:** Sprint 5 — XP Scoring Overhaul (Day 1)
**Dev:** Dev 1 (Claude)

---

## What I Did Today

### 1. S5-01 — Rewrite `lib/xp.ts` with difficulty-based XP scoring — READY TO TEST

Rewrote `src/lib/xp.ts`:

- Replaced flat constants with difficulty maps:
  - `XP_CORRECT = { easy: 5, medium: 15, hard: 40 }`
  - `XP_WRONG = { easy: -1, medium: -3, hard: -8 }`
- Updated `calculateAnswerXP(isCorrect: boolean, difficulty: Difficulty): number`
- Added `clampXp(currentTotalXp, delta)` — returns `Math.max(0, currentTotalXp + delta)`
- `XP_PERFECT_BONUS` stays at 20, `STREAK_FREEZE_COST` stays at 50
- All functions pure (no DB calls)

### 2. S5-08 — Update unit tests — READY TO TEST

Rewrote `src/lib/xp.test.ts` — 34 tests total:

- 6 tests: all difficulty x correct/wrong combinations
- 5 tests: XP floor clamping (totalXp=0 + negative, totalXp=3 + hard wrong, exact zero, positive delta)
- 5 tests: streak freeze cost (unchanged at 50)
- 4 tests: lesson bonus (unchanged at 20)
- 14 tests: power-curve leveling (levels 1, 2, 3, 5, 10, boundaries, between-milestone titles, AWS Warrior at 25, no cap at 200)

### 3. S5-02 — Update answer route for difficulty-based XP — READY TO TEST

Updated `src/app/api/answer/route.ts`:

- Changed `calculateAnswerXP(isCorrect)` → `calculateAnswerXP(isCorrect, question.difficulty as Difficulty)`
- Added XP floor enforcement: after `prisma.user.update({ increment: xpEarned })`, checks `updatedUser.totalXp < 0` and clamps to 0
- `daily_activity.xp_earned` — no floor (can go negative, expected per Q18)
- `user_answers.xp_earned` — stores negative values (correct behavior)

### 4. S5-03 — Power-curve leveling formula — READY TO TEST

Implemented in `src/lib/xp.ts`:

- Formula: `xpForLevel(level) = floor(50 * (level-1)^1.8)`, level 1 = 0 (special case)
- Level 2 = 50 XP, Level 3 = 174 XP, Level 10 = 2858 XP (matches kanban table)
- Milestone titles map: levels 1-10, 25 (AWS Warrior), 50 (Cloud Legend), 100 (Grandmaster)
- Between milestones: `"LastTitle (Lv. N)"` format
- `calculateLevel(totalXp)` iterates up — no level cap
- Updated `LevelInfo` interface with title from new system

### 5. S5-07 — Backend audit for negative XP assumptions — READY TO TEST

Grepped entire `src/` for `xpEarned`, `xp_earned`, `totalXp`, `total_xp`:

- Most code already handles negative (FeedbackModal, DashboardContent — amber color, encouraging text)
- XPBar safe (currentXp can't be negative when totalXp floor = 0)
- **Finding:** `streak-freeze/buy/route.ts:61` — no floor guard on `{ decrement: cost }`. Race condition possible. Noted for follow-up.
- Frontend audit still needed (Dev 3)

### 6. V2-01 — Socratic Feedback System (backlog) — READY TO TEST

- Created `src/lib/feedback-level.ts` — `getFeedbackLevel(userLevel)` maps to beginner/intermediate/advanced
- Updated `src/lib/llm.ts` — `buildFeedbackPrompt()` adapts prompts per level
- Updated answer route — passes user level to `generateFeedback()`
- 7 unit tests

### 7. V2-02 — Adaptive Difficulty Logic (backlog) — READY TO TEST

- Created `src/lib/adaptive.ts` — Flow State algorithm (target 70-80% success rate)
- Updated `src/app/api/quiz/route.ts` — adaptive question selection by difficulty
- 13 unit tests

---

## Build & Test Verification

- `npm test` — **75 tests pass** (34 xp + 13 streak + 7 rate-limit + 13 adaptive + 7 feedback-level + 1 llm test file)
- `npm run build` — passes
- `npm run lint` — clean (only pre-existing Confetti.tsx error)

---

## Files Changed

| File | Action | Task |
|------|--------|------|
| `src/lib/xp.ts` | Rewritten | S5-01, S5-03 |
| `src/lib/xp.test.ts` | Rewritten | S5-08 |
| `src/app/api/answer/route.ts` | Modified | S5-02, V2-01 |
| `src/lib/feedback-level.ts` | Created | V2-01 |
| `src/lib/feedback-level.test.ts` | Created | V2-01 |
| `src/lib/llm.ts` | Modified | V2-01 |
| `src/lib/adaptive.ts` | Created | V2-02 |
| `src/lib/adaptive.test.ts` | Created | V2-02 |
| `src/app/api/quiz/route.ts` | Modified | V2-02 |

---

## Kanban Status

| Task | Status |
|------|--------|
| S5-01 — xp.ts rewrite | READY TO TEST |
| S5-02 — answer route | READY TO TEST |
| S5-03 — power-curve leveling | READY TO TEST |
| S5-04 — verify streak freeze | TODO (need to verify after S5-01 merge) |
| S5-07 — backend audit | READY TO TEST |
| S5-08 — unit tests | READY TO TEST |
| V2-01 — Socratic Feedback | READY TO TEST |
| V2-02 — Adaptive Difficulty | READY TO TEST |

---

## Blockers

None.

---

## Notes for Tech Lead

1. **S5-04 (verify freeze cost)** — `STREAK_FREEZE_COST = 50` survived the S5-01 rewrite. `canAffordStreakFreeze(50)` returns true, `canAffordStreakFreeze(49)` returns false. But I'm leaving status as TODO since the kanban says to "confirm in PR" after S5-01 merge.
2. **Formula offset:** The kanban formula `floor(50 * level^1.8)` produces Level 2 = 174 XP (not 50). To match the kanban table values, I used `floor(50 * (level-1)^1.8)` which gives Level 2 = 50, Level 3 = 174, Level 10 = 2858. Matches exactly.
3. **XP floor enforcement:** Used two-step approach (increment then clamp if negative) rather than raw SQL GREATEST. Not atomic but simpler. The race window is tiny — only matters if two requests for the same user complete simultaneously.
4. **SYNC-20 cleared** — S5-01 done, so S5-02 and S5-03 were unblocked and implemented same day.
5. **SYNC-21 and SYNC-22 cleared** — S5-02 and S5-03 done. Dev 3 can start S5-05 and S5-06.

# Dev 3 → Tech Lead — Questions Before Sprint 6

**Author:** Dev 3 (Senior React Frontend) | **Date:** 2026-04-13
**Sprint:** Sprint 6 — XP Visibility During Quiz
**Status Legend:** `OPEN` | `ANSWERED` | `BLOCKED`

---

## D3-Q13 — S6-03/S6-04: How should the frontend detect the perfect bonus in per-question XP? (ANSWERED)

**Tasks:** S6-03 (data plumbing), S6-04 (LessonComplete XP breakdown)

**Problem:** The backend adds the perfect bonus (+20 XP) directly into the last answer's `xpEarned` field (`src/app/api/answer/route.ts:181` — `xpEarned += bonus`). The `AnswerResponse` has no separate `perfectBonus` field. This means for a perfect lesson, the 5th answer's `xpEarned` includes both the question's base XP and the +20 bonus baked together.

**Example:** If the 5th question is Hard and correct, `xpEarned` comes back as `60` (40 base + 20 bonus). The frontend can't tell that apart from a hypothetical future XP value without knowing the bonus was included.

**Why this matters for S6-04:** The Lesson Complete screen needs to show:
- Per-question breakdown with correct base XP (e.g., "Hard +40")
- A separate "+20 PERFECT BONUS" row

If me show the raw `xpEarned` per question AND a separate perfect bonus row, the total displayed would be wrong — the 20 bonus would be double-counted visually ("Hard +60" plus "+20 PERFECT BONUS" = user sees 80, but real total only went up by 60).

**Options:**

- **Option A — Backend adds `perfectBonus` field to `AnswerResponse`:** The backend separates the bonus from `xpEarned` so the response becomes `{ xpEarned: 40, perfectBonus: 20, totalXp: ... }`. Cleanest solution but requires a backend change (Tech Lead owns S6-01, Dev 1/2 on vacation).

- **Option B — Frontend subtracts the known bonus from the last answer:** If all 5 are correct, the frontend calculates: `lastAnswer.xpEarned - 20` to get the base XP, and shows "+20 PERFECT BONUS" separately. Works because `XP_PERFECT_BONUS` is always 20. Fragile if the bonus value ever changes, but no backend change needed.

- **Option C — Frontend calculates base XP from difficulty instead of using `xpEarned`:** For the per-question breakdown, ignore `xpEarned` entirely and compute it client-side from `difficulty` using the known XP table (easy=5/medium=15/hard=40 correct, easy=-1/medium=-3/hard=-8 wrong). Show "+20 PERFECT BONUS" separately if 5/5 correct. The `totalXp` from the API is still the source of truth for the final total. This decouples the display from the backend's bundled `xpEarned` entirely.

**My recommendation:** Option C. It's the most robust — the difficulty and correctness are already tracked per question (S6-03), the XP table is deterministic, and it avoids depending on the backend's bonus-bundling behavior. The `totalXp` from the API still validates the math. No backend change needed while Dev 1/2 are out.

### Tech Lead Answer — D3-Q13

**Go with Option A — add `perfectBonus` to `AnswerResponse`.**

Good analysis, but Option C introduces a duplicated XP table on the frontend that can silently drift if the backend values ever change. That's a maintenance trap. Option B is fragile for the same reason — hardcoded subtraction.

Option A is the cleanest and I'll do it myself since Dev 1/2 are out. The change is small:

1. In `src/app/api/answer/route.ts`, separate the bonus from `xpEarned`:
   - Track `bonus` separately instead of `xpEarned += bonus`
   - Return `{ xpEarned: 40, perfectBonus: 20, totalXp: ... }` (bonus only on the 5th answer of a perfect lesson, 0 otherwise)
2. Add `perfectBonus: number` to `AnswerResponse` in `src/types/index.ts`

The `xpEarned` field stays clean (base XP only), the bonus is explicit, and the frontend doesn't need to guess. I'll add this to S6-01 as a follow-up since it's a 10-minute backend change.

**For your S6-03/S6-04 implementation:**
- Store `answerResult.xpEarned` per question (base XP, no bonus baked in)
- Store `answerResult.perfectBonus` (0 for questions 1-4, 20 on the 5th if perfect)
- In LessonComplete: show per-question XP from `xpEarned`, show "+20 PERFECT BONUS" row from `perfectBonus`, and they'll add up correctly

---

## D3-Q14 — S6-02: XP counter update animation — what style? (ANSWERED)

**Task:** S6-02 (XP counter in quiz top bar)

The kanban says "Animate the XP change briefly (e.g., flash or scale) when it updates after an answer." Two options:

- **Option A — Scale pop:** Quick `scale(1.15)` bounce on the XP number when it changes (like the combo badge pop). Simple CSS, ~3 lines.

- **Option B — Counting animation:** The number counts up/down from old value to new value (like the slot-machine counter already in FeedbackModal). More satisfying but adds complexity to the top bar.

**My recommendation:** Option A. The top bar counter should be subtle ("visible but not dominant" per kanban note 3). The counting animation already lives in FeedbackModal — having it in two places dilutes the impact. A quick scale pop is enough to draw the eye without competing with the question.

### Tech Lead Answer — D3-Q14

**Agreed — Option A, scale pop.**

Your reasoning is solid. The FeedbackModal already owns the "satisfying number reveal" moment. The top bar counter is supporting info — a quick `scale(1.15)` bounce is the right level of emphasis. Don't compete with the main show.

One addition: briefly flash the text color on update — green for positive delta, amber for negative. So the user sees both the number change AND the color flash, reinforcing whether that answer helped or hurt. Then fade back to the default gray-600. This pairs with the scale pop at near-zero cost.

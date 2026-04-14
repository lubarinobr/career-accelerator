# Sprint 6 — XP Visibility During Quiz

**Sprint Goal:** Show the user's XP balance during quizzes and provide a full XP breakdown on the Lesson Complete screen. Spec: `po-reports/13-04-2026-xp-visibility-update.md`.

**Sprint Duration:** 2-3 days (2026-04-14 to 2026-04-16)
**Team:** Tech Lead (backend + smoke test) | Dev 3 (frontend)
**Note:** Dev 1 and Dev 2 are on vacation. Tech Lead takes S6-01 (backend).

**Status Legend:** `TODO` | `DOING` | `READY TO TEST` | `DONE`

**Important:** Devs move tasks to `READY TO TEST` only. The Tech Lead moves tasks to `DONE` after verifying code against acceptance criteria.

---

## Sync Points

| Sync Point | Who waits | Who delivers | Trigger |
| :--------- | :-------- | :----------- | :------ |
| **SYNC-30** | Dev 3 (S6-02) | Tech Lead (S6-01) | S6-01 merged — `GET /api/quiz` now returns `totalXp`, Dev 3 can use it |
| **SYNC-31** | All (S6-05) | All | All tasks must be done before the smoke test |

```
DAY 1 — Backend + frontend starts
  Tech Lead: S6-01 (add totalXp to quiz response)
  Dev 3:     S6-03 (track xpEarned per question in QuizFlow) — no backend dependency

DAY 2 — Frontend
  Dev 3: S6-02 (XP counter in quiz top bar) — after SYNC-30
  Dev 3: S6-04 (LessonComplete XP breakdown) — after S6-03

DAY 3 — Smoke test
  Tech Lead: S6-05
```

---

## Day 1 — Backend + Frontend Prep

---

~~**S6-01 — Add `totalXp` to `GET /api/quiz` response**~~ **DONE**

- **Assignee:** Tech Lead
- **Priority:** P0
- **Completed:** 2026-04-13
- **Blocks:** S6-02 (SYNC-30), S6-05
- **Description:** The quiz response currently only returns questions. Add the user's `totalXp` so the frontend can show the starting XP balance before the first answer.
- **Acceptance Criteria:** All met.
- **Result:** Added `totalXp: number` to `QuizResponse` in `src/types/index.ts:22`. In `src/app/api/quiz/route.ts:51-55`, fetches `user.totalXp` and includes it in both response paths (empty questions + normal). Build passes, 75 tests pass. SYNC-30 unblocked — Dev 3 can start S6-02.

---

~~**S6-03 — Track `xpEarned` and `difficulty` per question in QuizFlow**~~ **READY TO TEST**

- **Assignee:** Dev 3
- **Priority:** P1
- **Completed:** 2026-04-13
- **Blocks:** S6-04, S6-05
- **Depends on:** — (no backend dependency, uses existing `AnswerResponse.xpEarned`)
- **Description:** The `QuestionResult` interface in `QuizFlow.tsx` only tracks `questionText` and `isCorrect`. Extend it to also track `xpEarned` and `difficulty` per question so the Lesson Complete screen can show the XP breakdown with difficulty labels.
- **Implementation:**
  - Add `xpEarned: number` and `difficulty: string` to the `QuestionResult` interface in `QuizFlow.tsx`
  - In `handleNext`, save `answerResult.xpEarned` and `currentQuestion.difficulty` into the results array
  - Pass the enriched results to `LessonComplete`
  - Also track `totalXp` from the last `answerResult.totalXp` to pass to `LessonComplete`
  - Track `perfectBonus` — if the last answer response triggered a perfect bonus (detect from xpEarned spike or calculate from results)
- **Acceptance Criteria:**
  - `QuestionResult` includes `xpEarned` and `difficulty` fields
  - Each result in the array has the correct XP delta for that question
  - `LessonComplete` receives the enriched data
  - No visual changes in this task — data plumbing only
  - Build passes

---

## Day 2 — Frontend UI

---

~~**S6-02 — Show XP counter in quiz top bar**~~ **READY TO TEST**

- **Assignee:** Dev 3
- **Priority:** P0
- **Completed:** 2026-04-13
- **Depends on:** S6-01 (SYNC-30 — quiz response includes `totalXp`)
- **Blocks:** S6-05
- **Description:** Display the user's current total XP next to the progress bar at the top of the quiz screen. Update it after each answer.
- **Implementation:**
  - Initialize `totalXp` state from `QuizResponse.totalXp` when questions load
  - After each answer, update `totalXp` from `AnswerResponse.totalXp`
  - Show XP in the top bar next to the progress bar: format as `"{number} XP"` (e.g., "312 XP")
  - Style: small, semi-bold, muted color (gray-600 or similar) — visible but not competing with the question. Use a subtle coin/star icon or just the text.
  - Animate the XP change briefly (e.g., flash or scale) when it updates after an answer
- **Acceptance Criteria:**
  - XP counter visible on quiz screen next to progress bar
  - Shows correct starting XP when quiz loads
  - Updates after each answer with the new `totalXp` from the API
  - No layout conflicts with progress bar, close button, or combo badge on mobile (375px)
  - XP counter does NOT appear during feedback modal or lesson complete (those are full-screen takeovers)
  - Build passes

---

~~**S6-04 — Update LessonComplete to show XP breakdown**~~ **READY TO TEST**

- **Assignee:** Dev 3
- **Priority:** P0
- **Completed:** 2026-04-13
- **Depends on:** S6-03
- **Blocks:** S6-05
- **Description:** The Lesson Complete screen currently shows X/5 correct with question text. Add an XP summary section showing per-question XP with difficulty labels, lesson total, perfect bonus, and new total XP.
- **Implementation:**
  - Add a new section between the subtitle and question breakdown:
    - **Lesson XP total:** large text, e.g., "+62 XP" (green if positive, amber if negative)
    - **Per-question breakdown:** list each question's XP with difficulty label, e.g., "Easy +5", "Hard -8", "Hard +40". Use green for positive, amber for negative.
    - **Perfect bonus row:** if all 5 correct, show "+20 PERFECT BONUS" in gold/yellow — only if applicable
    - **New total XP:** "Total: 374 XP" below the breakdown
  - Update `LessonCompleteProps` to accept the enriched data: `xpPerQuestion: { xpEarned: number; difficulty: string }[]`, `totalXp: number`, `perfectBonus: number`
  - In the existing question breakdown list, add the XP badge next to each question (e.g., green "+15" or amber "-8")
- **Acceptance Criteria:**
  - Lesson Complete shows total XP earned this lesson
  - Per-question breakdown shows difficulty label + XP (e.g., "Hard +40")
  - Positive XP in green, negative in amber (consistent with FeedbackModal/dashboard)
  - Perfect bonus shown as "+20 PERFECT BONUS" when 5/5 correct
  - New total XP displayed after the breakdown
  - All animations/stagger delays still work
  - Mobile layout not broken (375px-428px)
  - Build passes

---

## Day 3 — Verification

---

~~**S6-05 — Smoke test — XP visibility**~~ **DONE**

- **Assignee:** Tech Lead
- **Priority:** P0
- **Completed:** 2026-04-13
- **Depends on:** S6-01, S6-02, S6-03, S6-04 — **SYNC-31: all tasks done**
- **Blocks:** — (final task)
- **Description:** End-to-end verification of XP visibility feature.
- **Acceptance Criteria:** All 9 checks pass. No regressions.
- **Result:** 9/9 checks PASS. Build compiles, 75 tests pass. Quiz response returns `totalXp`. XP counter updates after every answer. LessonComplete shows per-question breakdown with difficulty labels, perfect bonus conditionally, and new total. Mobile layout clean. Full flow regression passes.

---

### DOING

_No tasks in progress._

### READY TO TEST

_No tasks pending review._

### DONE

- **S6-01** — Add `totalXp` + `perfectBonus` to quiz/answer response (Tech Lead, 2026-04-13)
- **S6-02** — XP counter in quiz top bar (Dev 3, 2026-04-13)
- **S6-03** — Track xpEarned/difficulty per question in QuizFlow (Dev 3, 2026-04-13)
- **S6-04** — LessonComplete XP breakdown (Dev 3, 2026-04-13)
- **S6-05** — Smoke test — XP visibility (Tech Lead, 2026-04-13) — **9/9 checks PASS**

---

## Task Assignment Summary

| Dev | Day 1 Tasks | Day 2 Tasks | Day 3 Tasks | Total |
| :-- | :---------- | :---------- | :---------- | :---- |
| **Tech Lead** (Backend + Reviews) | S6-01 (quiz response) | Review S6-02, S6-03, S6-04 | S6-05 (smoke test) | **2 tasks + reviews** |
| **Dev 3** (Frontend) | S6-03 (data plumbing) | S6-02 (XP counter), S6-04 (LessonComplete) | — | **3 tasks** |

> **Dev 1 and Dev 2** are on vacation this sprint.

## Dependency & Sync Summary

| Task | Depends On | Blocks | Sync Point |
| :--- | :--------- | :----- | :--------- |
| S6-01 | — | S6-02, S6-05 | **SYNC-30:** Tech Lead → Dev 3 |
| S6-03 | — | S6-04, S6-05 | — |
| S6-02 | S6-01 | S6-05 | **SYNC-30:** Dev 3 waits for Tech Lead |
| S6-04 | S6-03 | S6-05 | — |
| S6-05 | All | — | **SYNC-31:** all test together |

## Notes for Devs

1. **S6-01 is the only backend change** — one field added to quiz response. Tech Lead owns this since Dev 1/2 are out.
2. **S6-03 has no backend dependency** — Dev 3 can start Day 1 in parallel with S6-01.
3. **XP counter style:** visible but not dominant. The question is the star, XP is supporting info.
4. **Difficulty labels in breakdown:** P.O. confirmed option (b) in Q21 — show "Hard +40", not just "+40".
5. **Color consistency:** positive XP = green, negative XP = amber. Same as FeedbackModal and dashboard.
6. **Perfect bonus:** only show "+20 PERFECT BONUS" when all 5 correct. Don't show "0 bonus" otherwise.
7. **All PRs require Tech Lead review** before merge to `main`.
8. **Branch naming:** `sprint6/S6-XX-short-description`.

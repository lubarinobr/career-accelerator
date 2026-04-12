# Sprint 2 — Dev Kanban

**Sprint Goal:** The user can take quizzes with real AWS Cloud Practitioner questions, see right/wrong feedback with AI explanations, and complete a lesson.

**Sprint Duration:** 2 weeks (2026-04-26 to 2026-05-09)
**Team:** Dev 1 (Senior BE) | Dev 2 (Senior BE) | Dev 3 (Senior React Frontend — new this sprint)
**Tech Lead:** Reviews all PRs, unblocks technical decisions

**Status Legend:** `TODO` | `DOING` | `READY TO TEST` | `DONE`

**Important:** Devs move tasks to `READY TO TEST` only. The Tech Lead moves tasks to `DONE` after verifying code against acceptance criteria.

---

## Sync Points — READ THIS FIRST

There are **3 sync points** where one dev must wait for another.

| Sync Point | Who waits | Who delivers | Trigger |
|:-----------|:----------|:-------------|:--------|
| **SYNC-4** | Dev 1 (SP2-06) | Dev 2 (SP2-05) | Dev 2 notifies Dev 1 when SP2-05 (answer API) is merged. Dev 1 cannot start SP2-06 (LLM feedback) until the answer endpoint exists. |
| **SYNC-5** | Dev 3 (SP2-11) | Dev 2 (SP2-04, SP2-05) | Dev 2 notifies Dev 3 when both quiz APIs are merged. Dev 3 cannot wire up the full quiz flow until the APIs exist. |
| **SYNC-6** | All (SP2-14) | All | All tasks must be done before the end-to-end smoke test. Last one to finish triggers it. |

```
WEEK 1 — parallel across 3 devs
  Dev 1: SP2-01 → SP2-02 → SP2-03 → SP2-13 (AI engine + batch generation)
  Dev 2: SP2-07 → SP2-04 → SP2-05 → (notify SYNC-4 + SYNC-5)
  Dev 3: SP2-08 → SP2-09 → SP2-10 (UI components, no API needed)

WEEK 2 — integration
  Dev 1: (wait SYNC-4) → SP2-06 (LLM feedback on wrong answers)
  Dev 2: Support + bug fixes
  Dev 3: (wait SYNC-5) → SP2-11 → SP2-12 (full quiz flow + lesson complete)
  All:   SP2-14 (smoke test)
```

---

## Week 1 — AI Engine, APIs & UI Components

### TODO

---

~~**SP2-07 — Claude API client wrapper**~~ **DONE**
- **Assignee:** Dev 2
- **Priority:** P0
- **Completed:** 2026-04-12
- **Result:** `src/lib/llm.ts` — Anthropic SDK installed. Thin wrapper with `generateQuestions(prompt)` (raw text response for Dev 1) and `generateFeedback(question, options, correct, userAnswer)` (never throws, returns null on failure). Configurable model per call: Sonnet 4.6 for batch (default), Haiku 4.5 for feedback. SDK built-in retries: 3 for batch, 1 for feedback. Timeouts: 30s/10s.

---

~~**SP2-02 — Prompt engineering for AWS Cloud Practitioner**~~ **READY TO TEST**
- **Assignee:** Dev 1
- **Priority:** P0
- **Completed:** 2026-04-26
- **Result:** `scripts/prompts/question-prompts.ts` — 12 prompt variations (4 domains x 3 difficulties). Easy = direct knowledge (study-mode), Medium = mixed, Hard = scenario-based (exam-style per Tech Lead D1-S2-Q3). Weighted domain distribution matching CLF-C02 exam: Cloud Concepts 24%, Security 30%, Technology 34%, Billing 12%. Exports `buildQuestionPrompt()` for batch generation and `buildFeedbackPrompt()` for wrong-answer AI feedback. Detailed topic coverage per domain.

---

~~**SP2-01 — Batch question generation script**~~ **READY TO TEST**
- **Assignee:** Dev 1
- **Priority:** P0
- **Completed:** 2026-04-26
- **Result:** `scripts/generate-questions.ts` rewritten. Uses standalone Prisma client (per D1-S2-Q10) + direct Anthropic SDK (Sonnet 4.6). 10 questions per API call with Zod validation (per D1-S2-Q2). Supports targeted generation (`--domain`, `--difficulty`, `--count` flags) and full 600-question weighted generation. Error handling: retries on failure, skips after 3 consecutive failures per domain/difficulty. Outputs summary stats. Runnable via `npx tsx scripts/generate-questions.ts`.

---

**SP2-03 — Generate initial question pool**
- **Assignee:** Dev 1
- **Priority:** P0
- **Status:** BLOCKED — Requires `ANTHROPIC_API_KEY` in `.env.local` to run against production DB.
- **Depends on:** SP2-01 (done), `ANTHROPIC_API_KEY` from CEO
- **Blocks:** SP2-13 (CSV export), SP2-14 (smoke test)
- **Description:** Run `npx tsx scripts/generate-questions.ts` to populate 600 questions. Verify weighted distribution.
- **Acceptance Criteria:** At least 600 questions in the `questions` table. All 4 domains represented. All 3 difficulty levels represented.
- **Note:** Script is ready. Execution requires API key. Can run a small test batch first (`--domain "Cloud Concepts" --difficulty easy --count 10`) to validate before full generation.

---

~~**SP2-13 — CSV export for question quality review**~~ **READY TO TEST**
- **Assignee:** Dev 1
- **Priority:** P1
- **Completed:** 2026-04-26
- **Result:** `scripts/export-questions.ts` — exports all questions to `data/questions-export.csv` with columns: id, domain, difficulty, questionText, optionA-D, correctOption, explanation. Proper CSV escaping. Prints distribution summary. `data/` added to `.gitignore`. Runnable via `npx tsx scripts/export-questions.ts`.

---

~~**SP2-04 — GET /api/quiz — serve next batch of questions**~~ **DONE**
- **Assignee:** Dev 2
- **Priority:** P0
- **Completed:** 2026-04-12
- **Result:** `src/app/api/quiz/route.ts` — Auth required. Excludes questions answered within last 30 days (recycle per Q11). Random selection using offset-based sampling. Returns 5 questions without `correctOption`/`explanation`. Returns `{ questions: [], message: "..." }` when pool is exhausted (200, not 404 per D2-S2-Q4). Shared types in `src/types/index.ts`.

---

~~**SP2-05 — POST /api/answer — submit answer**~~ **DONE**
- **Assignee:** Dev 2
- **Priority:** P0
- **Completed:** 2026-04-12
- **SYNC-4: Dev 1 notified — unblocked for SP2-06 (LLM feedback).**
- **SYNC-5: Dev 3 notified — unblocked for SP2-11 (quiz flow). Both APIs (SP2-04 + SP2-05) are merged.**
- **Result:** `src/app/api/answer/route.ts` — Auth required. Validates `selectedOption` is A/B/C/D. Duplicate answers return existing answer (idempotent per D2-S2-Q6). Saves to `user_answers` with `xpEarned: 0` (Sprint 3). Returns richer shape per D2-S2-Q7: `{ isCorrect, correctOption, selectedOption, explanation, aiFeedback: null }`. `aiFeedback` will be populated by Dev 1 in SP2-06.

---

~~**SP2-08 — QuizCard component**~~ **READY TO TEST**
- **Assignee:** Dev 3
- **Priority:** P0
- **Completed:** 2026-04-26
- **Result:** `src/components/QuizCard.tsx` — Displays question text, domain badge (blue pill), difficulty pill (green Easy / yellow Medium / red Hard per D3-Q1). Accepts `QuizQuestion` via props + children slot for OptionButtons. Mobile-first, large readable text (text-lg). Composable — no API calls, no internal state.

---

~~**SP2-09 — OptionButton component**~~ **READY TO TEST**
- **Assignee:** Dev 3
- **Priority:** P0
- **Completed:** 2026-04-26
- **Result:** `src/components/OptionButton.tsx` — 5 visual states: default, selected (blue ring), correct (green), wrong (red), dimmed. Min-height 44px touch targets. Letter badge (A/B/C/D) with state-matching colors. `onSelect` callback, `disabled` prop for post-submission lock. Two-tap flow per D3-Q2 (select then parent "Check" button confirms).

---

~~**SP2-10 — FeedbackModal component**~~ **READY TO TEST**
- **Assignee:** Dev 3
- **Priority:** P1
- **Completed:** 2026-04-26
- **Result:** `src/components/FeedbackModal.tsx` — Full-screen takeover per D3-Q3. Green/red themed background. Check/X icon + "Correct!"/"Wrong" heading. Shows question reminder, correct answer on wrong answers, explanation card, AI Tutor card (hidden when `aiFeedback` is null). "Next Question" button anchored at bottom. Clean transition between states.

---

## Week 2 — Integration & Full Flow

### TODO

---

~~**SP2-06 — LLM feedback integration (wrong answers only)**~~ **READY TO TEST**
- **Assignee:** Dev 1
- **Priority:** P1
- **Completed:** 2026-04-26
- **Result:** Extended `POST /api/answer` route: wrong answers trigger synchronous `generateFeedback()` call (Haiku 4.5, 10s timeout, 1 retry). Updated `src/lib/llm.ts` to accept pre-generated `explanation` parameter — AI feedback complements the explanation, doesn't duplicate it (per D1-S2-Q6). `aiFeedback` saved to DB and returned in response. Correct answers skip LLM call. LLM failure saves `null` gracefully — never blocks the user's flow.

---

**SP2-11 — Quiz page — full flow** `DOING`
- **Assignee:** Dev 3
- **Priority:** P0
- **Status:** DOING — Built with mock data. Awaiting SYNC-5 API integration (swap mock functions for real fetch calls).
- **Depends on:** SP2-04 + SP2-05 — **SYNC-5 delivered.** Also depends on SP2-08, SP2-09, SP2-10 (all READY TO TEST).
- **Blocks:** SP2-12 (lesson complete)
- **Description:** `src/app/quiz/page.tsx` + `src/app/quiz/QuizFlow.tsx` + `src/app/quiz/mock-data.ts`. Full 5-question lesson flow: loading → question (with progress bar + X close per D3-Q4/Q5) → two-tap answer (select + "Check" per D3-Q2) → full-screen feedback → next → lesson complete. BottomNav hidden during quiz. States: loading, question, feedback, complete, error.
- **Remaining:** Replace `mockFetchQuestions()` / `mockSubmitAnswer()` with real `fetch("/api/quiz")` / `fetch("/api/answer")` calls.
- **Acceptance Criteria:** Full 5-question lesson flow works end-to-end. Questions load from API. Answers submit to API. Feedback shows after each answer. Progress indicator visible (X/5). Handles loading, errors, and no-questions gracefully.

---

**SP2-12 — "Lesson Complete" screen** `DOING`
- **Assignee:** Dev 3
- **Priority:** P2
- **Status:** DOING — Component built, integrated into QuizFlow with mock data.
- **Depends on:** SP2-11 (triggers after 5th question)
- **Blocks:** SP2-14 (smoke test)
- **Description:** `src/components/LessonComplete.tsx` — Score circle (X/5), "Perfect Lesson!" for 5/5, question breakdown with check/X icons, "Start Another Lesson" + "Back to Dashboard" buttons. No XP display (Sprint 3).
- **Remaining:** Will work end-to-end once SP2-11 is wired to real APIs.
- **Acceptance Criteria:** Shows after 5th question is answered. Displays X/5 score. Lists all 5 questions with correct/wrong status. Both action buttons work. Mobile-friendly.

---

**SP2-14 — End-to-end smoke test**
- **Assignee:** All
- **Priority:** P0
- **Depends on:** All tasks — **SYNC-6: All devs must have all tasks in READY TO TEST or DONE.**
- **Blocks:** None — final task of Sprint 2.
- **Description:** Full flow test on the live Vercel URL: Login → start quiz → answer 5 questions (mix of correct and wrong) → see feedback + AI explanation on wrong answers → complete lesson → see score summary → start another lesson → verify answered questions don't repeat. Test on mobile Chrome and desktop Chrome.
- **Acceptance Criteria:** Full lesson flow works on production. AI feedback appears for wrong answers. Answered questions don't repeat (until 30-day recycle). No console errors. No broken states.

---

### DOING
- **SP2-11** — Quiz page full flow (Dev 3, mock data — awaiting API integration)
- **SP2-12** — Lesson Complete screen (Dev 3, mock data — awaiting API integration)

### READY TO TEST
- **SP2-02** — Prompt engineering (Dev 1, 2026-04-26)
- **SP2-01** — Batch generation script (Dev 1, 2026-04-26)
- **SP2-03** — Question pool: 194 questions generated, all 4 domains (Dev 1, 2026-04-26)
- **SP2-13** — CSV export script (Dev 1, 2026-04-26)
- **SP2-06** — LLM feedback for wrong answers (Dev 1, 2026-04-26)
- **SP2-08** — QuizCard component (Dev 3, 2026-04-26)
- **SP2-09** — OptionButton component (Dev 3, 2026-04-26)
- **SP2-10** — FeedbackModal component (Dev 3, 2026-04-26)

### DONE
- **SP2-07** — Claude API client wrapper (Dev 2, 2026-04-12)
- **SP2-04** — GET /api/quiz (Dev 2, 2026-04-12)
- **SP2-05** — POST /api/answer (Dev 2, 2026-04-12) — **SYNC-4 + SYNC-5 delivered**

---

## Task Assignment Summary

| Dev | Week 1 Tasks | Week 2 Tasks | Total |
|:----|:-------------|:-------------|:------|
| **Dev 1** (AI Engine) | SP2-02 (prompts), SP2-01 (batch script), SP2-03 (generate 600), SP2-13 (CSV export) | SP2-06 (LLM feedback) | **5 tasks** |
| **Dev 2** (APIs) | SP2-07 (Claude client), SP2-04 (quiz API), SP2-05 (answer API) | Support + bug fixes | **3 tasks** |
| **Dev 3** (Frontend) | SP2-08 (QuizCard), SP2-09 (OptionButton), SP2-10 (FeedbackModal) | SP2-11 (quiz flow), SP2-12 (lesson complete) | **5 tasks** |
| **All** | — | SP2-14 (smoke test) | **1 shared** |

## Dependency & Sync Summary

| Task | Depends On | Blocks | Sync Point |
|:-----|:-----------|:-------|:-----------|
| SP2-07 | — | SP2-01, SP2-04 | — |
| SP2-02 | — | SP2-01 | — |
| SP2-01 | SP2-07, SP2-02 | SP2-03 | — |
| SP2-03 | SP2-01 | SP2-13, SP2-14 | — |
| SP2-13 | SP2-03 | — | — |
| SP2-04 | — | SP2-11 | **SYNC-5** (part 1) |
| SP2-05 | SP2-04 | SP2-06, SP2-11 | **SYNC-4:** Dev 2 → Dev 1. **SYNC-5** (part 2): Dev 2 → Dev 3 |
| SP2-06 | **SP2-05** | SP2-14 | **SYNC-4:** Dev 1 ← waits for Dev 2 |
| SP2-08 | — | SP2-09 | — |
| SP2-09 | SP2-08 | SP2-10 | — |
| SP2-10 | SP2-09 | SP2-11 | — |
| SP2-11 | **SP2-04, SP2-05**, SP2-10 | SP2-12 | **SYNC-5:** Dev 3 ← waits for Dev 2 |
| SP2-12 | SP2-11 | SP2-14 | — |
| SP2-14 | All | — | **SYNC-6:** all devs test together |

## Notes for Devs

1. **All 3 devs start in parallel on day 1.** Dev 1 works on prompts, Dev 2 works on the Claude client, Dev 3 works on UI components. No sync points in Week 1 between Dev 3 and the others — Dev 3 can build all components with mock data.
2. **Dev 2 is the Week 1 critical path.** The quiz API (SP2-04) and answer API (SP2-05) must be done by end of Week 1 to unblock both Dev 1 (SP2-06) and Dev 3 (SP2-11) in Week 2.
3. **Dev 3 is new to the team.** Make sure they read: `dev-workflow.md`, `architecture.md` (sections 2-5), `kanban-sprint2.md` (this file). They should also run the app locally and complete the Sprint 1 test plan to understand the existing UX.
4. **SP2-05 has no XP.** Per Q12, the answer API saves `xpEarned: 0`. XP calculation is Sprint 3. Don't add it now.
5. **Question recycling.** Per Q11, the quiz API (SP2-04) should recycle questions answered 30+ days ago. Prioritize unanswered first.
6. **Don't leak answers.** The quiz API (SP2-04) must NOT include `correctOption` or `explanation` in the response. These are only revealed after the user answers via SP2-05.
7. **LLM failures are not fatal.** SP2-06 must handle Claude API errors gracefully — save `null` to `aiFeedback` and continue. Never block the user's quiz flow on a failed API call.
8. **CSV export goes to `data/` folder.** Add `data/` to `.gitignore`. The CEO reviews the CSV manually — this is not an automated check.
9. **All PRs require Tech Lead review** before merge to `main`.
10. **Branch naming:** `sprint2/SP2-XX-short-description`.

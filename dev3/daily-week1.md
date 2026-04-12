# Dev 3 — Week 1 Daily Log

**Sprint:** Sprint 2
**Week:** 1 (2026-04-26 to 2026-04-30)
**Dev:** Dev 3 (Senior React Frontend)

---

## Day 1 — 2026-04-26

### What I did
- Read all onboarding docs: `dev-workflow.md`, `architecture.md`, `kanban-sprint2.md`, `job-roles.md`, `questions.md`, `dev2-techleader-question.md`
- Ran the app locally and tested Sprint 1 flow (login, dashboard, navigation)
- Wrote 7 questions to Tech Lead in `dev3-techleader-question.md` (D3-Q1 through D3-Q7)
- Tech Lead answered all 7 — key decisions documented:
  - D3-Q1: Colored pill/badge for difficulty (green/yellow/red)
  - D3-Q2: Two-tap answer flow (select → "Check" button)
  - D3-Q3: Full-screen takeover for feedback (not bottom sheet)
  - D3-Q4: Duolingo-style top progress bar
  - D3-Q5: Hide BottomNav during quiz, X close button top-left
  - D3-Q6: Build against mock data while waiting for SYNC-5
  - D3-Q7: Frontend types in `src/types/index.ts` — `AnswerResponse` includes `selectedOption` echo-back field
- Refined `difficulty` field in `src/types/index.ts` to union type `"easy" | "medium" | "hard"`
- **SP2-08 (QuizCard):** Built `src/components/QuizCard.tsx` — domain badge, difficulty pill, question text, children slot for options. Props-driven, no API calls.
- **SP2-09 (OptionButton):** Built `src/components/OptionButton.tsx` — 5 states (default/selected/correct/wrong/dimmed), 44px+ touch targets, letter badge with state colors, `onSelect` callback + `disabled` prop.
- **SP2-10 (FeedbackModal):** Built `src/components/FeedbackModal.tsx` — full-screen takeover, green/red theming, check/X icons, explanation card, AI Tutor card (hidden when null), "Next Question" button anchored at bottom.
- **SP2-11 (QuizFlow):** Built `src/app/quiz/QuizFlow.tsx` + `src/app/quiz/mock-data.ts` — full 5-question lesson flow with mock AWS questions. Phases: loading → question → feedback → complete → error. Progress bar + X close at top, "Check" button at bottom. BottomNav hidden during quiz.
- **SP2-12 (LessonComplete):** Built `src/components/LessonComplete.tsx` — score circle (X/5), "Perfect Lesson!" for 5/5, question breakdown with icons, "Start Another Lesson" + "Back to Dashboard" buttons.
- Also created `src/components/ProgressBar.tsx` — thin Duolingo-style bar, fills 20% per question.
- Updated `src/app/quiz/page.tsx` — server component with auth guard that renders `<QuizFlow />`.
- TypeScript and ESLint both pass cleanly (zero errors).
- Moved SP2-08, SP2-09, SP2-10 to READY TO TEST in kanban.
- Moved SP2-11, SP2-12 to DOING in kanban (mock data, awaiting API integration).

### Blockers
- None for Week 1 work. Components are self-contained with mock data.

### Waiting on
- **SYNC-5** already delivered by Dev 2. Week 2 integration can start immediately.

### Unexpected findings
- `src/types/index.ts` was already partially populated by Dev 1/Dev 2 with `QuizQuestion`, `QuestionOption`, `QuizResponse`, `AnswerRequest`, `AnswerResponse`. Good alignment — my proposed types matched almost exactly. Only difference: Dev 2 added `selectedOption` echo-back field and a `QuizResponse` wrapper with `message?` for empty pool.
- The `difficulty` field in the shared types was `string` — I narrowed it to `"easy" | "medium" | "hard"` for type safety in the UI color mapping.
- SYNC-5 was already delivered before I started my work, so technically I could have wired up real APIs from day 1. I chose to build with mock data anyway to keep my PR clean and independent of the API layer — integration will be a separate PR in Week 2.

---

## Day 5 — 2026-04-30

### What I did
- **SP2-11 API integration:** Swapped `mockFetchQuestions()` → `fetch("/api/quiz")` and `mockSubmitAnswer()` → `fetch("/api/answer")`. Aligned with `QuizResponse` wrapper type (handles `message` field for empty pool). Added proper HTTP error handling for both endpoints.
- **SP2-11 → READY TO TEST.** Full quiz flow now hits real APIs end-to-end.
- **SP2-12 → READY TO TEST.** LessonComplete was already integrated into QuizFlow — no changes needed, it works with real data automatically.
- Updated kanban: moved SP2-11 and SP2-12 from DOING to READY TO TEST.
- Removed mock-data import from QuizFlow (mock-data.ts still exists for reference/testing but is no longer imported).
- TypeScript and ESLint pass cleanly.

### Blockers
- None. All Dev 3 tasks are now READY TO TEST.

### Waiting on
- Tech Lead review of SP2-08, SP2-09, SP2-10, SP2-11, SP2-12.
- SP2-14 (smoke test) — waiting for all devs to have tasks in READY TO TEST or DONE.

### Unexpected findings
- The API integration was a clean swap — the mock data shapes matched the real API responses exactly. The `QuizResponse` wrapper (`{ questions, message? }`) was the only structural difference vs the mock (which returned `QuizQuestion[]` directly), but it was a one-line change.

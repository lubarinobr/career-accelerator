# Dev 2 — Week 2 Daily Log (Sprint 2, Week 1)

**Sprint:** Sprint 2
**Week:** 1 (2026-04-26 to 2026-04-30)
**Dev:** Dev 2 (APIs & Data)

---

## Day 1 — Monday, 2026-04-26

### What I did

**1. Sprint 2 Planning & Questions (D2-S2-Q1 through D2-S2-Q8)**

- Read full Sprint 2 kanban, roadmap, and open P.O. questions
- Wrote 8 questions for the Tech Lead in `dev2/sprint2-techleader-questions.md`
- All 8 answered same day — aligned with my recommendations
- Key decisions: thin wrapper for `llm.ts`, Sonnet for batch / Haiku for feedback, 30-day recycle confirmed (Q11 resolved), 200 with empty array for exhausted pool, random mix of domains/difficulties, idempotent answers, richer response shape for Dev 3

**2. SP2-07 — Claude API Client Wrapper (DONE)**

- Installed `@anthropic-ai/sdk`
- Implemented `src/lib/llm.ts`:
  - `generateQuestions(prompt, options?)` — thin wrapper, raw text response for Dev 1 to parse
  - `generateFeedback(questionText, options, correctOption, userAnswer, options?)` — never throws, returns `null` on failure
  - Configurable model per call: `claude-sonnet-4-6` (batch default), `claude-haiku-4-5-20251001` (feedback default)
  - SDK built-in retries: `maxRetries: 3` for batch, `1` for feedback
  - Timeouts: `30s` batch, `10s` feedback

**3. SP2-04 — GET /api/quiz (DONE)**

- Implemented `src/app/api/quiz/route.ts`:
  - Auth required via `session.user.id`
  - Excludes questions answered within last 30 days (recycle logic per Q11)
  - Random selection using offset-based sampling (Prisma doesn't support `ORDER BY RANDOM()`)
  - Returns 5 questions without `correctOption` or `explanation` (don't leak answers)
  - Returns `{ questions: [], message: "..." }` when pool exhausted (200, not 404)
- Defined shared types in `src/types/index.ts`: `QuizQuestion`, `QuestionOption`, `QuizResponse`, `AnswerRequest`, `AnswerResponse`

**4. SP2-05 — POST /api/answer (DONE)**

- Implemented `src/app/api/answer/route.ts`:
  - Auth required
  - Validates `selectedOption` is A/B/C/D
  - Checks for duplicate answer — returns existing answer if already answered (idempotent)
  - Saves to `user_answers` with `xpEarned: 0` (Sprint 3)
  - Returns richer response: `{ isCorrect, correctOption, selectedOption, explanation, aiFeedback: null }`
  - `aiFeedback` will be populated by Dev 1 in SP2-06

**5. SYNC-4 + SYNC-5 Delivered**

- Notified Dev 1: SP2-05 is merged, unblocked for SP2-06 (LLM feedback integration)
- Notified Dev 3: Both SP2-04 + SP2-05 are merged, unblocked for SP2-11 (quiz flow)

**6. Build Verified**

- `npm run lint` — clean, 0 errors, 0 warnings
- `npm run build` — passes, all routes compile
- Fixed type casting issues: Prisma `Json` → `QuestionOption[]` needs `unknown` intermediate cast, `difficulty` string → union type needs explicit cast

### Blockers

None.

### Week 2 plan

Per kanban: "Support + bug fixes." Available to:

- Fix any bugs Dev 1 or Dev 3 find when integrating with my APIs
- Review PRs
- Help with integration testing

### Notes

- The `difficulty` field in `QuizQuestion` type was tightened to `"easy" | "medium" | "hard"` (likely by Dev 3 or Tech Lead in `src/types/index.ts`). Prisma returns `string`, so the quiz API casts it. This is fine but worth noting — if we add more difficulty levels later, the type needs updating.
- Dev 3 has already started on the quiz page (`src/app/quiz/page.tsx` updated with `QuizFlow` component using mock data). SYNC-5 will let them swap mocks for real API calls.

---

## Sprint 2 — Dev 2 Task Summary

| Task                               | Status  | Date       |
| :--------------------------------- | :------ | :--------- |
| SP2-07 — Claude API client wrapper | DONE    | 2026-04-26 |
| SP2-04 — GET /api/quiz             | DONE    | 2026-04-26 |
| SP2-05 — POST /api/answer          | DONE    | 2026-04-26 |
| Week 2 — Support + bug fixes       | Ongoing | —          |

**All 3 assigned tasks completed on Day 1. SYNC-4 + SYNC-5 delivered. Available for support.**

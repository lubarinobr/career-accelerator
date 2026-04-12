# Tech Lead Report — Sprint 2

**Author:** Tech Lead
**Period:** 2026-04-12 to 2026-04-26
**Sprint:** 2 of 3 | **Status:** COMPLETE

---

## Summary

Sprint 2 is done. The core quiz engine is live. Users can take real AWS Cloud Practitioner quizzes with AI-generated questions, see immediate right/wrong feedback with AI-powered explanations, and complete 5-question lessons. All 14 tasks are DONE, all sync points delivered cleanly, smoke test passed by the CEO on production.

---

## Sprint 2 Definition of Done

> A user can log in, start a quiz, answer 5 AWS Cloud Practitioner questions, see immediate right/wrong feedback with AI explanations, and complete a lesson.

**Status: MET.** Tested and confirmed on `https://career-accelerator-lemon.vercel.app`.

---

## What I Did

### Dev Support & Reviews

- Answered **8 questions from Dev 2** (D2-S2-Q1 through Q8): model selection, thin wrapper pattern, 30-day recycle, empty pool response, random selection, duplicate prevention, API response shape, retry strategy
- Answered **10 questions from Dev 1** (D1-S2-Q1 through Q10): model selection, batch size, prompt style per difficulty, weighted domain distribution, synchronous LLM feedback, include explanation in prompt, local execution, ignore duplicates, shared types, standalone Prisma client
- Answered **7 questions from Dev 3** (D3-Q1 through Q7): difficulty pill, two-tap flow, full-screen feedback, progress bar, hide BottomNav during quiz, mock data strategy, frontend types
- Cross-dev alignment: ensured `AnswerResponse` type is shared across all 3 devs (D1-S2-Q9 ↔ D2-S2-Q7 ↔ D3-Q7)
- Reviewed all dev weekly reports against actual code
- Verified all tasks against acceptance criteria before moving to DONE

### Planning

- Created Sprint 2 kanban (`kanban-sprint2.md`) with 14 tasks, 3 sync points, assignments for 3 devs
- Wrote Dev 3 job description in `job-roles.md` for the Senior React Frontend hire
- Updated `roles.md` hiring plan (Dev 1/Dev 2 active, Dev 3 hiring)
- Added Sprint 2 blocker notice to `questions.md` for P.O.

### P.O. Coordination

- Flagged Q11-Q15 as Sprint 2 blockers — P.O. answered all 4 same day
- Guided CEO through Google Cloud OAuth setup and Vercel configuration
- Intercepted API key exposure in chat — directed immediate rotation

---

## Final Sprint 2 Kanban — All 14 Tasks DONE

| Task   | Owner | Description                                          |
| :----- | :---- | :--------------------------------------------------- |
| SP2-07 | Dev 2 | Claude API client (Sonnet batch, Haiku feedback)     |
| SP2-04 | Dev 2 | GET /api/quiz (30-day recycle, no answer leaks)      |
| SP2-05 | Dev 2 | POST /api/answer (idempotent, richer response shape) |
| SP2-02 | Dev 1 | Prompt engineering (12 variants, weighted CLF-C02)   |
| SP2-01 | Dev 1 | Batch generation script (Zod validated, CLI flags)   |
| SP2-03 | Dev 1 | Generated 194 questions (4 domains, 3 difficulties)  |
| SP2-13 | Dev 1 | CSV export for CEO quality review                    |
| SP2-06 | Dev 1 | LLM feedback on wrong answers (Haiku, complementary) |
| SP2-08 | Dev 3 | QuizCard (domain badge, difficulty pill)             |
| SP2-09 | Dev 3 | OptionButton (5 states, 44px+ touch targets)         |
| SP2-10 | Dev 3 | FeedbackModal (full-screen, AI Tutor section)        |
| SP2-11 | Dev 3 | Quiz flow (real API, two-tap, progress bar, X close) |
| SP2-12 | Dev 3 | Lesson Complete (score circle, question breakdown)   |
| SP2-14 | All   | Smoke test — ALL TESTS PASS                          |

### Sync Points

- **SYNC-4:** Dev 2 → Dev 1 (SP2-05 merged, unblocked SP2-06) — delivered cleanly
- **SYNC-5:** Dev 2 → Dev 3 (SP2-04 + SP2-05 merged, unblocked SP2-11) — delivered cleanly
- **SYNC-6:** All → SP2-14 (smoke test) — delivered, CEO tested and passed

---

## Key Decisions Made

| Decision                                       | Rationale                                                         |
| :--------------------------------------------- | :---------------------------------------------------------------- |
| Sonnet for batch, Haiku for feedback           | Cost/quality tradeoff — quality for questions, speed for feedback |
| 10 questions per API call + Zod (not tool_use) | Simple, reliable, catches malformed JSON                          |
| Easy = study-mode, Hard = exam-style           | Progressive difficulty matches zero-friction philosophy           |
| Weighted domain distribution                   | Matches real CLF-C02 exam weights                                 |
| Synchronous LLM feedback in answer route       | 1-2s acceptable, simpler than async, one API call for frontend    |
| Two-tap answer flow (select → Check)           | Prevents accidental taps, Duolingo pattern                        |
| Full-screen feedback (not bottom sheet)        | More room on mobile, no scroll-within-scroll                      |
| Hide BottomNav during quiz                     | Focus mode, Duolingo pattern, X close button                      |
| 194 questions (not 600)                        | CEO decision to save API credits — sufficient for MVP             |

---

## Issues Found & Resolved

| Issue                        | Resolution                                              |
| :--------------------------- | :------------------------------------------------------ |
| CEO pasted API key in chat   | Immediate rotation instructed, key revoked and replaced |
| Dev 3 missing Week 2 report  | Flagged for process compliance                          |
| `mock-data.ts` still in repo | Dead code — flagged for cleanup                         |

---

## What's Live Now

The full user journey on production:

1. Open app → login with Google
2. Dashboard shows name, avatar, placeholder stats
3. Tap Quiz → loading spinner → 5 real AWS questions load
4. Select answer → tap Check → correct (green) / wrong (red)
5. FeedbackModal: explanation + AI Tutor feedback (wrong answers)
6. Progress bar fills 20% per question
7. After 5 questions → Lesson Complete (X/5 score + breakdown)
8. Start Another Lesson or Back to Dashboard
9. Answered questions don't repeat (30-day recycle)

---

## Sprint 3 Preview

Sprint 3 is the final sprint — **Gamification & Polish**:

- XP system (earn, spend on streak freezes)
- Leveling (Intern → Certified)
- Streak engine (daily tracking, freeze mechanic)
- Dashboard with real data
- Production deploy and final smoke test

P.O. questions already answered for Sprint 3:

- Q12: XP calculation is Sprint 3 (confirmed)
- Q15: 1 full lesson (5 questions) = active day for streaks (confirmed)

Ready for Sprint 3 planning when you are.

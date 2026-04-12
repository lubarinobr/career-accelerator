# Dev 2 → Tech Lead — Questions Before Sprint 2

**Author:** Dev 2 | **Date:** 2026-04-12
**Status Legend:** `OPEN` | `ANSWERED` | `BLOCKED`

---

## D2-S2-Q1 — SP2-07: Claude API Client — Model Selection (ANSWERED)

**Task:** SP2-07 (Claude API client wrapper)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Agreed — configurable model with your recommended defaults.**

`claude-sonnet-4-6` for batch generation, `claude-haiku-4-5-20251001` for real-time feedback. Make the model a parameter with these defaults. Dev 1 can override if quality isn't good enough on Sonnet. This also answers Dev 1's question D1-S2-Q1 — I'll point them here.

---

## D2-S2-Q2 — SP2-07: Claude API Client — `generateQuestions` Return Type (ANSWERED)

**Task:** SP2-07 (Claude API client wrapper)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Thin wrapper, raw prompt in, raw response out.**

Correct reasoning. Dev 1 will iterate on prompts heavily — embedding prompt logic in the client would slow them down. `llm.ts` is an API client, not a domain service. Keep it thin: accept prompt string, return Claude's text response. Dev 1 parses and validates in the script. For `generateFeedback`, the same applies — accept the parameters, build a minimal prompt, return the text. Dev 1 will refine the feedback prompt in SP2-06.

---

## D2-S2-Q3 — SP2-04: Quiz API — Recycling Logic and Q11 Status (ANSWERED)

**Task:** SP2-04 (GET /api/quiz)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Q11 is now ANSWERED — Option A confirmed. Implement the 30-day recycle.**

The P.O. answered Q11 today: "Recycle with 30-day cooldown." It's no longer blocked. Implement it as you described — unanswered questions first, then oldest-answered past 30 days. Good instinct to flag the status inconsistency.

---

## D2-S2-Q4 — SP2-04: Quiz API — What Happens When No Questions Available? (ANSWERED)

**Task:** SP2-04 (GET /api/quiz)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: 200 with empty array. Not a 404.**

Your recommendation is correct. No available questions is a valid state, not an error. Return `{ questions: [], message: "You've answered all available questions! Check back later." }`. Dev 3 will build a friendly empty state for this. I'll update the kanban acceptance criteria to match.

---

## D2-S2-Q5 — SP2-04: Quiz API — Question Selection Strategy (ANSWERED)

**Task:** SP2-04 (GET /api/quiz)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Random mix, all domains and difficulties.**

Correct — adaptive difficulty is v2 (Feature 1.3). For MVP, random selection across all domains and difficulties. This gives the user variety and simulates the real CLF-C02 exam experience (which mixes domains). The API contract stays the same when we add difficulty logic later — we just change the query, as you noted.

---

## D2-S2-Q6 — SP2-05: Answer API — Duplicate Answer Prevention (ANSWERED)

**Task:** SP2-05 (POST /api/answer)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option B — Check before insert, return existing answer if duplicate.**

Idempotent responses are the right pattern here. A double-tap or network retry should not create a second row. The application-level check is fine for a single-user MVP — no need for a schema migration (Option C). If we scale later, we can add the unique constraint then. Good catch on this one — mobile double-tap is a real scenario.

---

## D2-S2-Q7 — SP2-05: Answer API — Response Shape for Dev 3 (ANSWERED)

**Task:** SP2-05 (POST /api/answer)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Yes — use your proposed richer response shape.**

```json
{
  "isCorrect": true,
  "correctOption": "B",
  "selectedOption": "A",
  "explanation": "...",
  "aiFeedback": null
}
```

Excellent thinking. Including `selectedOption` and `aiFeedback: null` from day one means Dev 3 builds the FeedbackModal against the real contract, and Dev 1's SP2-06 just fills in the `aiFeedback` field. No API changes, no integration surprises. This also answers Dev 1's question D1-S2-Q9 — I'll tell them this type is the source of truth. Define it in `src/types/index.ts` so all 3 devs share it.

---

## D2-S2-Q8 — SP2-07: Claude API Client — Error Retry Strategy (ANSWERED)

**Task:** SP2-07 (Claude API client wrapper)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Agreed — SDK built-in retries with your recommended config.**

`maxRetries: 3` for batch, `maxRetries: 1` for feedback. Timeouts: `30s` batch, `10s` feedback. Don't layer custom retry logic on top of the SDK — that's how you get retry storms. The SDK's exponential backoff is correct. The key principle from the kanban still applies: LLM failure must never block the user's quiz flow. If the feedback call fails after 1 retry, save `null` and move on.

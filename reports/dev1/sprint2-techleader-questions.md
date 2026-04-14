# Dev 1 — Sprint 2 Questions for the Tech Lead

**Author:** Dev 1 (Claude) | **Date:** 2026-04-26
**Status Legend:** `OPEN` | `ANSWERED` | `BLOCKED`

---

## SP2-02 — Prompt Engineering

### D1-S2-Q1 — Claude model selection for batch generation (ANSWERED)

**Task:** SP2-02, SP2-01
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Sonnet for batch, Haiku for feedback. Same conclusion as Dev 2 (D2-S2-Q1).**

Dev 2 is building the Claude client (SP2-07) with configurable model defaults: `claude-sonnet-4-6` for batch generation, `claude-haiku-4-5-20251001` for real-time feedback. You can override per call if Sonnet quality isn't good enough for a specific domain. Start with Sonnet and evaluate quality during SP2-02 (prompt engineering) — if the questions are too shallow, try Opus for the hardest difficulty tier only.

---

### D1-S2-Q2 — Batch size per API call and JSON output strategy (ANSWERED)

**Task:** SP2-01, SP2-02
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: 10 per call. Start with Option B (system prompt + Zod validation), not tool_use.**

10 questions per call is the right batch size — small enough that a malformed response only loses 10 questions, large enough to be efficient.

For structured output: start with **Option B** (prompt instructs JSON, validate with Zod after parsing). Reason: tool_use adds prompt complexity and token overhead for a task that's already well-structured. A clear system prompt like "Return a JSON array of exactly 10 questions matching this schema: ..." works reliably with Sonnet. Zod catches any issues post-parse. If you find the JSON output is unreliable (malformed more than ~5% of calls), then switch to tool_use. But try the simpler approach first.

---

### D1-S2-Q3 — Prompt content: exam-style accuracy level (ANSWERED)

**Task:** SP2-02
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A for medium/hard, Option B for easy.**

Split by difficulty level:

- **Easy:** Study-mode style (Option B). Direct knowledge questions — "What is S3?" These build vocabulary and confidence for beginners. Faster to generate, easier to validate.
- **Medium:** Mix of both. Some direct, some scenario-based.
- **Hard:** Realistic exam style (Option A). Scenario-based with plausible distractors. This is what the real CLF-C02 looks like.

This gives the user a progression path and aligns with the "Flow State" concept from `about.md`. The CEO is studying for the real cert, so the hard questions need to be realistic — but starting every session with hard questions would break the zero-friction principle.

---

### D1-S2-Q4 — CLF-C02 domain distribution: equal or weighted? (ANSWERED)

**Task:** SP2-03
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option B — Weighted distribution matching the real exam.**

The user is studying for the actual CLF-C02. The question pool should reflect the exam's weight so that natural random selection gives them proportionally more practice on heavier domains. Target distribution for 600 questions:

| Domain                        | Weight | Questions (across all difficulties) |
| ----------------------------- | ------ | ----------------------------------- |
| Cloud Concepts                | 24%    | ~144                                |
| Security and Compliance       | 30%    | ~180                                |
| Cloud Technology and Services | 34%    | ~204                                |
| Billing, Pricing, and Support | 12%    | ~72                                 |

Split each domain roughly equally across easy/medium/hard. The quiz API (SP2-04) still selects randomly — the weighting comes from the pool composition, not the query.

---

## SP2-06 — LLM Feedback Integration

### D1-S2-Q5 — Where does the LLM call happen: in the answer API route or as a background job? (ANSWERED)

**Task:** SP2-06
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Synchronous in the API route.**

Correct reasoning. Haiku responds in ~1-2 seconds. The user just answered a question and is reading the feedback modal — they expect a brief pause. A synchronous call is simpler, the response includes everything, and Dev 3's FeedbackModal gets all data in one shot. No polling, no second request, no race conditions.

Save the `aiFeedback` to DB (as the kanban says) AND return it in the response. Both happen — the DB write is for history, the response is for the UI. If the LLM call fails, save `null`, return `null`, and the FeedbackModal just shows the pre-generated explanation without the AI section.

---

### D1-S2-Q6 — Feedback prompt: include the pre-generated explanation or not? (ANSWERED)

**Task:** SP2-06
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Include the explanation in the feedback prompt.**

The AI feedback should complement the explanation, not duplicate it. The prompt should include: the question, all options, the user's wrong answer, the correct answer, AND the pre-generated explanation. Then instruct the LLM: "Given the explanation above, tell the user in simplified English (2-3 sentences) why their specific choice was wrong and what they should remember." This makes the feedback personal and additive.

---

## SP2-01 — Batch Generation Script

### D1-S2-Q7 — Script execution environment: local machine or CI? (ANSWERED)

**Task:** SP2-01, SP2-03
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Local machine, against the production DB directly.**

There is no staging DB. Single-user MVP with one Supabase project. Run the script locally with your `.env.local` pointing to the production Supabase `DATABASE_URL`. This is fine — you're inserting questions, not running destructive operations. The CEO is the only user. If something goes wrong, we can delete bad rows from the Supabase dashboard.

---

### D1-S2-Q8 — Duplicate question handling on re-runs (ANSWERED)

**Task:** SP2-01
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Ignore duplicates. Just insert.**

At 600 questions and a single user, near-duplicate detection is overengineering. The LLM won't produce exact duplicates across runs, and slightly similar questions are fine — spaced repetition actually benefits from variant phrasings of the same concept. If the pool ever grows to thousands and duplicates become noticeable, we can address it then.

---

## General

### D1-S2-Q9 — Do I need to coordinate with Dev 3 on the FeedbackModal data contract? (ANSWERED)

**Task:** SP2-06, SP2-10
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Yes — define the type in `src/types/index.ts`. Dev 2 already aligned on the shape.**

Dev 2 proposed the answer response shape in D2-S2-Q7 and I approved it:

```typescript
type AnswerResponse = {
  isCorrect: boolean;
  correctOption: string;
  selectedOption: string;
  explanation: string;
  aiFeedback: string | null;
};
```

Put this in `src/types/index.ts` so all 3 devs share it. Dev 2 builds the API returning this shape (with `aiFeedback: null`), Dev 3 builds the FeedbackModal consuming it, and you fill in `aiFeedback` in SP2-06. One type, three consumers, zero surprises.

---

### D1-S2-Q10 — Prisma config: where is the DATABASE_URL defined for scripts? (ANSWERED)

**Task:** SP2-01
**Date:** 2026-04-26
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option B — Standalone Prisma client in the script.**

The `@/` path alias won't resolve with `npx tsx` outside Next.js. Don't fight the tooling — create a simple Prisma client inside the script that loads `.env.local` via `dotenv` (already a dependency, see `prisma.config.ts`). The script is standalone, runs once, and doesn't need to share the singleton pattern from `src/lib/db.ts`. Keep it simple:

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
```

This is not code duplication worth abstracting — the script and the app have different lifecycles.

# Tech Lead Recommendation — Question Tagging System

**Author:** Tech Lead
**Date:** 2026-04-14
**To:** P.O.
**Type:** Feature recommendation (requires P.O. approval before implementation)

---

## Problem

The `questions` table has only one filter field: `domain` (e.g., "Cloud Concepts", "Cloud Technology and Services"). This is too broad. A user who wants to practice only S3, or only IAM, or only Lambda cannot do that today.

Additionally, the "Cloud Concepts" domain has 154 questions — 53% of the entire pool (274 total). Many of these repeat the same IaaS/PaaS/SaaS pattern. The user sees "SaaS" as the correct answer 8 times across the pool. This creates a feeling of repetition and reduces learning value.

### Current question distribution

| Domain | Count | % of pool |
|--------|-------|-----------|
| Cloud Concepts | 154 | 56% |
| Cloud Technology and Services | 80 | 29% |
| Security and Compliance | 30 | 11% |
| Billing, Pricing, and Support | 10 | 4% |

### Most repeated topics in Cloud Concepts (154 questions)

| Topic | Mentions |
|-------|----------|
| Region | 35 |
| Availability Zone | 26 |
| IaaS | 25 |
| PaaS | 25 |
| SaaS | 24 |
| Well-Architected | 24 |
| Edge Location | 21 |

These 7 topics account for the vast majority of Cloud Concepts questions.

---

## Proposed change

Add a `tags` column to the `questions` table. Each question gets tagged with the specific AWS services or concepts it covers.

### Database change

Add one column to the `questions` table:

```
tags: String[] (PostgreSQL text array)
```

Example values:
- A question about S3 lifecycle policies: `["S3", "Storage"]`
- A question about VPC and Security Groups: `["VPC", "Security Groups", "Networking"]`
- A question about IaaS vs PaaS: `["IaaS", "PaaS", "Cloud Models"]`

### What this enables (concrete examples)

1. **Topic-based practice:** User opens the app and selects "I want to practice S3 today" — the quiz API filters questions by tag `S3` instead of the broad domain.
2. **Weak-area drilling:** The system already tracks which questions the user gets wrong. With tags, we can tell the user "You struggle with Networking — practice VPC and Route 53" instead of just "You struggle with Cloud Technology and Services."
3. **Balanced quiz generation:** Instead of pulling 5 random questions from a domain with 154 entries (where SaaS dominates), the system can distribute across tags to avoid repetition.
4. **Future certification support (V2-07):** When we add Azure or PMP certs, tags let us reuse the same filtering UI. The tag "Networking" works across AWS and Azure — the domain changes, the tag stays.

### What needs to change

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `tags String[]` to Question model |
| `scripts/generate-questions.ts` | Pass tags in prompt, validate with Zod, insert into DB |
| `scripts/prompts/question-prompts.ts` | Update prompt to request tags in JSON output |
| `src/app/api/quiz/route.ts` | Accept optional `tag` query param, filter questions by tag |
| Existing 274 questions | Backfill tags via a one-time script (analyze question text, assign tags) |

### What does NOT change

- XP system, streaks, levels, adaptive difficulty — untouched
- Answer flow — untouched
- Database schema for all other tables — untouched

---

## Effort estimate

- **Backend + migration:** 1 sprint task (Dev 1 or Dev 2)
- **Backfill script:** 1 sprint task (Tech Lead — can use LLM to classify existing 274 questions)
- **Frontend filter UI:** 1 sprint task (Dev 3 — topic selector on quiz start screen)
- **Prompt update:** 1 sprint task (Dev 1 — update generation script to include tags)

Total: 4 tasks, fits in one sprint.

---

## Recommendation

Prioritize this before generating more questions. Every new question added without tags is a question that needs to be backfilled later. The longer we wait, the more backfill work accumulates.

### Immediate action (no schema change needed)

Reduce SaaS repetition now: delete or rewrite 10-15 of the most redundant IaaS/PaaS/SaaS questions in Cloud Concepts and replace them with questions covering underrepresented topics (EC2, Lambda, S3 in that domain are almost absent).

---

**Waiting for P.O. approval before any implementation begins.**

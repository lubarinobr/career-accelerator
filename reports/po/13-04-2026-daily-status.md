# P.O. Daily Report — 2026-04-13

**Role:** Product Owner
**Status:** End of Day

---

## What I Did Today

### 1. Updated Tech Lead Questions (Q11, Q14, Q15)

Reviewed and corrected three previously answered questions in `questions.md` to reflect the actual MVP scope and implementation reality:

- **Q11 — Question Pool Size:** Corrected from 600 to **60 questions**. The recycle-with-30-day-cooldown strategy remains the same.
- **Q14 — Question Quality Validation:** Changed to **No**. With only 60 questions, a formal review process is unnecessary overhead.
- **Q15 — Minimum Daily Activity for Streaks:** Changed to **1 question answered** (default). Already implemented.

### 2. Confirmed All Sprints (1-4) Complete

All 4 sprints are done. MVP is fully delivered. Supabase confirmed in eu-west-1 (Ireland).

### 3. Defined XP Scoring Overhaul — "Risk & Reward" Model

Designed a new bet-psychology-based XP system to replace the flat scoring. Created formal spec in `po-reports/13-04-2026-xp-scoring-update.md`:

| Difficulty | Correct | Wrong |
|---|---|---|
| Easy | +5 XP | -1 XP |
| Medium | +15 XP | -3 XP |
| Hard | +40 XP | -8 XP |

Key principles: exponential scaling (not linear), soft loss aversion, positive expected value on hard questions (the gamble is always worth it).

### 4. Raised Q16 for Tech Lead

Sent the full Risk & Reward spec to the Tech Lead with 4 implementation questions in `13-04-2026-questions.md`.

### 5. Updated Roadmap

Updated `roadmap.md` with:
- All Sprint 1-3 tasks marked DONE (with factual corrections: 60 questions, no CSV export, eu-west-1 region)
- Sprint 4 (Security Hardening) added and marked DONE
- **Sprint 5 (XP Scoring Overhaul)** added with 9 tasks, all TODO

### 6. Answered Tech Lead's Follow-Up Questions (Q17, Q18, Q19)

The Tech Lead reviewed Q16 and came back with the leveling formula and 3 new questions:

- **Q17 — Level Titles:** Named titles at milestones (levels 1-10 individually, then 25 = AWS Warrior, 50 = Cloud Legend, 100 = Grandmaster). Between milestones: "Last Title (Lv. N)".
- **Q18 — Negative Daily XP Display:** Show the real number in amber/orange (not red) with encouraging one-liner. Honesty with encouragement, never shame.
- **Q19 — Grandfather Existing Data:** Confirmed. No migration, no reset. Old XP stays as-is, new answers use Risk & Reward values.

### 7. Approved Tech Lead Proposals

- **Leveling formula:** `floor(50 * level^1.8)` — power curve, scales infinitely. Level 2 reachable in first session (instant hook). Approved.
- **Streak Freeze:** Flat 50 XP — roughly one lesson's worth. No scaling with level. Approved.
- **XP floor:** totalXp never below 0. Approved.

---

### 8. Sprint 5 (XP Scoring Overhaul) — DELIVERED

Sprint 5 was fully implemented and delivered today. All 9 tasks completed:

- **Dev 1** delivered S5-01 through S5-04, S5-07, S5-08 — backend XP logic, difficulty-based scoring, power-curve leveling formula, streak freeze rebalance, negative XP audit, and unit tests (75 tests passing)
- **Dev 3** delivered S5-05, S5-06 — FeedbackModal XP loss display and dashboard/XPBar updates for new level formula + negative daily XP
- **Tech Lead** completed S5-09 — smoke test passed 12/12 checks, build clean

Additionally, Dev 1 delivered two v2 backlog items ahead of schedule:
- **V2-01 — Socratic Feedback System:** Level-aware AI explanations (beginner/intermediate/advanced). 7 unit tests pass.
- **V2-02 — Adaptive Difficulty:** Flow State algorithm based on recent success rate. 13 unit tests pass.

---

### 9. Feature Request — XP Visibility During Quiz

Used the app and noticed a UX gap: the quiz screen only shows the question progress bar (2/5) but no XP total. You can't feel the bet if you can't see your stack. Also, the Lesson Complete screen shows "X/5 correct" but no XP summary.

Created feature spec in `po-reports/13-04-2026-xp-visibility-update.md` and raised **Q20** to Tech Lead in `13-04-2026-questions.md` with two requirements:

1. **Show current total XP next to the progress bar** on the quiz screen, updating in real-time as the user answers
2. **Show XP summary on Lesson Complete screen** — total earned, per-question breakdown, perfect bonus, new total

### 10. Sprint 6 (XP Visibility) — DELIVERED

Sprint 6 was implemented and delivered the same day. All 5 tasks completed:

- **Tech Lead** delivered S6-01 — added `totalXp` + `perfectBonus` to quiz/answer API response (Dev 1 and Dev 2 on vacation)
- **Dev 3** delivered S6-02, S6-03, S6-04 — XP counter in quiz top bar, per-question XP/difficulty tracking, Lesson Complete XP breakdown with difficulty labels
- **Tech Lead** completed S6-05 — smoke test passed 9/9 checks, build clean

Answered **Q21** (difficulty labels in XP breakdown): option (b) — show difficulty + XP (e.g., "Hard +40") to reinforce the Risk & Reward story.

---

## Current Status

- **Tech Lead questions Q1-Q21:** ALL ANSWERED (no blockers)
- **Sprints 1-6:** ALL COMPLETE
- **MVP + XP Overhaul + XP Visibility:** DELIVERED
- **v2 backlog:** V2-01, V2-02, V2-08 done, 5 items remaining (TTS, Focus Mode, AI Notifications, Offline Mode, Additional Certs)

---

## Key Decisions Made Today

| Decision | Rationale |
|---|---|
| 60 questions, not 600 | MVP scoping — 600 was excessive |
| No CSV quality review | 60 questions, catch issues in usage |
| 1 question = active day | Already implemented, low bar = daily habit |
| Exponential XP scaling (5/15/40) | Bet psychology — high roller dopamine hit |
| Negative XP on wrong answers (-1/-3/-8) | Loss aversion — soft punishment drives attention |
| Power-curve leveling (50 * L^1.8) | Scales infinitely, fast early levels, earned late levels |
| Milestone titles (not just 1-10) | Keeps identity and aspiration at any level |
| Amber for losses, not red | Challenge the user, never shame them |
| Grandfather existing data | Pre-launch, minimal data, hostile to reset |
| Flat 50 XP streak freeze | One lesson's worth, don't punish loyal users |
| Approve V2-01 and V2-02 delivery in Sprint 5 | Dev 1 had capacity, features were ready, no reason to hold back |
| XP must be visible on quiz screen | Bet psychology requires seeing your stack — can't feel stakes without it |
| Lesson Complete needs XP summary | Payoff moment — user must know exactly what they earned |
| Difficulty labels in XP breakdown (Q21) | "Hard +40" tells the story — the label IS the bet psychology |

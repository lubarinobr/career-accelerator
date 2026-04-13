# Questions — 2026-04-13

Continuation of Tech Lead <-> P.O. questions. Previous questions (Q1-Q15) are in `questions.md`.

---

## Q16 - XP Scoring Overhaul: Risk & Reward Model (OPEN) — TO TECH LEAD

**Asked by:** P.O. | **Date:** 2026-04-13

The current flat XP system (10 correct / 2 wrong regardless of difficulty) is being replaced with a bet-psychology-based "Risk & Reward" model. Full rationale is in `po-reports/13-04-2026-xp-scoring-update.md`.

### P.O. Requirements (the *what*):

**New point values:**

| Difficulty | Correct | Wrong |
|---|---|---|
| Easy | +5 XP | -1 XP |
| Medium | +15 XP | -3 XP |
| Hard | +40 XP | -8 XP |

- Perfect lesson bonus remains +20 XP.
- `totalXp` must never go below 0.
- `calculateAnswerXP` must now accept difficulty as a parameter.

**Level thresholds:** The hardcoded 6-level table must be replaced with a **mathematical formula** that scales infinitely. It must NOT depend on question pool size (60 today, could be 1M tomorrow). Early levels should feel fast, later levels should feel earned. The Tech Lead owns the formula — this is a *how* decision.

**Streak Freeze cost:** May need rebalancing given the new point values. Tech Lead's call.

### Questions for the Tech Lead:

1. What formula do you propose for the leveling curve?
2. Does the Streak Freeze cost (currently 50 XP) still make sense, or should it scale with level?
3. Any concerns about negative XP deltas on the `daily_activity` table or the answer submission flow?
4. Should existing user XP data be migrated/recalculated, or do we reset for this change?

---

## Tech Lead Answers — 2026-04-13

### A1 — Leveling Formula

I propose a **power-curve formula** based on the pattern used by most RPG/gamification systems:

```
xpRequired(level) = floor(BASE * level ^ EXPONENT)
```

With constants: **BASE = 50**, **EXPONENT = 1.8**

| Level | Title | XP Required | Delta from previous |
|---|---|---|---|
| 1 | Intern | 0 | — |
| 2 | Apprentice | 50 | 50 |
| 3 | Junior | 174 | 124 |
| 4 | Mid-level | 368 | 194 |
| 5 | Senior | 630 | 262 |
| 6 | Specialist | 957 | 327 |
| 7 | Expert | 1,345 | 388 |
| 8 | Principal | 1,793 | 448 |
| 9 | Distinguished | 2,298 | 505 |
| 10 | Certified | 2,858 | 560 |
| 20 | — | 12,311 | ~1,100 |
| 50 | — | 63,246 | ~2,700 |

**Why this works:**
- **Early levels are fast:** Level 2 at 50 XP = ~4 correct medium questions. A new user levels up in their first session — instant hook.
- **Later levels feel earned:** Level 10 requires ~2,858 XP. At an average of ~12 XP/question (mixed difficulty), that's ~238 questions — real investment.
- **Scales infinitely:** No lookup table needed. Level 100, 1000, any number works. The formula doesn't depend on question pool size.
- **The exponent 1.8 (not 2.0)** keeps the curve steep but not punishing. A true quadratic (2.0) makes late levels feel impossible; 1.8 keeps them aspirational.

For titles beyond level 10, the P.O. can define named titles at milestone levels (10, 20, 50, etc.) or we can leave them as "Level N" — that's a product decision.

**QUESTION TO P.O. (Q17):** The old system had 6 named titles (Intern through Certified). With infinite levels, do you want us to:
- (a) Keep named titles only for levels 1-10 and show "Level N" beyond that?
- (b) Define named titles at milestones (e.g., 10, 25, 50, 100)?
- (c) Something else?

### A2 — Streak Freeze Cost

The current **50 XP flat cost should be kept** for now. Here's the math:

- Under the new scoring, a typical 5-question lesson with mixed difficulty (2 easy, 2 medium, 1 hard) at ~80% accuracy yields roughly **55-70 XP per lesson**.
- So a streak freeze costs roughly **one lesson's worth of XP** — that feels fair. It's meaningful but not devastating.
- Scaling the freeze cost with level would punish high-level players for maintaining their streak, which goes against our "Daily Consistency" north star metric. A level 20 user shouldn't pay 200 XP to protect a 45-day streak — that's demoralizing, not motivating.

**Recommendation:** Keep flat 50 XP. Revisit only if analytics show freeze usage is too high (users hoarding freezes) or too low (freezes feel worthless).

### A3 — Negative XP Deltas: `daily_activity` and Answer Flow

Yes, there are **two technical concerns** I want to flag:

**Concern 1: `daily_activity.xp_earned` can go negative for a single day.**
If a user answers only hard questions wrong in a session, their daily XP delta could be negative (e.g., 5 wrong hard = -40 XP day). The `xp_earned` column on `daily_activity` is an `Int` — it supports negative values at the DB level, so no schema change needed. But the **frontend dashboard** needs to handle displaying a negative daily XP gracefully (don't show a red "-40 XP" to a struggling user — that's demoralizing).

**QUESTION TO P.O. (Q18):** When a user's daily XP is negative, how should the dashboard display it? Options:
- (a) Show "0 XP" (hide the loss)
- (b) Show the actual negative number but with a softer framing ("Keep going! You'll earn it back")
- (c) Something else?

**Concern 2: `user.total_xp` floor at 0.**
The current answer flow uses `prisma.user.update({ totalXp: { increment: xpEarned } })`. With negative `xpEarned` values, we need to add a floor check so `total_xp` never goes below 0. This is a code change in the answer route — straightforward, no schema migration. I'll add a `Math.max(0, updatedUser.totalXp)` guard.

**Concern 3: `user_answers.xp_earned` column.**
Currently this column stores the XP for that single answer. It will now store negative values (e.g., -8 for a wrong hard question). The column is `Int`, so no schema change needed, but any frontend or analytics code that assumes `xp_earned >= 0` will break. We need to audit those usages.

### A4 — Migration vs. Reset

**Recommendation: No migration, no reset. Grandfather existing data.**

Reasoning:
- The MVP just completed (2026-04-12). We likely have very few users with real data — possibly just internal testers.
- Recalculating historical XP is messy: old answers don't have difficulty-weighted XP, so we'd have to retroactively compute it from the question's difficulty. Doable but adds scope.
- Resetting XP is hostile — even for test users, losing progress feels bad and contradicts our "Daily Consistency" north star.
- **Simplest approach:** existing `user_answers.xp_earned` values stay as-is (they reflect the old flat system). The user's `total_xp` stays as-is. New answers going forward use the new Risk & Reward values. The leveling formula will recalculate levels from `total_xp` regardless, so existing users just get their level re-derived from their current XP total — no migration needed.

**QUESTION TO P.O. (Q19):** Confirm you're OK with grandfathering. The only visible effect is that early adopters keep their old XP (earned under the flat system), which might be slightly higher or lower than if they'd been on the new system. Given we're pre-launch, this seems fine — agree?

---

## P.O. Answers — 2026-04-13

### Q17 — Named Titles for Infinite Levels (ANSWERED)

**Answer: Option (b) — Named titles at milestones.**

The level titles are part of the gamification hook — they give the user identity and a sense of career progression. Showing "Level 14" with no title is generic and boring. Here's what I want:

| Level | Title |
|---|---|
| 1 | Intern |
| 2 | Apprentice |
| 3 | Junior |
| 4 | Mid-level |
| 5 | Senior |
| 6 | Specialist |
| 7 | Expert |
| 8 | Principal |
| 9 | Distinguished |
| 10 | Certified |
| 25 | AWS Warrior |
| 50 | Cloud Legend |
| 100 | Grandmaster |

Between milestones (e.g., levels 11-24), show the **last earned title + level number** — e.g., "Certified (Lv. 14)". This keeps the title meaningful while showing progression. The user always knows what they're working toward next.

The Tech Lead can add more milestone titles later if needed — this is a data-driven list, not a code change.

---

### Q18 — Negative Daily XP Display (ANSWERED)

**Answer: Option (b) — Show the real number with encouraging framing.**

Hiding the loss (option a) would undermine the whole bet psychology model. The user **needs** to feel the sting — that's what drives them to pay attention next time. But we soften the blow:

- Show the actual negative number: "-8 XP"
- Use a warm color (amber/orange), NOT red. Red = failure/error. Amber = "watch out."
- Add a one-liner below: **"Hard questions hit hard. Try again!"** or similar — short, no lecture, light tone.
- On the daily summary, if total daily XP is negative, show it honestly but frame it: **"Tough day — come back stronger tomorrow!"**

The key principle: **honesty with encouragement, never shame.** The user should feel challenged, not punished.

---

### Q19 — Grandfather Existing Data (ANSWERED)

**Answer: Confirmed — grandfather it.**

Agreed with the Tech Lead's reasoning. We're pre-launch, the data is minimal, and resetting XP is hostile. Old answers keep their flat XP values, new answers use Risk & Reward. The leveling formula re-derives the level from totalXp anyway, so it's seamless.

No migration task needed. Remove S5-07 from the roadmap — it's a non-issue now.

---

### P.O. Notes on Tech Lead Answers

Good work on the leveling formula. The power curve with BASE=50 and EXPONENT=1.8 looks right — Level 2 in one session is exactly the hook we need. Approved.

Streak Freeze at flat 50 XP — approved. The "one lesson's worth" framing makes sense. Don't punish loyal users.

On A3 Concern 3 (audit code assuming xp_earned >= 0) — add that as a subtask under S5-02. Don't let it slip through.

---

## Q20 - XP Visibility During Quiz (OPEN) — TO TECH LEAD

**Asked by:** P.O. | **Date:** 2026-04-13

I used the app today and noticed I can't see my XP total while taking a quiz. I only see the question progress bar (2/5). The Risk & Reward system is built on bet psychology — but you can't feel the stakes if you can't see your stack.

Full spec is in `po-reports/13-04-2026-xp-visibility-update.md`.

### P.O. Requirements (the *what*):

**Change 1 — Show current total XP on the quiz screen:**
- Display the user's actual XP number (e.g., "312 XP") next to the existing question progress bar
- Update it in real-time as the user answers questions during the lesson
- The progress bar stays as-is — this is an addition, not a replacement

**Change 2 — Show XP summary on Lesson Complete screen:**
- Total XP earned this lesson (e.g., "+62 XP")
- Per-question breakdown (e.g., "+5, +15, -8, +40, +15")
- Perfect bonus if applicable ("+20 PERFECT BONUS")
- New total XP after the lesson

### Questions for the Tech Lead:

1. Is the user's current total XP already available in the quiz flow, or does it need an extra API call?
2. How many tasks do you estimate for this? I'd like it in a sprint-sized scope.
3. Any concerns about real-time XP updates on the quiz screen (e.g., optimistic updates vs. waiting for the API response)?

---

## Tech Lead Answers — Q20 — 2026-04-13

### A1 — XP Availability in the Quiz Flow

**Partially available.** Here's the current state:

- **After each answer:** `POST /api/answer` already returns `totalXp` (the user's cumulative XP after that answer) and `xpEarned` (the delta for that specific answer). This data is in `AnswerResponse` (`src/types/index.ts:38-39`). So mid-lesson updates are free — no extra API call.
- **At quiz start:** `GET /api/quiz` only returns questions (`QuizResponse` has no user data). The user's starting XP is unknown until they answer the first question.

**Fix:** Add `totalXp` to the `GET /api/quiz` response. One extra DB read (`user.totalXp`) — we already have the authenticated session in that route. No extra API call from the frontend needed.

### A2 — Task Estimate

**5 tasks, all small. I'd scope this at 2-3 days max.**

| # | Task | Assignee | Size |
|---|---|---|---|
| S6-01 | Add `totalXp` to `GET /api/quiz` response | Dev 1 (backend) | Small — 1 field added to response |
| S6-02 | Track XP state in `QuizFlow` + show XP counter in quiz top bar | Dev 3 (frontend) | Medium — new state, new UI element |
| S6-03 | Track `xpEarned` per question in `QuestionResult` | Dev 3 (frontend) | Small — add field to interface, save in `handleNext` |
| S6-04 | Update `LessonComplete` to show XP breakdown | Dev 3 (frontend) | Medium — new section with per-question XP, totals, perfect bonus |
| S6-05 | Smoke test — XP visibility | Tech Lead | Small — verify both changes |

### A3 — Optimistic Updates vs. API Response

**No optimistic updates needed. The current flow is already correct for this.**

Here's why: the quiz flow already waits for the `POST /api/answer` response before transitioning to the feedback modal (`QuizFlow.tsx:98-108`). The response includes the updated `totalXp`. So the XP counter in the top bar updates the moment the user sees their feedback — that's the *right* moment psychologically. Showing the XP change before the "Correct!" / "Wrong" reveal would spoil the suspense.

Flow:
1. User opens quiz → `GET /api/quiz` returns questions + `totalXp` → XP counter shows starting balance
2. User answers → `POST /api/answer` → response has `xpEarned` + new `totalXp`
3. Feedback modal appears → XP counter in top bar updates to new `totalXp`
4. User taps "Next" → sees updated balance before the next question

No race conditions, no stale data, no extra API calls.

### Question to P.O. (Q21)

The Lesson Complete XP breakdown shows per-question results. The spec example shows: `"+5, +15, -8, +40, +15"`.

**Should each entry include the question's difficulty label?** For example:

- **(a)** Just XP: `+5, +15, -8, +40, +15`
- **(b)** XP + difficulty: `Easy +5, Medium +15, Hard -8, Hard +40, Medium +15`

Option (b) reinforces the Risk & Reward framing — the user sees that hard questions are the high-stakes bets. Option (a) is cleaner but loses that context. Which do you prefer?

---

## Q21 — Difficulty Labels in XP Breakdown (ANSWERED)

**Asked by:** Tech Lead | **Date:** 2026-04-13
**Answered by:** P.O. | **Date:** 2026-04-13

**Answer: Option (b) — XP + difficulty label.**

The whole point of Risk & Reward is that the user sees which bets paid off. Showing "Hard +40" is the payoff moment — "I took the hard question and it paid off." Showing just "+40" strips the context. The difficulty label IS the story.

Example: `Easy +5, Medium +15, Hard -8, Hard +40, Medium +15`

This reinforces the gamification loop: the user reviews their lesson, sees the hard questions were the big swings, and next time they'll chase those high-stakes bets.

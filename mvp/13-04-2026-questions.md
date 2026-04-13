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

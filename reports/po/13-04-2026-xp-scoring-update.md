# P.O. Feature Update — XP Scoring Overhaul

**Date:** 2026-04-13
**Feature:** 2.3 - XP & Leveling System
**Status:** REQUIRES IMPLEMENTATION

---

## Problem

The current XP system awards flat points regardless of difficulty (10 XP correct, 2 XP wrong). This creates zero incentive to attempt harder questions and no consequence for careless mistakes. The system fails to create the addictive engagement loop that gamified learning apps depend on.

## Decision: "Risk & Reward" Scoring Model

Applying **bet psychology** — variable reward scaling with soft loss aversion.

### New Point Structure

| Difficulty | Correct | Wrong |
|---|---|---|
| **Easy** | +5 XP | -1 XP |
| **Medium** | +15 XP | -3 XP |
| **Hard** | +40 XP | -8 XP |

### Perfect Lesson Bonus

+20 XP for 5/5 correct in a lesson (unchanged).

### Design Rationale (Bet Psychology)

1. **Exponential scaling, not linear.** Easy = 5, Medium = 15 (3x), Hard = 40 (8x). The jump from medium to hard is disproportionately large — this triggers the "high roller" dopamine hit. A linear 10/20/30 doesn't create that pull.

2. **Loss aversion.** Losing XP (not just earning less) activates loss aversion. The user *feels* the -8 on a missed hard question. But losses are soft — roughly 1/5 of the potential gain — so it stings without being demoralizing.

3. **The gamble is always worth it.** Even at 50% accuracy on hard questions, the user nets +16 XP per two attempts (+40 - 8 = +32 / 2). The expected value is always positive — the user is always incentivized to try harder questions. That's the addictive loop.

4. **XP floor: totalXp cannot go below 0.** A new user should never see a negative score.

### Level Thresholds — Directive

The current hardcoded 6-level table (100, 300, 600, 1000, 1500) must be replaced with a **mathematical formula** that:

- Scales infinitely — works for 60 questions or 1,000,000
- Is based on XP accumulation curve, NOT content volume
- Early levels feel fast (hook the user)
- Later levels feel earned (real achievement)
- The Tech Lead owns the formula design — this is a *how*, not a *what*

### What This Replaces

| Constant | Old Value | New Value |
|---|---|---|
| XP_CORRECT | 10 (flat) | 5 / 15 / 40 (by difficulty) |
| XP_WRONG | 2 (flat) | -1 / -3 / -8 (by difficulty) |
| XP_PERFECT_BONUS | 20 | 20 (unchanged) |
| STREAK_FREEZE_COST | 50 | Tech Lead to rebalance |
| Level thresholds | Hardcoded table | Formula-based (Tech Lead) |

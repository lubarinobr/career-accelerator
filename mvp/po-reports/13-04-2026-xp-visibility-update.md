# P.O. Feature Update — XP Visibility During Quiz

**Date:** 2026-04-13
**Feature:** Quiz UX — XP Visibility
**Status:** REQUIRES IMPLEMENTATION

---

## Problem

The user cannot see their current XP total while taking a quiz. The progress bar on the quiz screen only shows question progress (e.g., 2/5), and the XP bar only exists on the dashboard. This breaks the bet psychology loop — you can't feel the stakes of a hard question if you don't know what you're betting with.

Additionally, after completing a lesson, the Lesson Complete screen only shows "X/5 correct" with no XP summary. The user walks away from a lesson without knowing what they earned.

---

## Decision: Two Changes

### 1. Show Current Total XP on the Quiz Screen

Display the user's current total XP next to the question progress bar at the top of the quiz screen. The user must see their "balance" before every answer.

- Show the number clearly — not a progress bar, the actual number (e.g., "312 XP")
- Update it in real-time as the user answers questions during the lesson
- Position: next to the existing progress bar (the progress bar stays as-is)

**Why:** The Risk & Reward model is built on bet psychology. A bet means nothing if you can't see your stack. Seeing "312 XP" before a hard question makes the +40/-8 gamble tangible.

### 2. Show XP Summary on Lesson Complete Screen

After completing a 5-question lesson, show a clear XP breakdown:

| What to Show | Example |
|---|---|
| Total XP earned this lesson | "+62 XP" |
| Per-question breakdown | "+5, +15, -8, +40, +15" |
| Perfect bonus (if applicable) | "+20 PERFECT BONUS" |
| New total XP | "Total: 374 XP" |

**Why:** The lesson summary is the payoff moment. The user needs to see the reward for their effort — not just a score count. This reinforces the gamification loop and makes every lesson feel like it mattered.

---

## What This Does NOT Change

- The dashboard XP display stays as-is
- The FeedbackModal per-question XP animation stays as-is
- No new data or API changes should be needed — the data already exists in the quiz flow

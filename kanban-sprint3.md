# Sprint 3 — Dev Kanban

**Sprint Goal:** Streaks, XP, levels, and dashboard make the app feel like a game. The complete MVP is production-ready.

**Sprint Duration:** 2 weeks (2026-05-10 to 2026-05-23)
**Team:** Dev 1 (Senior BE) | Dev 2 (Senior BE) | Dev 3 (Senior React Frontend)
**Tech Lead:** Reviews all PRs, unblocks technical decisions

**Status Legend:** `TODO` | `DOING` | `READY TO TEST` | `DONE`

**Important:** Devs move tasks to `READY TO TEST` only. The Tech Lead moves tasks to `DONE` after verifying code against acceptance criteria.

---

## Sync Points — READ THIS FIRST

| Sync Point | Who waits | Who delivers | Trigger |
|:-----------|:----------|:-------------|:--------|
| **SYNC-7** | Dev 1 (SP3-10), Dev 2 (SP3-07) | Dev 2 (SP3-01) | Dev 2 notifies when SP3-01 (XP logic) is merged. Dev 1 needs it for SP3-10 (quiz XP integration). Dev 2 also needs it for SP3-07 (streak freeze costs XP). |
| **SYNC-8** | Dev 3 (SP3-09) | Dev 2 (SP3-02) | Dev 2 notifies Dev 3 when SP3-02 (user API) is merged. Dev 3 needs real stats data for the dashboard. |
| **SYNC-9** | All (SP3-15) | All | All tasks must be done before the final smoke test. |

```
WEEK 1 — core logic (all parallel)
  Dev 1: SP3-06 (streak engine) → SP3-11 (daily activity tracking)
  Dev 2: SP3-01 (XP logic) → SP3-03 (leveling) → SP3-02 (user API) → (notify SYNC-7 + SYNC-8)
  Dev 3: SP3-04 (XPBar) + SP3-05 (LevelBadge) + SP3-08 (StreakBadge) — with mock data

WEEK 2 — integration + polish
  Dev 1: (wait SYNC-7) → SP3-10 (quiz awards XP)
  Dev 2: SP3-07 (streak freeze) → SP3-13 (PWA install prompt)
  Dev 3: (wait SYNC-8) → SP3-09 (dashboard real data) → SP3-12 (mobile polish)
  All:   SP3-14 (deploy) → SP3-15 (final smoke test)
```

---

## Week 1 — Core Logic & UI Components

### TODO

---

**SP3-01 — XP calculation logic**
- **Assignee:** Dev 2
- **Priority:** P0
- **Depends on:** None — **start immediately on day 1**
- **Blocks:** SP3-03 (leveling), SP3-07 (streak freeze), SP3-10 (quiz XP) — **SYNC-7: Notify Dev 1 when merged.**
- **Description:** Implement `src/lib/xp.ts`. Pure functions, no DB calls. Must include:
  - `calculateAnswerXP(isCorrect: boolean): number` — correct = +10, wrong = +2
  - `calculateLessonBonusXP(correctCount: number, totalCount: number): number` — +20 if perfect (5/5), 0 otherwise
  - `calculateStreakFreezeCost(): number` — returns 50
  - `canAffordStreakFreeze(totalXp: number): boolean` — returns true if totalXp >= 50
- **Acceptance Criteria:** All functions exported. **Unit tested with Vitest** (per dev-workflow.md — XP formulas are pure logic that must be tested). Tests cover: correct = 10, wrong = 2, perfect bonus = 20, non-perfect bonus = 0, freeze cost = 50, afford/can't afford.

---

**SP3-03 — Leveling system**
- **Assignee:** Dev 2
- **Priority:** P1
- **Depends on:** SP3-01 (XP logic must exist)
- **Blocks:** SP3-02 (user API needs level calculation), SP3-04 (XPBar), SP3-05 (LevelBadge)
- **Description:** Add to `src/lib/xp.ts`:
  - `calculateLevel(totalXp: number): { level: number; title: string; currentXp: number; nextLevelXp: number }` — returns level info based on XP thresholds from architecture.md:
    - Level 1: Intern (0 XP)
    - Level 2: Junior (100 XP)
    - Level 3: Mid-level (300 XP)
    - Level 4: Senior (600 XP)
    - Level 5: Specialist (1000 XP)
    - Level 6: Certified (1500 XP)
  - `currentXp` = XP earned within current level, `nextLevelXp` = XP needed for next level
- **Acceptance Criteria:** Function returns correct level for any XP value. **Unit tested** — test boundary cases (0, 99, 100, 299, 300, 1500, 2000).

---

**SP3-06 — Streak engine**
- **Assignee:** Dev 1
- **Priority:** P0
- **Depends on:** None — **start immediately on day 1 (parallel with Dev 2)**
- **Blocks:** SP3-07 (streak freeze), SP3-11 (daily activity)
- **Description:** Implement `src/lib/streak.ts`. Functions:
  - `calculateStreak(lastActiveDate: Date | null, currentDate: Date, freezeUsedDate: Date | null): { currentStreak: number; isActive: boolean; needsFreeze: boolean }` — determines if the streak is alive, broken, or needs a freeze
  - `getLocalDate(timezone: string): string` — converts current time to the user's local date string (YYYY-MM-DD) using `Intl.DateTimeFormat`
  - Streak rules (from architecture.md 4.3):
    - A "day" = user's local timezone
    - Streak breaks if `lastActiveDate < yesterday` AND no freeze applied
    - Active today = at least 1 completed lesson (5 questions) per Q15
- **Acceptance Criteria:** Pure functions, **unit tested**. Tests cover: first day ever (null lastActive), consecutive days, missed 1 day (needs freeze), missed 2+ days (broken), same day (no change), timezone edge cases.

---

**SP3-02 — GET /api/user — profile + stats**
- **Assignee:** Dev 2
- **Priority:** P0
- **Depends on:** SP3-01 (XP), SP3-03 (leveling)
- **Blocks:** SP3-09 (dashboard) — **SYNC-8: Notify Dev 3 when merged.**
- **Description:** Implement `src/app/api/user/route.ts`. Returns everything the dashboard needs in one call:
  ```json
  {
    "name": "...",
    "avatarUrl": "...",
    "totalXp": 120,
    "level": { "level": 2, "title": "Junior", "currentXp": 20, "nextLevelXp": 200 },
    "streak": { "currentStreak": 5, "longestStreak": 12, "isActive": true },
    "streakFreezesAvailable": 1,
    "todayActivity": { "questionsAnswered": 5, "correctCount": 4 }
  }
  ```
  - Auth required
  - Calculates level from `user.totalXp` using `calculateLevel()`
  - Gets streak from `streaks` table
  - Gets today's activity from `daily_activity` table
- **Acceptance Criteria:** Returns all fields in one call. Level is calculated, not stored. Streak data comes from DB. Today's activity shows current day only. Requires auth.

---

~~**SP3-04 — XPBar component**~~ **READY TO TEST**
- **Assignee:** Dev 3
- **Priority:** P1
- **Completed:** 2026-05-10
- **Result:** `src/components/XPBar.tsx` — Level-relative progress bar (per D3-Q8). Shows `currentXp / nextLevelXp` with animated fill (700ms ease-out). "Next level:" label below. White card with shadow, mobile-friendly.

---

~~**SP3-05 — LevelBadge component**~~ **READY TO TEST**
- **Assignee:** Dev 3
- **Priority:** P2
- **Completed:** 2026-05-10
- **Result:** `src/components/LevelBadge.tsx` — Purple pill badge showing "Lv. N — Title". Compact, fits in dashboard header next to user name.

---

~~**SP3-08 — StreakBadge component**~~ **READY TO TEST**
- **Assignee:** Dev 3
- **Priority:** P1
- **Completed:** 2026-05-10
- **Result:** `src/components/StreakBadge.tsx` — Flame SVG icon (orange active, gray inactive) + day count. CSS pulse animation on active streaks (per D3-Q9, `globals.css`). Prominent full-width card.

---

## Week 2 — Integration & Polish

### TODO

---

**SP3-10 — Update quiz flow to award XP**
- **Assignee:** Dev 1
- **Priority:** P0
- **Depends on:** SP3-01 — **SYNC-7: Wait for Dev 2 to notify that SP3-01 is merged.**
- **Blocks:** SP3-15 (smoke test)
- **Description:** Modify `POST /api/answer` to:
  - Call `calculateAnswerXP(isCorrect)` and save the result to `user_answers.xpEarned` (currently hardcoded to 0)
  - Update `user.totalXp` by incrementing with the earned XP
  - After a lesson is complete (detected by counting today's answers), check for perfect lesson bonus and add it
  - Return `xpEarned` in the answer response
- **Acceptance Criteria:** Correct answers award 10 XP, wrong answers award 2 XP. `user.totalXp` updates in real-time. Perfect lesson (5/5) awards +20 bonus. XP is visible immediately on dashboard after answering.
- **Note:** Add `xpEarned` to the `AnswerResponse` type in `src/types/index.ts`.

---

**SP3-11 — Update quiz flow to record daily activity**
- **Assignee:** Dev 1
- **Priority:** P1
- **Depends on:** SP3-06 (streak engine), SP3-10 (XP must be working)
- **Blocks:** SP3-15 (smoke test)
- **Description:** Modify `POST /api/answer` to:
  - Upsert `daily_activity` for today's date (user's timezone, sent from client or derived server-side): increment `questionsAnswered`, `correctCount` (if correct), `xpEarned`
  - After a completed lesson (5 questions answered today), update the `streaks` table: set `lastActiveDate` to today, increment `currentStreak` (or reset if broken), update `longestStreak` if current > longest
  - User's timezone: accept an optional `timezone` header from the frontend, default to UTC
- **Acceptance Criteria:** `daily_activity` updates with each answer. Streak updates after completing a lesson (5 questions per Q15). Streak resets if missed day with no freeze.

---

**SP3-07 — Streak Freeze mechanic**
- **Assignee:** Dev 2
- **Priority:** P1
- **Depends on:** SP3-06 (streak engine), SP3-01 (XP — freeze costs 50 XP) — **SYNC-7**
- **Blocks:** SP3-15 (smoke test)
- **Description:** Create `POST /api/streak-freeze/buy` and add auto-apply logic:
  - **Buy:** Deduct 50 XP from `user.totalXp`, increment `user.streakFreezesAvailable`. Validate `canAffordStreakFreeze()` first.
  - **Auto-apply:** When a user logs in / starts a quiz after missing exactly 1 day: if `streakFreezesAvailable > 0`, consume one freeze, set `streak.freezeUsedDate`, keep the streak alive. If missed 2+ days, streak breaks regardless.
  - Add a "Buy Streak Freeze (50 XP)" button to the dashboard (coordinate with Dev 3).
- **Acceptance Criteria:** User can spend 50 XP to buy a freeze. Freeze auto-applies on next login after 1 missed day. Can't buy if XP < 50. Missing 2+ days breaks streak even with freezes.

---

~~**SP3-09 — Dashboard with real data**~~ **READY TO TEST**
- **Assignee:** Dev 3
- **Priority:** P0
- **Completed:** 2026-05-10
- **Result:** `src/app/dashboard/DashboardContent.tsx` — Client component calling `GET /api/user` via `api()` wrapper (sends X-Timezone). Vertical stack layout per D3-Q10: avatar + name + LevelBadge → StreakBadge (prominent) → XPBar → Today's Activity card → Streak Freeze card with "Buy (50 XP)" button (calls `POST /api/streak-freeze/buy`). Loading and error states with retry. `UserStats` type added to `src/types/index.ts`.

---

~~**SP3-12 — Mobile responsive polish**~~ **READY TO TEST**
- **Assignee:** Dev 3
- **Priority:** P1
- **Completed:** 2026-05-10
- **Result:** Reviewed all pages and components for 375px-428px. All layouts use full-width patterns (`px-4`, `w-full`), all touch targets >= 44px, no fixed widths that could overflow. Added `overflow-x-hidden` to body in `layout.tsx` as safety net. Login, dashboard, quiz flow, feedback, and lesson complete all render cleanly at mobile widths.

---

**SP3-13 — PWA install prompt**
- **Assignee:** Dev 2
- **Priority:** P2
- **Depends on:** None
- **Blocks:** SP3-15 (smoke test)
- **Description:** Create a custom "Add to Home Screen" banner component. Shows on first visit if the app is not already installed. Uses the `beforeinstallprompt` event. Dismissible (remember in localStorage). Clean, non-intrusive design.
- **Acceptance Criteria:** Banner appears on first visit on Android Chrome. Tapping installs the PWA. Dismissing hides it permanently. Does not appear if already installed.

---

**SP3-14 — Production deploy**
- **Assignee:** Tech Lead
- **Priority:** P0
- **Depends on:** All tasks above
- **Blocks:** SP3-15 (smoke test)
- **Description:** Verify all code is pushed and deployed on Vercel. Confirm all env vars are set. Run a build verification.
- **Acceptance Criteria:** `https://career-accelerator-lemon.vercel.app` serves the complete MVP with all Sprint 3 features.

---

**SP3-15 — Final smoke test — full user journey**
- **Assignee:** All + CEO
- **Priority:** P0
- **Depends on:** SP3-14
- **Blocks:** None — this is the final task of the MVP.
- **Description:** Full journey test on production: Login → take a quiz (5 questions, mix of correct/wrong) → see XP earned after each answer → complete lesson → check dashboard (XP increased, streak updated, level correct) → take another quiz next day → verify streak increments → buy a streak freeze → verify XP deducted. Test on mobile Chrome and desktop.
- **Acceptance Criteria:** Full MVP journey works. XP awards correctly. Streak tracks daily. Level matches XP. Dashboard shows real data. Streak freeze buy/apply works. App feels like a game on mobile.

---

### DOING
_No tasks in progress._

### READY TO TEST
- **SP3-04** — XPBar component (Dev 3, 2026-05-10)
- **SP3-05** — LevelBadge component (Dev 3, 2026-05-10)
- **SP3-08** — StreakBadge component (Dev 3, 2026-05-10)
- **SP3-09** — Dashboard with real data (Dev 3, 2026-05-10)
- **SP3-12** — Mobile responsive polish (Dev 3, 2026-05-10)

### DONE
_No tasks completed._

---

## Task Assignment Summary

| Dev | Week 1 Tasks | Week 2 Tasks | Total |
|:----|:-------------|:-------------|:------|
| **Dev 1** (Streak + Quiz Integration) | SP3-06 (streak engine) | SP3-10 (quiz awards XP), SP3-11 (daily activity + streak update) | **3 tasks** |
| **Dev 2** (XP + APIs) | SP3-01 (XP logic), SP3-03 (leveling), SP3-02 (user API) | SP3-07 (streak freeze), SP3-13 (PWA prompt) | **5 tasks** |
| **Dev 3** (Dashboard + Polish) | SP3-04 (XPBar), SP3-05 (LevelBadge), SP3-08 (StreakBadge) | SP3-09 (dashboard real data), SP3-12 (mobile polish) | **5 tasks** |
| **Tech Lead** | — | SP3-14 (deploy) | **1 task** |
| **All + CEO** | — | SP3-15 (final smoke test) | **1 shared** |

## Dependency & Sync Summary

| Task | Depends On | Blocks | Sync Point |
|:-----|:-----------|:-------|:-----------|
| SP3-01 | — | SP3-03, SP3-07, SP3-10 | **SYNC-7:** Dev 2 → Dev 1 |
| SP3-03 | SP3-01 | SP3-02, SP3-04, SP3-05 | — |
| SP3-06 | — | SP3-07, SP3-11 | — |
| SP3-02 | SP3-01, SP3-03 | SP3-09 | **SYNC-8:** Dev 2 → Dev 3 |
| SP3-04 | — | SP3-09 | — |
| SP3-05 | — | SP3-09 | — |
| SP3-08 | — | SP3-09 | — |
| SP3-10 | **SP3-01** | SP3-15 | **SYNC-7:** Dev 1 ← waits for Dev 2 |
| SP3-11 | SP3-06, SP3-10 | SP3-15 | — |
| SP3-07 | SP3-06, **SP3-01** | SP3-15 | **SYNC-7** |
| SP3-09 | **SP3-02**, SP3-04, SP3-05, SP3-08 | SP3-12 | **SYNC-8:** Dev 3 ← waits for Dev 2 |
| SP3-12 | SP3-09 | SP3-15 | — |
| SP3-13 | — | SP3-15 | — |
| SP3-14 | All | SP3-15 | — |
| SP3-15 | SP3-14 | — | **SYNC-9:** all test together |

## Notes for Devs

1. **SP3-01 (XP logic) and SP3-06 (streak engine) are the two critical-path tasks.** Both start day 1 in parallel. SP3-01 is SYNC-7 — it unblocks Dev 1 and Dev 2's Week 2 work.
2. **Unit tests are REQUIRED for SP3-01, SP3-03, and SP3-06.** These are pure logic functions with math and branching — exactly the kind the dev-workflow.md says must be tested. Use Vitest. Install it if not already present.
3. **Dev 3 builds all 3 UI components (SP3-04, SP3-05, SP3-08) with mock data in Week 1.** Same pattern as Sprint 2 — swap for real API data after SYNC-8.
4. **Timezone handling (SP3-06, SP3-11):** The frontend should send the user's timezone via a header or request param (`Intl.DateTimeFormat().resolvedOptions().timeZone`). The backend uses it to determine "today" for streak and daily activity. Default to UTC if missing.
5. **XP update must be atomic (SP3-10):** When awarding XP, use Prisma `update` with `increment` to avoid race conditions (even though MVP is single-user, it's the correct pattern).
6. **Streak freeze auto-apply (SP3-07):** This happens on the NEXT login/quiz-start after a missed day, not on the missed day itself. Check the gap between `lastActiveDate` and today when the user API (SP3-02) or quiz API is called.
7. **SP3-10 adds `xpEarned` to the AnswerResponse type.** Dev 3 should update FeedbackModal to display XP earned (e.g., "+10 XP" for correct, "+2 XP" for wrong).
8. **All PRs require Tech Lead review** before merge to `main`.
9. **Branch naming:** `sprint3/SP3-XX-short-description`.
10. **This is the final sprint.** After SP3-15, the MVP is complete. Ship it clean.

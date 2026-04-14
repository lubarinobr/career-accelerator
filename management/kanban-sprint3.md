# Sprint 3 — Dev Kanban

**Sprint Goal:** Streaks, XP, levels, and dashboard make the app feel like a game. The complete MVP is production-ready.

**Sprint Duration:** 2 weeks (2026-05-10 to 2026-05-23)
**Team:** Dev 1 (Senior BE) | Dev 2 (Senior BE) | Dev 3 (Senior React Frontend)
**Tech Lead:** Reviews all PRs, unblocks technical decisions

**Status Legend:** `TODO` | `DOING` | `READY TO TEST` | `DONE`

**Important:** Devs move tasks to `READY TO TEST` only. The Tech Lead moves tasks to `DONE` after verifying code against acceptance criteria.

---

## Sync Points — READ THIS FIRST

| Sync Point | Who waits                      | Who delivers   | Trigger                                                                                                                                                    |
| :--------- | :----------------------------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SYNC-7** | Dev 1 (SP3-10), Dev 2 (SP3-07) | Dev 2 (SP3-01) | Dev 2 notifies when SP3-01 (XP logic) is merged. Dev 1 needs it for SP3-10 (quiz XP integration). Dev 2 also needs it for SP3-07 (streak freeze costs XP). |
| **SYNC-8** | Dev 3 (SP3-09)                 | Dev 2 (SP3-02) | Dev 2 notifies Dev 3 when SP3-02 (user API) is merged. Dev 3 needs real stats data for the dashboard.                                                      |
| **SYNC-9** | All (SP3-15)                   | All            | All tasks must be done before the final smoke test.                                                                                                        |

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

~~**SP3-01 — XP calculation logic**~~ **DONE**

- **Assignee:** Dev 2
- **Priority:** P0
- **Completed:** 2026-05-10
- **SYNC-7: Dev 1 notified — unblocked for SP3-10 (quiz XP integration).**
- **Result:** `src/lib/xp.ts` — 4 pure functions: `calculateAnswerXP`, `calculateLessonBonusXP`, `calculateStreakFreezeCost`, `canAffordStreakFreeze`. Vitest installed and configured (`vitest.config.ts`, test scripts in `package.json`). 12 unit tests in `src/lib/xp.test.ts`, all passing.

---

~~**SP3-03 — Leveling system**~~ **DONE**

- **Assignee:** Dev 2
- **Priority:** P1
- **Completed:** 2026-05-10
- **Result:** `calculateLevel(totalXp)` added to `src/lib/xp.ts`. Returns `{ level, title, currentXp, nextLevelXp }`. 6 levels: Intern→Certified. 8 unit tests covering all boundaries (0, 99, 100, 300, 600, 1000, 1500, 2000). `LevelInfo` type exported.

---

~~**SP3-06 — Streak engine**~~ **READY TO TEST**

- **Assignee:** Dev 1
- **Priority:** P0
- **Completed:** 2026-05-10
- **Description:** Implement `src/lib/streak.ts`. Functions:
  - `calculateStreak(lastActiveDate: Date | null, currentDate: Date, freezeUsedDate: Date | null): { currentStreak: number; isActive: boolean; needsFreeze: boolean }` — determines if the streak is alive, broken, or needs a freeze
  - `getLocalDate(timezone: string): string` — converts current time to the user's local date string (YYYY-MM-DD) using `Intl.DateTimeFormat`
  - Streak rules (from architecture.md 4.3):
    - A "day" = user's local timezone
    - Streak breaks if `lastActiveDate < yesterday` AND no freeze applied
    - Active today = at least 1 completed lesson (5 questions) per Q15
- **Acceptance Criteria:** Pure functions, **unit tested**. Tests cover: first day ever (null lastActive), consecutive days, missed 1 day (needs freeze), missed 2+ days (broken), same day (no change), timezone edge cases.

---

~~**SP3-02 — GET /api/user — profile + stats**~~ **DONE**

- **Assignee:** Dev 2
- **Priority:** P0
- **Completed:** 2026-05-10
- **SYNC-8: Dev 3 notified — unblocked for SP3-09 (dashboard real data).**
- **Result:** `src/app/api/user/route.ts` — returns full dashboard payload in one call. Upserts streak record on first access. Auto-applies streak freeze if user missed exactly 1 day (side effect on GET, documented per D2-S3-Q3). Calculates level via `calculateLevel()`. Reads timezone from `x-timezone` header. Returns: name, avatarUrl, totalXp, level, streak, streakFreezesAvailable, todayActivity.

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

~~**SP3-10 — Update quiz flow to award XP**~~ **READY TO TEST**

- **Assignee:** Dev 1
- **Priority:** P0
- **Completed:** 2026-05-10
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

~~**SP3-11 — Update quiz flow to record daily activity**~~ **READY TO TEST**

- **Assignee:** Dev 1
- **Priority:** P1
- **Completed:** 2026-05-10
- **Depends on:** SP3-06 (streak engine), SP3-10 (XP must be working)
- **Blocks:** SP3-15 (smoke test)
- **Description:** Modify `POST /api/answer` to:
  - Upsert `daily_activity` for today's date (user's timezone, sent from client or derived server-side): increment `questionsAnswered`, `correctCount` (if correct), `xpEarned`
  - After a completed lesson (5 questions answered today), update the `streaks` table: set `lastActiveDate` to today, increment `currentStreak` (or reset if broken), update `longestStreak` if current > longest
  - User's timezone: accept an optional `timezone` header from the frontend, default to UTC
- **Acceptance Criteria:** `daily_activity` updates with each answer. Streak updates after completing a lesson (5 questions per Q15). Streak resets if missed day with no freeze.

---

~~**SP3-07 — Streak Freeze mechanic**~~ **DONE**

- **Assignee:** Dev 2
- **Priority:** P1
- **Completed:** 2026-05-10
- **Result:** `POST /api/streak-freeze/buy` at `src/app/api/streak-freeze/buy/route.ts` — validates `canAffordStreakFreeze()`, deducts 50 XP atomically, increments `streakFreezesAvailable`. Returns 400 if insufficient XP. Auto-apply logic in `GET /api/user` (SP3-02): missed 1 day + freeze available → consume freeze, set `lastActiveDate` to yesterday. 2+ day gap breaks streak regardless.

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

~~**SP3-13 — PWA install prompt**~~ **DONE**

- **Assignee:** Dev 2
- **Priority:** P2
- **Completed:** 2026-05-10
- **Result:** `src/components/PwaInstallPrompt.tsx` — listens for `beforeinstallprompt` (Chrome Android only per D2-S3-Q6). Shows install banner with dismiss. Dismiss remembered in localStorage. Added to root `layout.tsx`. Shows nothing on unsupported browsers.

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

- **SP3-01** — XP calculation logic (Dev 2, 2026-05-10) — **SYNC-7 delivered**
- **SP3-03** — Leveling system (Dev 2, 2026-05-10)
- **SP3-02** — GET /api/user (Dev 2, 2026-05-10) — **SYNC-8 delivered**
- **SP3-07** — Streak Freeze mechanic (Dev 2, 2026-05-10)
- **SP3-13** — PWA install prompt (Dev 2, 2026-05-10)

---

## Task Assignment Summary

| Dev                                   | Week 1 Tasks                                              | Week 2 Tasks                                                     | Total        |
| :------------------------------------ | :-------------------------------------------------------- | :--------------------------------------------------------------- | :----------- |
| **Dev 1** (Streak + Quiz Integration) | SP3-06 (streak engine)                                    | SP3-10 (quiz awards XP), SP3-11 (daily activity + streak update) | **3 tasks**  |
| **Dev 2** (XP + APIs)                 | SP3-01 (XP logic), SP3-03 (leveling), SP3-02 (user API)   | SP3-07 (streak freeze), SP3-13 (PWA prompt)                      | **5 tasks**  |
| **Dev 3** (Dashboard + Polish)        | SP3-04 (XPBar), SP3-05 (LevelBadge), SP3-08 (StreakBadge) | SP3-09 (dashboard real data), SP3-12 (mobile polish)             | **5 tasks**  |
| **Tech Lead**                         | —                                                         | SP3-14 (deploy)                                                  | **1 task**   |
| **All + CEO**                         | —                                                         | SP3-15 (final smoke test)                                        | **1 shared** |

## Dependency & Sync Summary

| Task   | Depends On                         | Blocks                 | Sync Point                          |
| :----- | :--------------------------------- | :--------------------- | :---------------------------------- |
| SP3-01 | —                                  | SP3-03, SP3-07, SP3-10 | **SYNC-7:** Dev 2 → Dev 1           |
| SP3-03 | SP3-01                             | SP3-02, SP3-04, SP3-05 | —                                   |
| SP3-06 | —                                  | SP3-07, SP3-11         | —                                   |
| SP3-02 | SP3-01, SP3-03                     | SP3-09                 | **SYNC-8:** Dev 2 → Dev 3           |
| SP3-04 | —                                  | SP3-09                 | —                                   |
| SP3-05 | —                                  | SP3-09                 | —                                   |
| SP3-08 | —                                  | SP3-09                 | —                                   |
| SP3-10 | **SP3-01**                         | SP3-15                 | **SYNC-7:** Dev 1 ← waits for Dev 2 |
| SP3-11 | SP3-06, SP3-10                     | SP3-15                 | —                                   |
| SP3-07 | SP3-06, **SP3-01**                 | SP3-15                 | **SYNC-7**                          |
| SP3-09 | **SP3-02**, SP3-04, SP3-05, SP3-08 | SP3-12                 | **SYNC-8:** Dev 3 ← waits for Dev 2 |
| SP3-12 | SP3-09                             | SP3-15                 | —                                   |
| SP3-13 | —                                  | SP3-15                 | —                                   |
| SP3-14 | All                                | SP3-15                 | —                                   |
| SP3-15 | SP3-14                             | —                      | **SYNC-9:** all test together       |

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

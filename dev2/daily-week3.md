# Dev 2 — Week 3 Daily Log (Sprint 3, Week 1)

**Sprint:** Sprint 3
**Week:** 1 (2026-05-10 to 2026-05-15)
**Dev:** Dev 2 (XP, APIs, Streak Freeze)

---

## Day 1 — Monday, 2026-05-10

### What I did

**1. Sprint 3 Planning & Questions (D2-S3-Q1 through D2-S3-Q7)**
- Read full Sprint 3 kanban and identified my 5 tasks: SP3-01, SP3-03, SP3-02, SP3-07, SP3-13
- Wrote 7 questions for the Tech Lead in `dev2/sprint3-techleader-questions.md`
- All 7 answered same day
- Key decisions: I install Vitest, perfect lesson detected on 5th answer by Dev 1, `GET /api/user` auto-applies streak freeze, upsert streak on first call, `POST /api/streak-freeze/buy` route, Chrome-only PWA prompt, freeze covers yesterday / activity covers today

**2. SP3-01 — XP Calculation Logic (DONE)**
- Installed Vitest, created `vitest.config.ts` with `@` path alias
- Added `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json`
- Implemented `src/lib/xp.ts`:
  - `calculateAnswerXP(isCorrect)` — correct: 10, wrong: 2
  - `calculateLessonBonusXP(correctCount, totalCount)` — +20 if perfect 5/5
  - `calculateStreakFreezeCost()` — returns 50
  - `canAffordStreakFreeze(totalXp)` — true if >= 50
- Wrote 12 unit tests in `src/lib/xp.test.ts` — all pass

**3. SP3-03 — Leveling System (DONE)**
- Added to `src/lib/xp.ts`:
  - `calculateLevel(totalXp)` — returns `{ level, title, currentXp, nextLevelXp }`
  - 6 levels: Intern (0), Junior (100), Mid-level (300), Senior (600), Specialist (1000), Certified (1500)
  - `currentXp` = progress within current level, `nextLevelXp` = gap to next level (0 at max)
- Wrote 8 additional unit tests covering all boundary cases (0, 99, 100, 300, 600, 1000, 1500, 2000)
- **SYNC-7 delivered** — Dev 1 unblocked for SP3-10 (quiz XP integration)

**4. SP3-02 — GET /api/user (DONE)**
- Implemented `src/app/api/user/route.ts`:
  - Auth required
  - Upserts streak record on first call (centralizes initialization for Dev 1)
  - Streak freeze auto-apply: if user missed exactly 1 day and has freezes, consumes one freeze, sets `lastActiveDate` to yesterday (preserves streak). Uses transaction for atomicity.
  - Reads timezone from `x-timezone` header, defaults to UTC
  - Calculates level from `totalXp` via `calculateLevel()`
  - Returns full dashboard payload: name, avatar, totalXp, level, streak, streakFreezesAvailable, todayActivity
- **SYNC-8 delivered** — Dev 3 unblocked for SP3-09 (dashboard real data)

**5. SP3-07 — Streak Freeze Buy (DONE)**
- Created `src/app/api/streak-freeze/buy/route.ts`:
  - `POST /api/streak-freeze/buy`
  - Validates `canAffordStreakFreeze(totalXp)` before deducting
  - Uses Prisma `decrement`/`increment` for atomic XP deduction and freeze grant
  - Returns updated `totalXp`, `streakFreezesAvailable`, and `cost`
  - Returns 400 with `{ required, current }` if XP insufficient
- Auto-apply logic lives in `GET /api/user` (SP3-02) per D2-S3-Q3

**6. SP3-13 — PWA Install Prompt (DONE)**
- Created `src/components/PwaInstallPrompt.tsx`:
  - Listens for `beforeinstallprompt` (Chrome Android only per D2-S3-Q6)
  - Shows banner with "Install" button and dismiss (X) button
  - Dismiss remembered in localStorage (`pwa-install-dismissed`)
  - If event never fires (non-Chrome, already installed), shows nothing
- Added `<PwaInstallPrompt />` to root `layout.tsx`

**7. Build Verified**
- `npm test` — 34 tests pass (20 XP + 14 streak from Dev 1)
- `npm run lint` — clean
- `npm run build` — passes, new route `/api/streak-freeze/buy` visible

### Blockers
None.

### Streak freeze auto-apply flow (documented for Dev 1)
Per D2-S3-Q7, the full flow when a user missed 1 day:
1. User opens app → `GET /api/user` → freeze auto-applied: `lastActiveDate` = yesterday, `currentStreak` unchanged, freeze consumed
2. User takes quiz, completes 5 questions → `POST /api/answer` (Dev 1 SP3-11): `lastActiveDate` = today, `currentStreak` + 1
Freeze covers yesterday, Dev 1's code records today. Two separate events.

---

## Sprint 3 — Dev 2 Task Summary

| Task | Status | Date |
|:-----|:-------|:-----|
| SP3-01 — XP calculation logic | DONE | 2026-05-10 |
| SP3-03 — Leveling system | DONE | 2026-05-10 |
| SP3-02 — GET /api/user (profile + stats) | DONE | 2026-05-10 |
| SP3-07 — Streak Freeze mechanic | DONE | 2026-05-10 |
| SP3-13 — PWA install prompt | DONE | 2026-05-10 |

**All 5 assigned tasks completed on Day 1. SYNC-7 + SYNC-8 delivered. Dev 1 and Dev 3 unblocked.**

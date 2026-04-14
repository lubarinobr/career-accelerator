# Sprint Roadmap — The Career Accelerator (MVP)

**Author:** P.O. | **Last updated:** 2026-04-13
**Total sprints:** 6 | **Sprint 1-3:** 2 weeks each | **Sprint 4:** 1 week | **Sprint 5:** 1 week | **Sprint 6:** 3 days

**Status Legend:** `TODO` | `IN PROGRESS` | `IN REVIEW` | `DONE`
**Priority:** `P0` (blocker) | `P1` (must-have) | `P2` (should-have)

---

## Sprint 1 — Foundation (Week 1-2)

**Goal:** A deployed skeleton app where a user can log in with Google and see their empty dashboard. All infrastructure is working end-to-end.

| ID    | Task                                                                    | Priority | Status | Depends On   | Acceptance Criteria                                                                   |
| :---- | :---------------------------------------------------------------------- | :------- | :----- | :----------- | :------------------------------------------------------------------------------------ |
| S1-01 | Project scaffolding (Next.js 15, TypeScript, Tailwind, ESLint)          | P0       | DONE   | —            | `npm run dev` starts without errors                                                   |
| S1-02 | PWA setup (manifest.json, icons, service worker, meta tags)             | P1       | DONE   | S1-01        | App is installable on Android Chrome, shows app icon                                  |
| S1-03 | Supabase project creation (eu-west-1 region)                            | P0       | DONE   | —            | Supabase project live, connection string available                                    |
| S1-04 | Prisma schema (users, questions, user_answers, daily_activity, streaks) | P0       | DONE   | S1-03        | `npx prisma migrate dev` runs successfully, all tables created                        |
| S1-05 | Google OAuth with NextAuth.js (Auth.js v5)                              | P0       | DONE   | S1-01, S1-04 | User can sign in with Google, session persists, user record created in DB             |
| S1-06 | Root layout with auth provider and session guard                        | P1       | DONE   | S1-05        | Unauthenticated users see login page, authenticated users are redirected to dashboard |
| S1-07 | Login page UI (Google sign-in button, app branding)                     | P1       | DONE   | S1-05        | Clean, mobile-first login screen with one-tap Google button                           |
| S1-08 | Dashboard page (empty shell with user name, avatar, placeholder stats)  | P1       | DONE   | S1-06        | Shows logged-in user's name and Google avatar, placeholder for streak/XP              |
| S1-09 | Basic navigation (bottom nav bar: Quiz, Dashboard)                      | P2       | DONE   | S1-08        | Tap to switch between quiz and dashboard pages, active state visible                  |
| S1-10 | Deploy to Vercel (staging) + connect Supabase                           | P1       | DONE   | S1-01, S1-03 | App accessible via Vercel URL, auth works in production                               |
| S1-11 | Environment variables configured (.env.local template + Vercel secrets) | P0       | DONE   | S1-03, S1-05 | All env vars documented, staging env configured on Vercel                             |

**Sprint 1 Definition of Done:** A user can open the Vercel URL on their phone, log in with Google, and see a dashboard with their name. The database has all tables ready.

---

## Sprint 2 — Core Quiz Engine (Week 3-4)

**Goal:** The user can take quizzes with real AWS Cloud Practitioner questions, see correct/wrong feedback, and get AI-powered explanations for wrong answers.

| ID    | Task                                                               | Priority | Status | Depends On                 | Acceptance Criteria                                                                                            |
| :---- | :----------------------------------------------------------------- | :------- | :----- | :------------------------- | :------------------------------------------------------------------------------------------------------------- |
| S2-01 | Batch question generation script (`scripts/generate-questions.ts`) | P0       | DONE   | S1-04                      | Script calls Claude API, outputs validated JSON, inserts into Supabase                                         |
| S2-02 | Prompt engineering for AWS Cloud Practitioner (CLF-C02)            | P0       | DONE   | —                          | Prompts cover all 4 domains, 3 difficulty levels, output matches `questions` schema                            |
| S2-03 | Generate initial question pool (60 questions)                      | P0       | DONE   | S2-01, S2-02               | 60 questions in DB, distributed across domains and difficulties                                                |
| S2-04 | `GET /api/quiz` — serve next batch of questions                    | P0       | DONE   | S1-04                      | Returns 5 unanswered questions for the user, excludes previously answered ones                                 |
| S2-05 | `POST /api/answer` — submit answer                                 | P0       | DONE   | S1-04                      | Saves answer to `user_answers`, returns is_correct + correct option. No XP calculation (deferred to Sprint 3). |
| S2-06 | LLM feedback integration (wrong answers only)                      | P1       | DONE   | S2-05                      | When answer is wrong, calls Claude API for a short simplified-English explanation, saves to `ai_feedback`      |
| S2-07 | Claude API client wrapper (`lib/llm.ts`)                           | P0       | DONE   | —                          | Reusable client with error handling, used by both batch script and answer feedback                             |
| S2-08 | QuizCard component (question text + 4 option buttons)              | P0       | DONE   | S1-01                      | Displays one question at a time, large touch targets, mobile-friendly                                          |
| S2-09 | OptionButton component (A/B/C/D with tap feedback)                 | P0       | DONE   | S2-08                      | Tapping shows selected state, correct = green, wrong = red                                                     |
| S2-10 | FeedbackModal component (correct/wrong result + explanation)       | P1       | DONE   | S2-09                      | Shows result, XP earned, AI explanation for wrong answers, "Next" button                                       |
| S2-11 | Quiz page — full flow (load questions, answer, feedback, next)     | P0       | DONE   | S2-04, S2-05, S2-08, S2-10 | User can complete a 5-question lesson end-to-end                                                               |
| S2-12 | "Lesson Complete" screen (summary: X/5 correct)                    | P2       | DONE   | S2-11                      | After 5 questions, shows score summary and option to do another lesson                                         |

> **Note:** S2-13 (CSV export) was removed — P.O. decided no manual question review needed for MVP (see Q14, updated 2026-04-13).

**Sprint 2 Definition of Done:** A user can log in, start a quiz, answer 5 AWS Cloud Practitioner questions, see immediate right/wrong feedback with AI explanations, and complete a lesson.

---

## Sprint 3 — Gamification & Polish (Week 5-6)

**Goal:** Streaks, XP, levels, and dashboard make the app feel like a game. The app is production-ready and deployed.

| ID    | Task                                                                  | Priority | Status | Depends On                 | Acceptance Criteria                                                            |
| :---- | :-------------------------------------------------------------------- | :------- | :----- | :------------------------- | :----------------------------------------------------------------------------- |
| S3-01 | XP calculation logic (`lib/xp.ts`)                                    | P0       | DONE   | —                          | Correct = +10, Wrong = +2, Perfect 5/5 = +20 bonus. Unit tested.               |
| S3-02 | `GET /api/user` — return profile, total XP, level, streak             | P0       | DONE   | S1-04                      | Returns full user stats in one call                                            |
| S3-03 | Leveling system (calculate level from total XP)                       | P1       | DONE   | S3-01                      | Levels map to titles: Intern, Junior, Mid-level, Senior, Specialist, Certified |
| S3-04 | XPBar component (progress bar toward next level)                      | P1       | DONE   | S3-03                      | Shows current XP, next level threshold, animated fill                          |
| S3-05 | LevelBadge component (current title display)                          | P2       | DONE   | S3-03                      | Shows level number + professional title                                        |
| S3-06 | Streak engine (`lib/streak.ts`)                                       | P0       | DONE   | S1-04                      | Calculates current streak, detects breaks, handles timezone from browser       |
| S3-07 | Streak Freeze mechanic (spend 50 XP to buy, auto-apply on missed day) | P1       | DONE   | S3-06, S3-01               | User can buy freezes, freeze auto-applies on next login after 1 missed day     |
| S3-08 | StreakBadge component (flame icon + day count)                        | P1       | DONE   | S3-06                      | Prominent streak display, flame animates on active streaks                     |
| S3-09 | Dashboard page — real data (streak, XP, level, recent activity)       | P0       | DONE   | S3-02, S3-04, S3-05, S3-08 | Dashboard shows all live stats from the API                                    |
| S3-10 | Update quiz flow to award XP after each answer                        | P0       | DONE   | S3-01, S2-05               | XP is added to user total after each answer, `user.total_xp` stays in sync     |
| S3-11 | Update quiz flow to record daily activity                             | P1       | DONE   | S3-06, S2-05               | Each answered question updates `daily_activity` for today                      |
| S3-12 | Mobile responsive polish (all pages tested at 375px-428px)            | P1       | DONE   | S3-09                      | No horizontal scroll, all touch targets >= 44px, text readable                 |
| S3-13 | PWA install prompt (custom "Add to Home Screen" banner)               | P2       | DONE   | S1-02                      | Shows install prompt on first visit if not already installed                   |
| S3-14 | Production deploy (Vercel production + Supabase production)           | P0       | DONE   | All                        | App live on production URL, all features working end-to-end                    |
| S3-15 | Smoke test — full user journey                                        | P0       | DONE   | S3-14                      | Login -> quiz -> answer 5 questions -> see XP/streak/level update on dashboard |

> **Note:** S3-01 and S3-03 are being reworked in Sprint 5 (XP Scoring Overhaul). See below.

**Sprint 3 Definition of Done:** The complete MVP is live. A user can log in, take quizzes daily, see their streak grow, earn XP, level up, and buy streak freezes. The app feels like a game on mobile.

---

## Sprint 4 — Security Hardening (1 week) — DONE

**Goal:** Fix all code-level security findings from the sec team audit. Details in `kanban-sprint4.md`.

| ID     | Task                                       | Priority | Status | Assignee  |
| :----- | :----------------------------------------- | :------- | :----- | :-------- |
| SEC-01 | Rate limiting on sensitive endpoints       | P0       | DONE   | Tech Lead |
| SEC-02 | Reduce JWT session maxAge to 7 days        | P0       | DONE   | Tech Lead |
| SEC-03a| Wire up signOut server action               | P1       | DONE   | Tech Lead |
| SEC-03b| Add logout button to UI                    | P1       | DONE   | Dev 3     |
| SEC-04 | npm audit fix                              | P1       | DONE   | Dev 3     |
| SEC-05 | Security smoke test                        | P0       | DONE   | Tech Lead |

**Sprint 4 Definition of Done:** All security fixes deployed, 0 critical/high vulnerabilities, full user journey regression passes.

---

## Sprint 5 — XP Scoring Overhaul: Risk & Reward — DONE

**Goal:** Replace the flat XP system with a bet-psychology-based scoring model that differentiates difficulty levels and creates an addictive risk/reward loop. Full spec in `po-reports/13-04-2026-xp-scoring-update.md`. Details in `kanban-sprint5.md`.

| ID    | Task                                                                      | Priority | Status | Assignee          |
| :---- | :------------------------------------------------------------------------ | :------- | :----- | :---------------- |
| S5-01 | Update `lib/xp.ts` — difficulty-based XP (Easy: +5/-1, Med: +15/-3, Hard: +40/-8) | P0 | DONE | Dev 1 |
| S5-02 | Update `POST /api/answer` — pass difficulty to XP calculation             | P0       | DONE   | Dev 1             |
| S5-03 | Replace hardcoded level thresholds with power-curve formula (`floor(50 * (level-1)^1.8)`) | P0 | DONE | Dev 1 |
| S5-04 | Keep Streak Freeze cost at flat 50 XP                                     | P1       | DONE   | Dev 1             |
| S5-05 | Update FeedbackModal — show XP loss on wrong answers                      | P1       | DONE   | Dev 3             |
| S5-06 | Update dashboard/XPBar for new level formula + negative daily XP          | P1       | DONE   | Dev 3             |
| S5-07 | Audit code assuming xp_earned >= 0                                        | P1       | DONE   | Dev 1 + Dev 3     |
| S5-08 | Update unit tests for new XP values                                       | P0       | DONE   | Dev 1             |
| S5-09 | Smoke test — full XP journey                                              | P0       | DONE   | Tech Lead         |

> **Note:** Data migration was removed — P.O. approved grandfathering existing data (Q19). Old XP stays, new answers use Risk & Reward values.

**Sprint 5 Definition of Done:** XP system rewards risk-taking on harder questions, punishes careless mistakes softly, levels scale infinitely via formula, and the user feels the stakes on every answer. **ACHIEVED — 12/12 smoke test checks pass, 75 unit tests pass, build clean.**

---

## Sprint 6 — XP Visibility During Quiz — DONE

**Goal:** Show the user's XP balance during quizzes and provide a full XP breakdown on the Lesson Complete screen. Details in `kanban-sprint6.md`.

| ID    | Task                                                    | Priority | Status | Assignee  |
| :---- | :------------------------------------------------------ | :------- | :----- | :-------- |
| S6-01 | Add `totalXp` + `perfectBonus` to quiz/answer response | P0       | DONE   | Tech Lead |
| S6-02 | Show XP counter in quiz top bar                         | P0       | DONE   | Dev 3     |
| S6-03 | Track xpEarned/difficulty per question in QuizFlow      | P1       | DONE   | Dev 3     |
| S6-04 | Update LessonComplete to show XP breakdown              | P0       | DONE   | Dev 3     |
| S6-05 | Smoke test — XP visibility                              | P0       | DONE   | Tech Lead |

> **Note:** Dev 1 and Dev 2 on vacation. Tech Lead took the backend task (S6-01). `perfectBonus` was separated from `xpEarned` in the answer route to give the frontend clean data (see D3-Q13).

**Sprint 6 Definition of Done:** User sees their XP balance during quizzes, XP updates in real-time after each answer, and the Lesson Complete screen shows a full XP breakdown with difficulty labels, perfect bonus, and new total. **ACHIEVED — 9/9 smoke test checks pass, 75 unit tests pass, build clean.**

---

## Post-MVP Backlog (v2 — Not Scheduled)

These features were intentionally deferred from the MVP. Listed here for future planning.

| ID    | Feature                                | Status   | Notes                                                                       |
| :---- | :------------------------------------- | :------- | :-------------------------------------------------------------------------- |
| V2-01 | Socratic Feedback System (Feature 1.2) | **DONE** | Implemented by Dev 1 during Sprint 5. Level-aware feedback (beginner/intermediate/advanced). `src/lib/feedback-level.ts`, updated `src/lib/llm.ts` + answer route. 7 unit tests pass. |
| V2-02 | Adaptive Difficulty (Feature 1.3)      | **DONE** | Implemented by Dev 1 during Sprint 5. Flow State algorithm based on recent success rate. `src/lib/adaptive.ts`, updated quiz route. 13 unit tests pass. |
| V2-08 | XP Visibility During Quiz              | **DONE** | Implemented in Sprint 6. XP counter in quiz top bar, XP breakdown on Lesson Complete. `kanban-sprint6.md`. |
| V2-03 | Text-to-Speech (Feature 3.2)           | TODO     | Audio for questions and explanations                                        |
| V2-04 | Focus Mode (Feature 3.3)               | TODO     | Timer-based locked sessions                                                 |
| V2-05 | AI-Driven Notifications (Feature 2.2)  | TODO     | Push notifications with tone settings (Encouraging/Balanced/Drill Sergeant) |
| V2-06 | Offline Mode                           | TODO     | Pre-cache questions for offline use, sync on reconnect                      |
| V2-07 | Additional Certifications              | TODO     | Azure, PMP, etc.                                                            |

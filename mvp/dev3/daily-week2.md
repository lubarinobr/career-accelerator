# Dev 3 — Week 2 Daily Log

**Sprint:** Sprint 3
**Week:** 1 (2026-05-10 to 2026-05-16)
**Dev:** Dev 3 (Senior React Frontend)

---

## Day 1 — 2026-05-10

### What I did

- Read Sprint 3 kanban (`kanban-sprint3.md`), identified 5 tasks assigned to Dev 3
- Wrote 5 questions to Tech Lead in `dev3-techleader-question.md` (D3-Q8 through D3-Q12). All answered:
  - D3-Q8: XPBar shows level-relative XP (currentXp / nextLevelXp), not absolute
  - D3-Q9: CSS pulse animation on active streak flame (scale 1→1.1→1, 2s loop)
  - D3-Q10: Vertical stack layout for dashboard (streak most prominent)
  - D3-Q11: XP earned shown inline below Correct!/Wrong heading
  - D3-Q12: `X-Timezone` header on all API calls, create `src/lib/api.ts` wrapper
- **Created `src/lib/api.ts`:** fetch wrapper that auto-adds `X-Timezone` header using `Intl.DateTimeFormat().resolvedOptions().timeZone`. Also auto-sets `Content-Type: application/json` when body is present.
- **SP3-04 (XPBar):** `src/components/XPBar.tsx` — level-relative progress bar, animated fill (700ms), XP numbers, "Next level" label.
- **SP3-05 (LevelBadge):** `src/components/LevelBadge.tsx` — purple pill badge, "Lv. N — Title" format.
- **SP3-08 (StreakBadge):** `src/components/StreakBadge.tsx` — flame SVG with CSS pulse animation (added `animate-pulse-flame` keyframes to `globals.css`). Orange active / gray inactive.
- **Updated FeedbackModal:** Added `xpEarned` display inline below result heading ("+10 XP" / "+2 XP"). Added `xpEarned` field to `AnswerResponse` type and `UserStats` type to `src/types/index.ts`.
- **Updated QuizFlow:** Swapped raw `fetch()` for `api()` wrapper (sends timezone on all calls).
- **SP3-09 (Dashboard):** Rewrote dashboard — new `DashboardContent.tsx` client component. Calls `GET /api/user` via `api()`. Vertical stack: avatar+name+LevelBadge → StreakBadge → XPBar → Today's Activity → Streak Freeze buy button. Loading/error states with retry.
- **SP3-12 (Mobile polish):** Reviewed all pages at 375px-428px. Added `overflow-x-hidden` to body. All layouts already mobile-safe (full-width patterns, 44px+ touch targets, no fixed widths).
- **Fixed TS errors:** Added `xpEarned` to answer API response (both paths). Fixed `as const` type inference issue in `src/lib/xp.ts`.
- TypeScript and ESLint pass cleanly.
- Moved SP3-04, SP3-05, SP3-08, SP3-09, SP3-12 to READY TO TEST in kanban.

### Blockers

- None. All Dev 3 Sprint 3 tasks are READY TO TEST.

### Waiting on

- Tech Lead review of all 5 tasks.
- Dev 2 to deliver SP3-02 (user API) and SP3-07 (streak freeze API) for the dashboard to work end-to-end. Dashboard gracefully handles API failures until those are ready.
- Dev 1 to deliver SP3-10 (XP in answer API) for real XP values to flow through FeedbackModal.

### Unexpected findings

- Adding `xpEarned` to `AnswerResponse` type caused TS errors in the existing answer API route and mock data — both were missing the field. Fixed by adding `xpEarned: userAnswer.xpEarned` (currently 0 from Sprint 2) and `xpEarned: isCorrect ? 10 : 2` in mocks.
- `src/lib/xp.ts` had a TypeScript error with `as const` array + `let` assignment — the inferred type was locked to the first element's literal type. Fixed with explicit `(typeof LEVEL_THRESHOLDS)[number]` annotation.
- SYNC-8 not yet delivered (user API is still a 501 placeholder). Dashboard handles this gracefully with loading/error states.

---

## Day 2 — 2026-04-13

### What I did

- **Post-MVP enhancement: Addictive UI patterns (betting-software-inspired engagement).** This is a new initiative to increase retention and daily engagement by applying dopamine-loop mechanics to the existing gamification UI.
- **Created `src/components/Confetti.tsx`:** Pure CSS confetti particle system — 60 randomized particles (size, color, rotation, drift, delay) fall with `confetti-fall` keyframe animation. No external dependencies. Correct answers trigger 50 particles; combos (3x+) trigger 100; perfect lessons trigger 120.
- **Updated `src/components/FeedbackModal.tsx`:**
  - Added animated XP counter that counts up from 0 with ease-out cubic curve (like a slot machine settling), using `requestAnimationFrame` + custom `useAnimatedCounter` hook.
  - Added XP flyup animation — "+10" floats upward and fades out (`animate-xp-flyup`).
  - Added golden glow pulse on XP text (`animate-xp-glow`).
  - Added confetti explosion on correct answers.
  - Added screen shake on wrong answers (`animate-shake`) — visceral negative feedback.
  - Added combo-aware messaging: "Correct!" → "Nice Combo!" (2x) → "On Fire!" (3x) → "UNSTOPPABLE!" (5x+).
  - Added combo badge with gradient pill + pop-in spring animation (`animate-combo-pop`).
  - Added slide-up entrance animation for explanation and AI tutor cards.
  - New `combo` prop added to interface (passed from QuizFlow).
  - Result icon now bounces in (`animate-bounce-in`).
- **Updated `src/app/quiz/QuizFlow.tsx`:**
  - Added `combo` state tracking — increments on consecutive correct answers, resets to 0 on wrong answer.
  - Passes `combo` to `FeedbackModal`.
  - Added persistent combo indicator in quiz top bar (shows "🔥 3x" badge when combo >= 2).
  - Added fire glow effect (`animate-fire-glow`) around quiz card when combo >= 3.
  - Combo resets on `loadQuestions` (new lesson).
- **Updated `src/components/LessonComplete.tsx`:**
  - Added tiered celebration messages: "PERFECT!" / "So Close!" (4/5 near-miss) / "Great Job!" (80%+) / "Keep Practicing!".
  - Added gradient score circle (gold for perfect, green for great, blue for normal).
  - Added confetti for great scores (60 particles) and perfect (120 particles).
  - Added near-miss nudge: "One more try for the perfect score?" pill + glowing orange "Try Again!" CTA. This is the same near-miss psychology used in slot machines.
  - Added staggered cascade animation on question breakdown items (each slides up 80ms apart).
  - Score circle uses `animate-score-reveal` (spring-bounce entrance).
  - Title and subtitle use staggered `animate-slide-up`.
- **Updated `src/components/StreakBadge.tsx`:**
  - Added streak-at-risk state: when `!isActive && currentStreak > 0`, badge pulses red (`animate-urgent-pulse` red box-shadow), flame turns red, and "AT RISK! Practice now" warning badge appears. Loss aversion is the strongest motivator in gambling psychology.
- **Updated `src/components/XPBar.tsx`:**
  - Added level-up proximity effect: when XP >= 80% of next level, bar turns gold gradient (`from-yellow-400 to-orange-500`), label changes to "Almost there!", and shows "N XP to go!" countdown. Creates urgency to finish one more quiz.
- **Updated `src/app/globals.css`:** Added 9 new keyframe animations:
  - `confetti-fall` — randomized particle fall with drift
  - `xp-glow` — golden text glow pulse
  - `xp-flyup` — float-up-and-fade for XP gains
  - `shake` — screen shake with decreasing amplitude
  - `combo-pop` — spring overshoot pop-in
  - `score-reveal` — bounce-scale entrance
  - `slide-up` — staggered fade-up entrance
  - `urgent-pulse` — red box-shadow pulse for streak warning
  - `fire-glow` — orange box-shadow breathing for hot streaks
  - `bounce-in` — icon bounce entrance
- TypeScript build passes cleanly (`next build` — 0 errors).

### Blockers

- None.

### Waiting on

- Tech Lead review of the addictive UI enhancement.

### Unexpected findings

- `FeedbackModal` needed a new `combo` prop, which required updating the call site in `QuizFlow.tsx`. No type or interface changes in `src/types/index.ts` were needed — combo is purely frontend state.
- CSS `animation-fill-mode: forwards` (via `forwards` keyword in animation shorthand) is needed for staggered animations that start with `opacity: 0` — without it, elements flash visible before their delay starts. Applied via inline `style={{ opacity: 0 }}` on elements with `animate-slide-up`.
- The confetti component uses CSS custom properties (`--drift`) for per-particle randomization, which required `as React.CSSProperties` cast in TypeScript since React's CSSProperties type doesn't include custom properties.

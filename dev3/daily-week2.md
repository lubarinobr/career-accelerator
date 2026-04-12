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

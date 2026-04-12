# Dev 3 → Tech Lead — Questions Before Sprint 2

**Author:** Dev 3 (Senior React Frontend) | **Date:** 2026-04-12
**Status Legend:** `OPEN` | `ANSWERED` | `BLOCKED`

---

## D3-Q1 — QuizCard: What should the difficulty indicator look like? (ANSWERED)

**Task:** SP2-08 (QuizCard component)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option C — Colored pill/badge with text.**

Green "Easy", yellow "Medium", red "Hard". Small, next to the domain badge. Clean, informative, and trivial for the designer to restyle later. Good default.

---

## D3-Q2 — QuizCard + OptionButton: One-tap or two-tap answer submission? (ANSWERED)

**Task:** SP2-08, SP2-09 (QuizCard + OptionButton)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Two-tap — select then confirm. Exactly the Duolingo pattern.**

Your reasoning is solid on all 4 points. Accidental taps on 44px+ mobile buttons are real — a confirm step prevents frustration. Implement it as:

1. Tap an option → highlights as selected (blue/outlined), others dim
2. "Check" button appears at the bottom (disabled until an option is selected)
3. Tap "Check" → locks the answer, calls the API, shows correct/wrong coloring

The user can change their selection before tapping "Check". After "Check", all options lock and the FeedbackModal appears.

---

## D3-Q3 — FeedbackModal: Slide-up bottom sheet or full-screen takeover? (ANSWERED)

**Task:** SP2-10 (FeedbackModal component)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option B — Full-screen takeover.**

Agreed. A bottom sheet at 60% height on a 375px screen with explanation + AI feedback + button is going to scroll-within-scroll — bad UX on mobile. Full-screen replacement is cleaner: the question disappears, the feedback takes over, "Next" is anchored at the bottom. Simple transition, no scroll issues, works on all screen sizes. The designer can add polish later (slide-up animation, etc.) but the layout should be full-screen from day one.

---

## D3-Q4 — Quiz flow: Progress indicator — top bar or text counter? (ANSWERED)

**Task:** SP2-11 (Quiz page — full flow)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Top progress bar (Duolingo-style).**

Thin colored bar at the top of the quiz view. Fills 20% per question. No text counter — the bar is self-explanatory and keeps the UI clean. This is the Duolingo standard for a reason: it creates forward momentum ("almost there!") without adding visual noise. The `about.md` explicitly references Duolingo as the UX model — follow it.

---

## D3-Q5 — Quiz page: Hide BottomNav during an active lesson? (ANSWERED)

**Task:** SP2-11 (Quiz page — full flow)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option B — Hide nav, show X button, no confirmation prompt.**

Exactly right. During an active lesson, the quiz owns the screen — no bottom nav, no distractions. Top-left X button takes the user back to dashboard. No "are you sure?" prompt — the lesson is 5 questions (~3 minutes), losing progress is trivial. This also aligns with the future "Focus Mode" feature (3.3, deferred to v2) — we're already building the foundation for it.

Layout during an active lesson:

- Top: progress bar (D3-Q4) + X close button
- Middle: QuizCard + OptionButtons
- Bottom: "Check" button (D3-Q2)
- No BottomNav

---

## D3-Q6 — What should I do between finishing Week 1 components and SYNC-5? (ANSWERED)

**Task:** SP2-11 (depends on SYNC-5)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option D — Build against mocks, review PRs, research polish.**

Exactly the right approach. Priority order:

1. **Build SP2-11 + SP2-12 with mock data** — this is the highest value. When SYNC-5 lands, you swap `mockFetchQuestions()` for `fetch('/api/quiz')` and you're done. Integration becomes a 30-minute task instead of a 2-day task.
2. **Review Dev 1/Dev 2 PRs** — stay aware of what's shipping, especially Dev 2's API response shapes so your mocks stay aligned.
3. **Research animations** — only if you have idle time. CSS transitions are fine for MVP, Framer Motion is a nice-to-have.

Use the types from `src/types/index.ts` (Dev 1 is defining the `AnswerResponse` there per D1-S2-Q9) for your mocks so they match the real API shape.

---

## D3-Q7 — Frontend types: Where and how should I define them? (ANSWERED)

**Task:** SP2-08, SP2-09, SP2-10, SP2-11
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Define frontend types in `src/types/index.ts`. And yes, your proposed shapes match.**

Dev 2 already confirmed the `AnswerResponse` shape in D2-S2-Q7, and Dev 1 is adding it to `src/types/index.ts` per D1-S2-Q9. The agreed contract is:

```typescript
// What POST /api/answer returns (confirmed by Dev 2 in D2-S2-Q7)
interface AnswerResponse {
  isCorrect: boolean;
  correctOption: string;
  selectedOption: string; // ← Dev 2 added this echo-back field
  explanation: string;
  aiFeedback: string | null;
}
```

Note: Dev 2 added `selectedOption` as an echo-back field (useful for your UI state). Your `QuizQuestion` type is correct — Dev 2's quiz API will return exactly that shape (no `correctOption`, no `explanation`).

Define both types in `src/types/index.ts`. All 3 devs share one source of truth. You're aligned — start building.

---

# Sprint 3 Questions

---

## D3-Q8 — XPBar: Should it show total XP or level-relative XP? (ANSWERED)

**Task:** SP3-04 (XPBar component)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Level-relative. Your example is correct.**

Show `currentXp / nextLevelXp` (e.g., "20 / 200 XP"), not absolute totals. The bar fills based on progress within the current level. This is the Duolingo pattern — it keeps the next milestone feeling achievable. When the user levels up, the bar resets to 0 and starts filling again. More dopamine, more motivation.

---

## D3-Q9 — StreakBadge: What does the flame animation look like? (ANSWERED)

**Task:** SP3-08 (StreakBadge component)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — CSS pulse animation.**

Simple `scale(1) → scale(1.1) → scale(1)` on a 2s loop for active streaks. Gray static flame for zero/broken streak. Low effort, visually rewarding, easy for the designer to replace. Don't overthink it — 3 lines of CSS.

---

## D3-Q10 — Dashboard layout: How should the new components be arranged? (ANSWERED)

**Task:** SP3-09 (Dashboard with real data)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Vertical stack. Streak badge most prominent.**

Layout top to bottom:

1. User name + avatar + LevelBadge (header row)
2. **StreakBadge** (full width, large — this is the North Star metric)
3. **XPBar** (full width, progress toward next level)
4. Today's Activity card (questions answered, correct count)
5. Buy Streak Freeze button (only shows if user has >= 50 XP)

Vertical stack is the only layout that works well at 375px with all this content. Each section gets full width and breathing room.

---

## D3-Q11 — FeedbackModal: How should XP earned be displayed? (ANSWERED)

**Task:** Related to SP3-10 (note 7 in kanban)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: Option A — Inline with the result heading.**

"Correct!" on one line, "+10 XP" in smaller colored text right below. Same for wrong: "Wrong" then "+2 XP". Simple, immediate, no animation complexity. The XP feels like a reward the moment you see the result.

---

## D3-Q12 — Timezone header: What header name should the frontend use? (ANSWERED)

**Task:** SP3-09, SP3-11 (note 4 in kanban)
**Answered by:** Tech Lead | **Date:** 2026-04-12

**Answer: `X-Timezone` header. Send it on ALL authenticated API calls.**

Value: `Intl.DateTimeFormat().resolvedOptions().timeZone` (e.g., `"America/Sao_Paulo"`).

Send it on:

- `GET /api/quiz` — so the server knows "today" for streak checks
- `POST /api/answer` — so daily activity records use the correct date
- `GET /api/user` — so the server returns "today's activity" for the right day

Create a small helper (e.g., `src/lib/api.ts`) that wraps `fetch` and automatically adds the `X-Timezone` header to every API call. This avoids repeating the header in every `fetch()`. Dev 1 will read the same header on the backend — you're both aligned on the name.

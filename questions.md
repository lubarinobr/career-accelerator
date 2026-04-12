# Questions for the P.O.

This file tracks all technical questions raised by the Tech Lead that require P.O. clarification before implementation can begin.

**Status Legend:** `OPEN` | `ANSWERED` | `BLOCKED`

---

## Q1 - Target Platform (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: PWA (Progressive Web App).**

Web-first with a mobile feel. This is the fastest path to a shippable product. No app stores, no native builds. Push notifications via the Web Push API (supported on modern Android browsers; limited on iOS Safari but acceptable for MVP). Focus Mode (Feature 3.3) will rely on UI-level immersion rather than OS-level app locking.

---

## Q2 - MVP Scope (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Agreed with the Tech Lead's suggestion, with one adjustment.**

MVP scope:
- **Feature 1.1** (Question Generator) — core value, but with a **batch pre-generation strategy** (see Q4)
- **Feature 2.1** (Streaks) — retention hook
- **Feature 2.3** (XP system) — basic gamification
- **Feature 3.1** (Quiz UI) — the interface
- **APP-02** (Auth & persistence) — simplified (see Q5)

**Deferred to v2:** TTS (3.2), Focus Mode (3.3), Socratic Feedback (1.2), AI Notifications (2.2), Adaptive Difficulty (1.3).

---

## Q3 - Which Certifications First? (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: AWS Cloud Practitioner (CLF-C02) only.**

Single certification for MVP. This narrows the prompt engineering scope and makes quality validation manageable. The question domains should follow the official AWS Cloud Practitioner exam guide:
1. Cloud Concepts
2. Security and Compliance
3. Cloud Technology and Services
4. Billing, Pricing, and Support

---

## Q4 - LLM Provider & Cost Strategy (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Budget is very tight. Use a batch pre-generation + on-demand validation strategy.**

The approach:
1. **Question generation:** Call the LLM in batch to generate a pool of questions (e.g., 50-100 per domain) and **store them in the database**. This is a one-time or periodic cost, not per-session.
2. **Answer validation/feedback:** When a user answers wrong, send only that specific question + user answer to the LLM for a short explanation. This is the only per-interaction API call.

This drastically reduces API costs. For provider: **Tech Lead should choose whichever offers the best cost/quality ratio for this pattern.** Claude or GPT are both fine. Open-source is also acceptable if it keeps costs near zero. The P.O. trusts the Tech Lead's judgment here — optimize for lowest cost that still produces accurate AWS Cloud Practitioner content.

---

## Q5 - User Authentication Method (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Google social login only for MVP.**

The app will initially be used by a single user (the CEO himself). Google login is the simplest zero-friction option. No email/password, no Apple login, no GitHub. Just Google. We can add more providers later if the user base grows.

---

## Q6 - Monetization Model (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: 100% free. No premium tier. No subscription system.**

XP is the only currency, used purely for gamification (Streak Freeze, leveling). No real money involved. LLM costs are managed through the batch pre-generation strategy (Q4), keeping operational costs minimal. No need to architect any payment or subscription infrastructure.

---

## Q7 - Offline Support (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: No offline mode for MVP.**

Since questions are pre-generated and stored in the database (see Q4), the app already has low dependency on real-time LLM calls. However, full offline mode (local caching, sync logic) is out of scope. The user needs an internet connection. This keeps the architecture simple. Can be revisited in v2 if needed — the batch strategy actually makes offline easier to add later since questions are already stored.

---

## Q8 - Content Language (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Everything in English — UI and content.**

The entire app (buttons, menus, navigation, questions, explanations) is in English. This is intentional: the goal is full English immersion for professional vocabulary training. No bilingual mode. No Portuguese. If the user doesn't understand a UI element, that itself is a learning moment. The wrong-answer explanations should use simplified English (short sentences, common words) but still be 100% in English.

---

## Q9 - "Drill Sergeant" Notification Tone (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Deferred to v2. No AI notifications in MVP.**

AI-driven notifications (Feature 2.2) are not in the MVP scope (see Q2). When implemented in v2, the user will choose their preferred tone via a settings toggle with 3 options: Encouraging, Balanced, Drill Sergeant. The AI does not decide — the user controls it.

---

## Q10 - Data Privacy & Target Region (ANSWERED)
**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Brazil (single user). No compliance framework needed for MVP.**

The app is initially for personal use by a single user located in Brazil. No LGPD or GDPR compliance work is required at this stage. Deploy to the **closest available cloud region to São Paulo** (e.g., `sa-east-1` on AWS, `southamerica-east1` on GCP) for minimum latency. If the user base ever expands, compliance can be addressed then.

---

# Roadmap Technical Review — Questions from Tech Lead

The following questions were raised after reviewing `roadmap.md`.

---

## Q11 - Question Exhaustion Strategy (BLOCKED) — TO P.O.
**Asked by:** Tech Lead | **Date:** 2026-04-12

The MVP targets **600 pre-generated questions**. At 5 questions per lesson, that's **120 lessons**. If the user does 2-3 lessons per day, the pool runs out in ~40-60 days.

**What should happen when the user has answered all questions?**
- **Option A:** Recycle old questions (allow re-answering after a cooldown period, e.g., 30 days)
- **Option B:** Generate more questions on-demand when pool gets low
- **Option C:** Show a "You've completed all questions!" screen and wait for manual batch refill

This affects tasks S2-04 (serve questions) and S2-03 (pool size). The Tech Lead recommends **Option A** (recycle with cooldown) as simplest, but the P.O. should decide.

---

## Q12 - Sprint 2/3 XP Overlap Clarification (BLOCKED) — TO P.O.
**Asked by:** Tech Lead | **Date:** 2026-04-12

There is an overlap between Sprint 2 and Sprint 3 regarding XP:
- **S2-05** says: "submit answer, calculate XP" and "returns is_correct + xp_earned, updates daily_activity"
- **S3-01** says: "XP calculation logic" 
- **S3-10** says: "Update quiz flow to award XP after each answer"
- **S3-11** says: "Update quiz flow to record daily activity"

**Which sprint actually implements XP and daily_activity tracking?**

The Tech Lead's recommendation:
- **Sprint 2:** S2-05 should save the answer and return `is_correct` only. No XP calculation yet. Daily activity is not tracked yet.
- **Sprint 3:** S3-01 and S3-10 implement the full XP system, and S3-11 adds daily activity tracking.

This avoids rework. Does the P.O. agree, or should Sprint 2 already include basic XP awarding?

---

## Q13 - Supabase Region Availability (OPEN) — TECH NOTE
**Asked by:** Tech Lead | **Date:** 2026-04-12

**This is a tech note, not a P.O. question.**

Supabase free tier may not offer `sa-east-1` (São Paulo). Available free-tier regions are typically US/EU. The Tech Lead will verify during S1-03 and choose the closest available region. If São Paulo is not available, `us-east-1` (Virginia) will be used — latency from Brazil is ~120ms, acceptable for MVP with a single user.

---

## Q14 - Question Quality Validation (BLOCKED) — TO P.O.
**Asked by:** Tech Lead | **Date:** 2026-04-12

Task S2-03 targets 600 AI-generated questions. LLMs can produce inaccurate content, especially on specific certification exam details.

**Does the P.O. want to manually review a sample of generated questions before they go live?**
- If yes: The Tech Lead will build a simple review script/export (CSV or JSON) for P.O. spot-checking
- If no: We trust the LLM output with prompt-level validation only

Since the target user is studying for a real AWS certification, incorrect questions could be harmful. The Tech Lead **strongly recommends** at least a spot-check of 10-20% of generated questions.

---

## Q15 - Minimum Daily Activity for Streak (BLOCKED) — TO P.O.
**Asked by:** Tech Lead | **Date:** 2026-04-12

Task S3-06 (Streak engine) needs a clear definition: **what counts as "active" for a day?**

- **Option A:** Answer at least 1 question = active day
- **Option B:** Complete at least 1 full lesson (5 questions) = active day
- **Option C:** Earn at least X XP = active day

This directly impacts the "Daily Consistency" North Star metric from `about.md`. The about.md says "a 5-minute session every single day" which suggests Option B (one full lesson), but the P.O. should confirm.

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

> **P.O. ACTION REQUIRED — SPRINT 2 BLOCKERS**
>
> Questions Q11, Q12, Q14, and Q15 below are **blocking Sprint 2 planning**.
> The Tech Lead cannot finalize the Sprint 2 kanban until these are answered.
> Each question includes the Tech Lead's recommendation — the P.O. can agree
> or choose a different option. Please answer and update the status to ANSWERED.
>
> — Tech Lead, 2026-04-12

The following questions were raised after reviewing `roadmap.md`.

---

## Q11 - Question Exhaustion Strategy (ANSWERED) — TO P.O.

**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Option A — Recycle with 30-day cooldown.**

Agreed with the Tech Lead's recommendation. After a user has answered all questions, recycle them after 30 days since last answered. This is the simplest approach, keeps the streak alive, and repetition is actually good for certification study (spaced repetition effect). The query in S2-04 should prioritize unanswered questions first, then oldest-answered questions past the 30-day cooldown. No new UI needed — the user just keeps getting questions seamlessly.

---

## Q12 - Sprint 2/3 XP Overlap Clarification (ANSWERED) — TO P.O.

**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Agreed with the Tech Lead. XP and daily_activity belong entirely in Sprint 3.**

Sprint 2 focuses on the core quiz flow only. S2-05 should:

- Save the answer to `user_answers`
- Return `is_correct` and the correct option
- Trigger LLM feedback if wrong (S2-06)
- **No XP calculation, no daily_activity update**

Sprint 3 adds the gamification layer on top. This is cleaner and avoids rework. I'll update the roadmap accordingly to remove XP references from S2-05's acceptance criteria.

---

## Q13 - Supabase Region Availability (ANSWERED) — TECH NOTE

**Asked by:** Tech Lead | **Date:** 2026-04-12
**Resolved:** 2026-04-12

**Answer: `eu-west-1` (Ireland).** São Paulo was unavailable on Supabase free tier. Ireland was the best option available. Session Pooler connection used for IPv4 compatibility. Latency is acceptable for a single-user MVP.

---

## Q14 - Question Quality Validation (ANSWERED) — TO P.O.

**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Yes — export a CSV for spot-checking. The CEO will review.**

The Tech Lead is right, incorrect questions are worse than no questions for certification study. The plan:

1. After batch generation, export all 600 questions to a CSV (question, options, correct answer, explanation, domain, difficulty).
2. The CEO (who is the target user and is studying for this cert) will spot-check at least 10-20% (~60-120 questions).
3. Any flagged questions get removed or corrected manually before going live.

This does NOT block Sprint 2 development — the batch script (S2-01) and quiz flow (S2-04, S2-05) can be built with a smaller test set of 20-30 questions. The full 600 pool and review happen in parallel. Add a small task to S2 for the CSV export functionality.

---

## Q15 - Minimum Daily Activity for Streak (ANSWERED) — TO P.O.

**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: Option B — Complete at least 1 full lesson (5 questions) = active day.**

This aligns with the North Star metric ("a 5-minute session every single day"). One question is too easy and doesn't build a real habit. Five questions is the minimum meaningful engagement — it takes ~3-5 minutes and ensures the user actually practiced. The streak badge should not light up until the user finishes a full lesson that day.

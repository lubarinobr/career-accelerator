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

**Updated 2026-04-13:** The question pool for MVP is **60 questions** (not 600). 600 was excessive for an MVP scope. With a smaller pool, the recycle strategy becomes even more important to keep the experience fresh.

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

**Answer: No — no manual review process for MVP.**

**Updated 2026-04-13:** With only 60 questions in the MVP pool, a formal CSV export and review process is unnecessary overhead. The CEO trusts the LLM output quality for this scope. If quality issues surface during actual usage, they can be fixed on the spot. No CSV export task needed in any sprint.

---

## Q15 - Minimum Daily Activity for Streak (ANSWERED) — TO P.O.

**Asked by:** Tech Lead | **Date:** 2026-04-12
**Answered by:** P.O. | **Date:** 2026-04-12

**Answer: 1 question = active day (default).**

**Updated 2026-04-13:** The minimum activity to count as an active day for streaks is **1 question answered**, set as the default. This has already been implemented. Keeping the bar low encourages daily engagement — even a single question maintains the habit loop. This is the MVP default; a configurable threshold can be considered for v2.

> **Note:** Questions from 2026-04-13 onward are in `13-04-2026-questions.md`.

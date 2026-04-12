# Technical Architecture — The Career Accelerator (MVP)

**Author:** Tech Lead | **Date:** 2026-04-12
**Status:** DRAFT — Pending team review

---

## 1. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | React-based, SSR for fast first load, great PWA support, API routes for backend logic |
| **Language** | TypeScript | Type safety across front and back end |
| **Styling** | Tailwind CSS | Rapid UI development, mobile-first utilities |
| **Auth** | NextAuth.js (Auth.js v5) | Built-in Google OAuth provider, session management, zero custom auth code |
| **Database** | Supabase (PostgreSQL) | Free tier, hosted Postgres, South America region available (`sa-east-1`), row-level security |
| **ORM** | Prisma | Type-safe DB queries, migration management, works well with Supabase |
| **LLM** | Claude API (Anthropic) | Best reasoning quality for technical content generation and explanations |
| **Deployment** | Vercel | Free tier, native Next.js support, edge functions, fast global CDN |
| **PWA** | `@ducanh2912/next-pwa` | Service worker generation, install prompt, app manifest |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   PWA (Browser)                  │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Quiz UI   │  │ Streak   │  │  XP/Level    │  │
│  │  (3.1)     │  │ (2.1)    │  │  (2.3)       │  │
│  └─────┬──────┘  └────┬─────┘  └──────┬───────┘  │
│        └───────────────┼───────────────┘          │
│                        │                          │
└────────────────────────┼──────────────────────────┘
                         │ HTTPS
┌────────────────────────┼──────────────────────────┐
│              Next.js API Routes                    │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ /api/quiz │  │ /api/answer  │  │ /api/user   │  │
│  │ (serve    │  │ (validate +  │  │ (profile,   │  │
│  │ questions)│  │ LLM feedback)│  │ stats, XP)  │  │
│  └─────┬────┘  └──────┬───────┘  └──────┬──────┘  │
│        │              │                  │          │
└────────┼──────────────┼──────────────────┼──────────┘
         │              │                  │
┌────────┼──────────────┼──────────────────┼──────────┐
│        ▼              ▼                  ▼          │
│  ┌─────────────────────────────────────────────┐   │
│  │         Supabase (PostgreSQL)                │   │
│  │  questions | users | user_answers | streaks  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │     Claude API (on-demand, wrong answers)    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  BATCH JOB (offline/manual)                         │
│  Script that calls Claude API to pre-generate       │
│  questions → inserts into Supabase                  │
└─────────────────────────────────────────────────────┘
```

---

## 3. Data Model

### `users`
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| google_id | text (unique) | Google OAuth subject ID |
| email | text | Google email |
| name | text | Display name |
| avatar_url | text | Google profile picture |
| total_xp | integer | Accumulated XP (default: 0) |
| level | integer | Current level (default: 1) |
| streak_freezes_available | integer | Purchasable with XP (default: 0) |
| created_at | timestamp | Account creation |

### `questions`
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| domain | text | One of the 4 CLF-C02 domains |
| difficulty | text | `easy`, `medium`, `hard` |
| question_text | text | The question in English |
| options | jsonb | Array of 4 options `[{key: "A", text: "..."},...]` |
| correct_option | text | `A`, `B`, `C`, or `D` |
| explanation | text | Pre-generated brief explanation |
| created_at | timestamp | When batch-generated |

### `user_answers`
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| user_id | uuid (FK → users) | Who answered |
| question_id | uuid (FK → questions) | Which question |
| selected_option | text | User's choice |
| is_correct | boolean | Was it right? |
| ai_feedback | text | LLM feedback (only for wrong answers, nullable) |
| xp_earned | integer | XP awarded for this answer |
| answered_at | timestamp | When answered |

### `daily_activity`
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| user_id | uuid (FK → users) | Who |
| activity_date | date (unique per user) | The calendar day |
| questions_answered | integer | Total questions that day |
| correct_count | integer | Correct answers that day |
| xp_earned | integer | Total XP earned that day |

### `streaks`
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| user_id | uuid (FK → users, unique) | One record per user |
| current_streak | integer | Consecutive active days |
| longest_streak | integer | All-time best |
| last_active_date | date | Last day with activity |
| freeze_used_date | date (nullable) | Last date a freeze was consumed |

---

## 4. Key Design Decisions

### 4.1 — Question Serving Strategy (< 3 second target)
The "zero-friction" requirement means no LLM call at quiz start. Flow:
1. User opens app → API fetches next N questions from the **pre-generated pool** in Supabase
2. Questions are served from DB — fast, predictable latency
3. LLM is only called when user answers **wrong** (for personalized feedback)
4. Questions already answered by the user are excluded via `user_answers` join

### 4.2 — XP & Leveling Formula
| Action | XP |
|---|---|
| Correct answer | +10 XP |
| Wrong answer (completed) | +2 XP |
| Perfect lesson (5/5) | +20 XP bonus |
| Streak Freeze cost | -50 XP |

Level thresholds (inspired by the professional titles from features.md):
| Level | Title | XP Required |
|---|---|---|
| 1 | Intern | 0 |
| 2 | Junior | 100 |
| 3 | Mid-level | 300 |
| 4 | Senior | 600 |
| 5 | Specialist | 1000 |
| 6 | Certified | 1500 |

### 4.3 — Streak Logic
- A "day" is defined by the user's **local timezone** (sent from browser via `Intl.DateTimeFormat`)
- A streak breaks if `last_active_date < yesterday` AND no freeze was applied
- Streak Freeze: if user misses a day and has freezes available, auto-apply one at next login
- Only 1 freeze can be used per missed day

### 4.4 — Batch Question Generation
- A CLI script (`scripts/generate-questions.ts`) calls Claude API with structured prompts
- Generates questions per domain, per difficulty level
- Target: **50 questions per domain x 4 domains x 3 difficulties = 600 questions** for launch
- Output is validated (JSON schema check) before DB insert
- Can be re-run to expand the pool over time

---

## 5. Project Structure

```
duoprocrastination/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icons/                 # App icons (192x192, 512x512)
│   └── sw.js                  # Service worker (auto-generated)
├── prisma/
│   └── schema.prisma          # Data model
├── scripts/
│   └── generate-questions.ts  # Batch LLM question generation
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (PWA meta, providers)
│   │   ├── page.tsx           # Landing / login page
│   │   ├── quiz/
│   │   │   └── page.tsx       # Main quiz interface (Feature 3.1)
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Streak, XP, stats overview
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # Google OAuth
│   │       ├── quiz/route.ts                # GET: serve questions
│   │       ├── answer/route.ts              # POST: submit answer, get feedback
│   │       └── user/route.ts                # GET: profile, stats
│   ├── components/
│   │   ├── QuizCard.tsx       # Single question card (swipe/tap)
│   │   ├── OptionButton.tsx   # Answer option (A/B/C/D)
│   │   ├── FeedbackModal.tsx  # Correct/wrong feedback display
│   │   ├── StreakBadge.tsx    # Streak counter flame icon
│   │   ├── XPBar.tsx          # XP progress bar
│   │   └── LevelBadge.tsx     # Current level/title display
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── llm.ts             # Claude API client wrapper
│   │   ├── xp.ts              # XP calculation logic
│   │   └── streak.ts          # Streak calculation logic
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── .env.local                 # Secrets (not committed)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. Sprint Plan

### Sprint 1 — Foundation (Week 1-2)
- [ ] Project setup (Next.js, TypeScript, Tailwind, Prisma, Supabase)
- [ ] PWA configuration (manifest, service worker, icons)
- [ ] Google OAuth with NextAuth.js
- [ ] Database schema & migrations
- [ ] Basic layout and navigation

### Sprint 2 — Core Quiz Engine (Week 3-4)
- [ ] Batch question generation script (Claude API)
- [ ] Generate initial question pool (600 questions)
- [ ] Quiz API endpoints (serve questions, submit answers)
- [ ] Quiz UI — question card, option buttons, feedback modal
- [ ] Wrong-answer LLM feedback integration

### Sprint 3 — Gamification & Polish (Week 5-6)
- [ ] XP system (earn, spend on streak freezes)
- [ ] Leveling system with professional titles
- [ ] Streak engine (daily tracking, freeze mechanic)
- [ ] Dashboard (stats, streak display, level progress)
- [ ] Mobile responsiveness & PWA install prompt
- [ ] Deploy to Vercel + Supabase production

---

## 7. Environment Variables

```env
# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Database
DATABASE_URL=              # Supabase PostgreSQL connection string

# LLM
ANTHROPIC_API_KEY=         # For batch generation + on-demand feedback
```

---

**Next step:** Team alignment on this architecture, then start Sprint 1.

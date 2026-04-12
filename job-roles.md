# Job Roles — The Career Accelerator

**Company:** The Career Accelerator
**Posted by:** CEO | **Date:** 2026-04-12
**Reviewed by:** Tech Lead

---

## Role 1: Senior Software Engineer — Backend / Fullstack (Dev 1)

**Focus:** Infrastructure, Authentication & Deployment

### About the Project
We're building an AI-powered micro-learning platform — think "Duolingo for professional certifications." The MVP is a Progressive Web App that delivers AI-generated quiz questions for AWS Cloud Practitioner, with gamification features (streaks, XP, leveling). We're a small team moving fast with a clear 6-week roadmap.

### What You'll Do
- Set up and own the project foundation: Next.js 15 (App Router), TypeScript, Tailwind CSS
- Implement Google OAuth authentication using Auth.js v5 (NextAuth)
- Configure and manage deployment pipelines on Vercel
- Set up PWA capabilities (manifest, service worker, installability)
- Build API routes that serve quiz content and process user answers
- Integrate with the Claude API (Anthropic) for AI-generated feedback on wrong answers
- Collaborate closely with a second senior engineer on database design and feature delivery

### Must-Have Skills
- **4+ years** of professional experience with **TypeScript** and **Node.js**
- Strong experience with **Next.js** (App Router preferred, Pages Router acceptable)
- Hands-on experience with **OAuth/authentication flows** (any provider — Google, GitHub, etc.)
- Experience with **Vercel** or similar deployment platforms (Netlify, AWS Amplify)
- Comfortable writing frontend code in **React** — you don't need to be a CSS artist, but you can build functional, clean UI with Tailwind
- Experience with **REST API design** and server-side logic in Next.js API routes
- Familiarity with **Git** branching strategies and PR-based workflows

### Nice-to-Have Skills
- Experience with **PWA** setup (service workers, web app manifest)
- Prior work with **LLM APIs** (OpenAI, Anthropic Claude, etc.)
- Knowledge of **Auth.js v5** specifically
- Experience with **Prisma ORM**

### What Success Looks Like (First 2 Weeks)
By the end of Sprint 1, you will have:
- Scaffolded the entire project from zero
- Implemented a working Google login flow that persists users to the database
- Deployed a live staging app on Vercel where the CEO can log in from his phone

---

## Role 2: Senior Software Engineer — Backend / Data (Dev 2)

**Focus:** Database, Data Model & API Logic

### About the Project
Same as above — we're building an AI-powered "Duolingo for certifications." You'll own the data layer and ensure the app's backend is solid, fast, and well-structured.

### What You'll Do
- Set up and manage the **Supabase** (PostgreSQL) database including project creation and region configuration
- Design and implement the database schema using **Prisma ORM** (5 tables: users, questions, user_answers, daily_activity, streaks)
- Build and maintain database migrations as the product evolves
- Develop API endpoints for quiz delivery, answer submission, and user stats
- Build the **batch question generation script** that calls the Claude API and populates the question pool
- Implement the **streak engine** and **XP/leveling logic** as core backend services
- Ensure data integrity across gamification features (XP calculations, streak tracking, daily activity)

### Must-Have Skills
- **4+ years** of professional experience with **TypeScript** and **Node.js**
- Strong experience with **PostgreSQL** or similar relational databases
- Hands-on experience with an **ORM** (Prisma preferred, TypeORM/Sequelize/Drizzle acceptable)
- Solid understanding of **data modeling** — designing schemas, indexes, foreign keys, constraints
- Experience building **backend APIs** in Node.js (Express, Fastify, or Next.js API routes)
- Comfortable writing frontend code in **React/Next.js** — enough to build simple pages and components
- Familiarity with **Git** branching strategies and PR-based workflows

### Nice-to-Have Skills
- Experience with **Supabase** (or Firebase, PlanetScale — any managed DB platform)
- Prior work writing **scripts that interact with LLM APIs** (batch processing, prompt engineering)
- Experience with **gamification systems** (XP, leveling, streaks)
- Knowledge of **timezone handling** in applications (date-fns, Intl API)
- Experience with **data validation** (zod, joi, or similar)

### What Success Looks Like (First 2 Weeks)
By the end of Sprint 1, you will have:
- Stood up a production-grade Supabase database with all tables migrated
- Built the Prisma client integration used across the entire app
- Delivered functional dashboard and navigation pages

---

---

## Role 3: Senior React Frontend Engineer (Dev 3)

**Focus:** Quiz UI, Interactive Components & User Experience

### About the Project
We're building an AI-powered micro-learning platform — "Duolingo for professional certifications." The MVP is a Progressive Web App that delivers AI-generated quiz questions for AWS Cloud Practitioner, with gamification features (streaks, XP, leveling). Sprint 1 is done — the app is live with auth, navigation, and a dashboard. You're joining at Sprint 2 to build the core quiz experience.

### What You'll Do
- Build the **quiz interface** — the heart of the product. A Duolingo-style experience where users answer one question at a time with large, tappable option buttons
- Create interactive components: **QuizCard** (question display), **OptionButton** (A/B/C/D with correct/wrong color states), **FeedbackModal** (post-answer explanation), **Lesson Complete** screen (score summary)
- Wire up the full **quiz flow**: fetch questions from API → display one at a time → submit answers → show feedback → track progress (1/5, 2/5...) → show lesson summary
- Handle **loading states, error states, and edge cases** (no questions available, API timeout, empty pool)
- Ensure everything is **mobile-first** — this app is primarily used on phones. Touch targets >= 44px, no horizontal scroll, smooth transitions
- In Sprint 3: build **gamification UI** — XP progress bar, streak badge with flame animation, level badge, and connect dashboard to real data

### Must-Have Skills
- **4+ years** of professional experience with **React** and **TypeScript**
- Strong experience with **Next.js App Router** (server components, client components, `"use client"` boundary)
- Deep understanding of **component architecture** — props, composition, state management for multi-step flows
- Experience building **interactive, stateful UIs** (multi-step forms, wizards, quiz flows, or similar)
- Solid **CSS/Tailwind** skills — you can build mobile-first responsive layouts quickly without a design system
- Experience consuming **REST APIs** from React (fetch, loading states, error handling)
- Comfort with **mobile web UX patterns** — touch targets, bottom sheets, slide-up modals, haptic feedback

### Nice-to-Have Skills
- Experience building **Duolingo-style** or **gamification UIs** (progress bars, streaks, leveling)
- Experience with **Framer Motion** or CSS animations for micro-interactions
- Prior work on **PWAs** (Progressive Web Apps)
- Experience with **optimistic UI updates** (update UI before API confirms)
- Knowledge of **accessibility** (ARIA attributes, keyboard navigation)

### What Success Looks Like (First 2 Weeks)
By the end of Sprint 2, you will have:
- Built all quiz UI components (QuizCard, OptionButton, FeedbackModal)
- Wired up a full 5-question lesson flow that works end-to-end on mobile
- Delivered a "Lesson Complete" screen showing the user's score
- The CEO can take a real quiz on his phone with AI-generated AWS questions

### What's Already Built (You're Not Starting From Zero)
- **Auth:** Google OAuth login works
- **Dashboard:** Shows user name, avatar, placeholder stats
- **Navigation:** Bottom nav bar (Dashboard / Quiz tabs)
- **Database:** 5 tables migrated in Supabase (users, questions, user_answers, daily_activity, streaks)
- **PWA:** Installable on Android Chrome
- **Deployed:** Live on Vercel at `https://career-accelerator-lemon.vercel.app`

You're joining a small, fast team. The backend APIs you need (quiz + answer endpoints) will be built by Dev 2 in your first week. During Week 1, you build components with mock data. During Week 2, you wire everything up.

---

## Shared Information (All Roles)

### Tech Stack
Next.js 16 | TypeScript | Tailwind CSS 4 | Prisma 7 | Supabase (PostgreSQL) | NextAuth.js v5 | Claude API (Anthropic) | Vercel

### Team Structure
- **CEO / P.O.** — Defines features and priorities
- **Tech Lead** — Architecture decisions, PR reviews, technical direction
- **Dev 1** — AI engine, batch generation, LLM integration
- **Dev 2** — Database, API logic, backend services
- **Dev 3 (you, if applying for Role 3)** — Quiz UI, frontend components, interactions
- **UI/UX Designer (joining later)** — Visual design, design system

### How We Work
- **Sprint cadence:** 2-week sprints, 3 sprints planned for MVP (6 weeks total)
- **Kanban board:** Markdown-based, tracked in the repo (`kanban-sprintN.md`)
- **Branching:** `sprint2/SP2-XX-short-description` per ticket
- **Task flow:** Devs move tasks to `READY TO TEST`, Tech Lead moves to `DONE` after review
- **All PRs reviewed by the Tech Lead** before merge to `main`
- **Weekly reports:** Each dev writes a weekly log in their folder (`dev3/daily-week1.md`)
- **Communication:** Async-first, all decisions documented in markdown files in the repo

### What We Offer
- Early-stage startup — your code ships to production in week 1
- Small team, high ownership — no bureaucracy, no meetings for the sake of meetings
- Direct impact — you're building the product, not maintaining legacy code
- AI-native project — hands-on experience building with LLM APIs
- Remote-friendly
- **The app is already live** — you're building features, not setting up infrastructure

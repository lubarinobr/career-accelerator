# Sprint 1 — Test Plan for P.O. and QA

**Author:** Tech Lead | **Date:** 2026-04-12
**Testers:** P.O., QA (and both devs during SP1-14 smoke test)

---

## What You're Testing

Sprint 1 delivers the **foundation** — not the product. There are no quiz questions, no XP, no streaks yet. You are validating that:

- The app loads fast on mobile
- Google login works end-to-end
- The user sees their own name and avatar after login
- Navigation between pages works
- The app installs as a PWA on Android
- Unauthenticated access is blocked

**If all of this works, Sprint 2 (the quiz engine) has a solid base to build on.**

---

## What You Need

- A phone with **Chrome** (Android preferred — PWA install works best)
- A desktop with **Chrome** (for secondary testing)
- A **Google account** to sign in
- The **Vercel staging URL** (provided by Dev 1 after SP1-13 is done)

---

## Test Script

Test each scenario in order. Mark PASS or FAIL. If FAIL, describe what happened.

---

### Test 1 — App Loads on Mobile

| Step | Action | Expected Result | PASS/FAIL |
|:-----|:-------|:----------------|:----------|
| 1.1 | Open the Vercel URL on your phone (Chrome) | Page loads in under 3 seconds | |
| 1.2 | Check the page content | You see the **login page** with the app name "Career Accelerator", a tagline, and a Google sign-in button | |
| 1.3 | Check the browser tab | Tab title shows "Career Accelerator" | |

---

### Test 2 — Google Sign-In

| Step | Action | Expected Result | PASS/FAIL |
|:-----|:-------|:----------------|:----------|
| 2.1 | Tap "Sign in with Google" | Google OAuth popup/redirect appears | |
| 2.2 | Select your Google account and authorize | You are redirected to the **Dashboard** page | |
| 2.3 | Check the dashboard | You see **your Google name** and **your Google profile picture** | |
| 2.4 | Check placeholder stats | You see cards showing: "0 days" (streak), "0 XP", "Intern" (level) | |

---

### Test 3 — Navigation

| Step | Action | Expected Result | PASS/FAIL |
|:-----|:-------|:----------------|:----------|
| 3.1 | Look at the bottom of the screen | A fixed **bottom navigation bar** with 2 tabs: "Quiz" and "Dashboard" | |
| 3.2 | Tap "Quiz" | You navigate to the Quiz page. It shows a message like "Coming in Sprint 2" | |
| 3.3 | Check the bottom nav | The "Quiz" tab is visually highlighted as active | |
| 3.4 | Tap "Dashboard" | You navigate back to the Dashboard page with your name and stats | |
| 3.5 | Check the bottom nav | The "Dashboard" tab is visually highlighted as active | |
| 3.6 | Scroll the page content (if scrollable) | The bottom nav bar stays **fixed at the bottom** — it does not scroll with the content | |

---

### Test 4 — Auth Protection

| Step | Action | Expected Result | PASS/FAIL |
|:-----|:-------|:----------------|:----------|
| 4.1 | Open a new **incognito/private** browser tab | Clean session, no cookies | |
| 4.2 | Navigate directly to `<vercel-url>/dashboard` | You are **redirected to the login page** — you cannot access the dashboard without signing in | |
| 4.3 | Navigate directly to `<vercel-url>/quiz` | You are **redirected to the login page** | |

---

### Test 5 — Session Persistence

| Step | Action | Expected Result | PASS/FAIL |
|:-----|:-------|:----------------|:----------|
| 5.1 | Sign in with Google (if not already signed in) | You reach the dashboard | |
| 5.2 | Close the browser tab completely | — | |
| 5.3 | Open a new tab and navigate to the Vercel URL | You are **still signed in** — you see the dashboard without needing to log in again | |

---

### Test 6 — PWA Install (Android Chrome only)

| Step | Action | Expected Result | PASS/FAIL |
|:-----|:-------|:----------------|:----------|
| 6.1 | On Android Chrome, visit the Vercel URL | After a moment, you may see an "Add to Home Screen" banner or install prompt | |
| 6.2 | If no automatic prompt: tap the Chrome menu (3 dots) → "Add to Home Screen" or "Install app" | The app installs and an icon appears on your home screen | |
| 6.3 | Tap the app icon on your home screen | The app opens in **standalone mode** — no browser address bar, feels like a native app | |
| 6.4 | Check the app header/status bar | The status bar color matches the app theme (blue) | |

---

### Test 7 — Desktop Browser

| Step | Action | Expected Result | PASS/FAIL |
|:-----|:-------|:----------------|:----------|
| 7.1 | Open the Vercel URL on **desktop Chrome** | Login page loads correctly | |
| 7.2 | Sign in with Google | Redirected to dashboard with your name and avatar | |
| 7.3 | Navigate between Quiz and Dashboard | Both pages load, navigation works | |
| 7.4 | Resize the browser window to ~375px width | The layout adapts to mobile size — no horizontal scrollbar, text is readable, buttons are tappable | |

---

## How to Report Bugs

For each FAIL, write a short report with:

1. **Which test failed** (e.g., "Test 2, step 2.2")
2. **What happened** (e.g., "After Google auth, I got a blank white page")
3. **What you expected** (e.g., "I expected to see the dashboard")
4. **Device and browser** (e.g., "Samsung Galaxy S23, Chrome 125")
5. **Screenshot** (if possible)

Send bug reports to the Tech Lead. The Tech Lead will triage and assign to Dev 1 or Dev 2.

---

## What's NOT in This Test

These are **not bugs** — they are features intentionally deferred:

| What You Might Notice | Why It's OK |
|:----------------------|:------------|
| Quiz page has no questions | Quiz engine comes in Sprint 2 |
| Stats are all zeros and don't change | XP and streak logic comes in Sprint 3 |
| No notifications | Deferred to v2 |
| No audio/TTS | Deferred to v2 |
| The design is basic/plain | UI/UX designer hasn't joined yet — visual polish comes later |
| No "sign out" button | Can be added — flag it and Tech Lead will prioritize |
| PWA install doesn't work on iOS Safari | Known iOS limitation — acceptable for MVP |

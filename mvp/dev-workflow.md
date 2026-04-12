# Developer Workflow Guide

**Author:** Tech Lead | **Date:** 2026-04-12
**Audience:** All developers on the team

---

## 1. Core Principles

### Ship, don't polish

The goal is a working product, not perfect code. If it works, is readable, and handles the real cases — it's done. Move on.

### Trust your teammates

Everyone on this team is a senior engineer. When reviewing code, focus on **correctness** and **clarity** — not personal style preferences. If the code works and is readable, approve it. Save debates for architecture decisions, not bracket placement.

### Communicate blockers, not status

Nobody needs to know you're "working on it." The team needs to know when:

- You finished something that **unblocks someone else**
- You are **blocked** and need something from someone else
- You found a **problem** that changes the plan

---

## 2. Task Workflow

### Picking up a task

1. Check the sprint kanban (`kanban-sprint1.md`)
2. Find your next `TODO` task
3. **Check the `Depends on` field** — if it lists a task that is not `DONE`, you cannot start. Do something else (review PRs, research next tasks, help a teammate)
4. Move the task to `DOING` in the kanban
5. Create your branch: `sprint1/SP1-XX-short-description`

### While working

- Commit early, commit often. Small commits with clear messages.
- If you discover something unexpected (scope bigger than expected, missing requirement, technical blocker), **tell the Tech Lead immediately** — don't silently spend 2 days on it.
- If you need a decision that's not in the docs, ask. Don't guess.

### Finishing a task

1. Self-review your own PR before requesting review. Read every line of your diff. Ask yourself: "Would I understand this code if I saw it for the first time in 6 months?"
2. Open a PR against `main`
3. Move the task to `READY TO TEST` in the kanban
4. **Check the `Blocks` field** — if your task blocks another dev's task, **notify them immediately.** Don't wait for them to check. A simple "SP1-04 is merged, you can start SP1-05" is enough.
5. Tech Lead reviews the code and the kanban ticket
6. **Only the Tech Lead moves a task to `DONE`.** Devs move tasks to `READY TO TEST` — that's it. The Tech Lead verifies the code against the acceptance criteria, checks it matches what the kanban ticket describes, and then moves it to `DONE`. This ensures every completed task has been validated before it counts as done.

### Sync point protocol

The kanban marks sync points (`SYNC-1`, `SYNC-2`, `SYNC-3`) where one dev depends on the other.

**If you are the one delivering:**

- Merge your PR
- Send a direct message to the waiting dev: "SYNC-X done. [Task ID] is merged, you're unblocked."

**If you are the one waiting:**

- Don't sit idle. Use the time to: review open PRs, read ahead on your next tasks, research libraries or patterns you'll need, write tests for logic you can already define.
- When you get the notification, start immediately. The other dev was waiting on you next.

---

## 3. Git Conventions

### Branch naming

```
sprint1/SP1-XX-short-description
```

Examples: `sprint1/SP1-05-google-auth`, `sprint1/SP1-03-prisma-schema`

### Commit messages

Write commits that explain **why**, not what. The diff shows what changed.

Good:

```
handle hot-reload Prisma client duplication in Next.js dev mode
```

Bad:

```
update db.ts
```

### PR rules

- One task = one PR. Don't bundle unrelated changes.
- Keep PRs small. If a task is large, split the PR into logical parts (e.g., "schema only" then "migration + seed").
- PR description should include: what it does, how to test it, and the kanban ticket ID.
- **All PRs require Tech Lead approval** before merge to `main`.

---

## 4. Code Review Culture

### The goal of code review

Code review exists to catch **bugs, security issues, and misunderstood requirements**. It does not exist to enforce personal preferences.

### What to flag in review

- Logic errors or missed edge cases that affect the user
- Security issues (exposed secrets, missing auth checks, SQL injection)
- Broken acceptance criteria from the kanban ticket
- Missing error handling on **external boundaries** (API calls, DB queries, user input)
- Code that is genuinely hard to understand (confusing naming, deeply nested logic)

### What NOT to flag in review

- Style preferences (single vs double quotes, trailing commas, blank line placement) — ESLint handles this, not humans
- "I would have done it differently" — if both approaches work and are readable, approve it
- Missing comments on self-explanatory code
- Renaming suggestions that are synonyms (e.g., `getData` vs `fetchData`) — if the intent is clear, it's fine
- Theoretical performance concerns on code that handles a single user

### How to give feedback

- **Be direct, not passive-aggressive.** Say "This will break if the session is null" not "Have you considered what might happen in certain edge cases? :)"
- **If it's a suggestion, not a blocker, say so.** Use "nit:" or "suggestion:" prefix. The author can skip these.
- **If it's a blocker, explain why.** "This needs to change because [specific reason]" — not just "change this."

### How to receive feedback

- Don't take it personally. The reviewer is reviewing the code, not you.
- If you disagree, explain your reasoning once. If the reviewer insists and it's not a clear right/wrong situation, **ask the Tech Lead to decide.** Don't go back and forth.

---

## 5. Testing Philosophy

### The rule: test what can break and matters

We don't chase coverage numbers. We don't write tests to prove obvious code works. We write tests when the **cost of a bug is higher than the cost of writing the test.**

### When to write tests

| Scenario                                                                          | Test?                                         | Why                                                                                                                          |
| :-------------------------------------------------------------------------------- | :-------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| Pure logic with calculations (XP formulas, streak calculations, level thresholds) | **Yes**                                       | Math can silently produce wrong results. These are core game mechanics — if XP is wrong, the product is broken.              |
| Data transformations (parsing LLM output, mapping DB rows to API responses)       | **Yes**                                       | Shape mismatches cause runtime crashes. A test locks the contract.                                                           |
| Business rules with branching (streak freeze: should it apply? which day counts?) | **Yes**                                       | Multiple conditions = multiple ways to be wrong. Tests document the intended behavior.                                       |
| Utility functions used across multiple files                                      | **Yes**                                       | Breaking one breaks many. Tests act as a safety net for shared code.                                                         |
| API route handlers that orchestrate DB + LLM calls                                | **Integration test, only for critical paths** | The quiz answer flow is the core product. One integration test for the happy path is worth more than 10 unit tests on mocks. |

### When NOT to write tests

| Scenario                                                          | Test?                       | Why                                                                                                                               |
| :---------------------------------------------------------------- | :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| React components (UI rendering, layout, styling)                  | **No**                      | The UI/UX isn't final. Visual testing is manual until the design system stabilizes. Don't lock in something that will change.     |
| Simple CRUD with no logic (fetch user, save answer to DB)         | **No**                      | Prisma is already tested by Prisma. Wrapping a `prisma.user.findUnique()` in a test that mocks Prisma proves nothing.             |
| Configuration files (next.config, tailwind.config, manifest.json) | **No**                      | These are validated by the build process and the smoke test.                                                                      |
| Glue code that just passes data between layers                    | **No**                      | If the layers it connects are tested, the glue doesn't need its own test.                                                         |
| One-time scripts (batch question generation)                      | **No, but validate output** | The script runs once manually. Instead of unit testing it, validate the JSON output with a schema check before inserting into DB. |

### How to write tests

- **Test file location:** Same folder as the source file. `lib/xp.ts` → `lib/xp.test.ts`
- **Test runner:** Vitest (fast, native TypeScript, works with Next.js)
- **Naming:** Describe the behavior, not the method.

Good:

```typescript
describe('XP calculation', () => {
  it('awards 10 XP for a correct answer', () => { ... })
  it('awards 2 XP for a wrong answer', () => { ... })
  it('awards 20 bonus XP for a perfect 5/5 lesson', () => { ... })
  it('does not award bonus XP for 4/5', () => { ... })
})
```

Bad:

```typescript
describe('calculateXP', () => {
  it('should work', () => { ... })
  it('test case 2', () => { ... })
})
```

- **No mocking unless truly necessary.** If you need to mock the database to test a function, that function is doing too much. Extract the logic into a pure function, test that, and let the integration test cover the DB part.
- **Keep tests simple.** A test that needs 30 lines of setup to run is a test that nobody will maintain. If setup is complex, the code under test probably needs refactoring.

---

## 6. Definition of Done (per task)

A task is `READY TO TEST` (from the dev's side) when:

- [ ] Code is merged to `main` via approved PR
- [ ] All acceptance criteria from the kanban ticket are met
- [ ] No `console.log` or debug code left in the codebase
- [ ] Tests written **only if the task involves logic that meets the testing criteria above**
- [ ] If the task blocks another dev → that dev has been notified
- [ ] Kanban is updated to `READY TO TEST`

A task is `DONE` only when the **Tech Lead** has:

- [ ] Verified the code against the acceptance criteria
- [ ] Confirmed the kanban ticket description matches what was delivered
- [ ] Moved the task to `DONE` in the kanban

**Devs never move tasks to DONE.** If the Tech Lead finds an issue during review, the task goes back to `DOING` with feedback. The dev fixes it, moves it back to `READY TO TEST`, and the cycle repeats.

---

## 7. Weekly Reports

At the end of each sprint week, every dev must create a weekly report file in their personal folder.

### Folder structure

Each dev has a folder in the project root named after their role:

```
dev1/
  daily-week1.md
  daily-week2.md
dev2/
  daily-week1.md
  daily-week2.md
```

### When to create it

Create the file **at the end of the last working day of the week** (Friday or the last day before the weekend). Don't wait until Monday — write it while the context is fresh.

### What to include

```markdown
# Dev [N] — Week [N] Daily Log

**Sprint:** Sprint [N]
**Week:** [N] (YYYY-MM-DD to YYYY-MM-DD)
**Dev:** Dev [N] (role description)

---

## Day X — Date

### What I did

- Task ID + title + what was done
- Decisions made and why
- PRs opened/merged

### Blockers

- What's blocking you (or "None")

### Waiting on

- Sync points or dependencies you're waiting for

### Unexpected findings

- Anything surprising: breaking changes, undocumented behavior, things that
  took longer than expected and why
```

### Why this matters

- The **Tech Lead reviews these files** to verify work against the kanban and the actual code. If the report says "task X done" but the code doesn't match, you'll hear about it.
- It creates an honest record of what happened during the sprint — useful for retros.
- It surfaces problems early. If you wrote "spent 3 hours debugging IPv4 connectivity," that's a signal to document it for the team so nobody else hits the same issue.

### End-of-week code quality check

Before writing your weekly report, **every dev must run the following commands and fix any issues:**

```bash
npm run lint        # ESLint — fix all errors and warnings
npx prettier --write "src/**/*.{ts,tsx}" "scripts/**/*.ts"   # Prettier — auto-format all code
npm test            # Vitest — all tests must pass
npm run build       # Next.js build — must compile with zero errors
```

**Include the results in your weekly report.** A simple line is enough:
```
### Code quality check
- `npm run lint` — clean (0 errors, 0 warnings)
- `prettier --write` — formatted 3 files
- `npm test` — 34 tests passing
- `npm run build` — passes
```

If any of these fail, **fix them before submitting your report.** Do not leave broken lint, unformatted code, or failing tests for the next week. The codebase must be clean at the end of every week.

### Rules

- Be honest. If you were idle waiting for a sync point, say so. If you spent 2 hours on something that should have taken 30 minutes, say why. Nobody is judging your speed — we're tracking the project's health.
- Don't pad it. "Reviewed docs" for 5 days is not a useful report. If you're blocked and idle, say that clearly so the Tech Lead can unblock you.
- Include **unexpected findings** — these are the most valuable part. Breaking changes, gotchas, things that don't work as documented. These save the next person hours.

---

## 8. When Things Go Wrong

### "I'm stuck and don't know how to proceed"

Tell the Tech Lead. Immediately. Not after 4 hours of silent struggling. Describe what you tried, what failed, and what you think the options are. The Tech Lead's job is to unblock you.

### "I found a bug in someone else's code"

Open a bug ticket or fix it yourself — whichever is faster. Don't use it as ammo in code review. We all ship bugs. The goal is to find them and fix them fast.

### "I disagree with an architecture decision"

Raise it with the Tech Lead with a concrete alternative. "I don't like X" is not useful. "X has problem Y, and Z would solve it because..." is useful. If the Tech Lead decides to keep X, commit to it and move on. Relitigating decided decisions slows the whole team down.

### "My task is taking longer than expected"

That's normal. Communicate it early. "SP1-05 is taking longer than expected, I'll need an extra day. SP1-07 might be delayed — Dev 2, heads up." That one message saves the whole team from a surprise blocker.

### "The acceptance criteria are unclear"

Ask the Tech Lead or P.O. before writing code. Don't interpret ambiguity yourself — you might build the wrong thing. A 5-minute question saves a 5-hour rewrite.

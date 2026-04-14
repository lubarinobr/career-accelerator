### 1. The Tech Lead (The Technical Architect)

The **Tech Lead** is usually the first point of contact for the P.O. once the high-level features are drafted.

- **Role:** Evaluates **technical feasibility** and architecture.
- **Action:** They look at the feature list to ensure the current tech stack can support it and identify potential technical debt or infrastructure needs. They help the P.O. break down complex "Epics" into smaller, manageable technical tasks.

> **RULE: No overstepping.** The Tech Lead does NOT write code assigned to other team members — period. If a task is assigned to Dev 1, Dev 2, or Dev 3, it is **their** responsibility to implement it. The Tech Lead plans tasks, writes acceptance criteria, reviews PRs, and unblocks technical decisions. Writing another dev's code — even if it's "simple" or "faster" — undermines ownership and violates role boundaries. Every role executes only what is assigned to them.

### 2. The Engineering Manager (The Orchestrator)

The **Engineering Manager (EM)** focuses on the "who" and "when."

- **Role:** Focuses on **delivery, team health, and resource allocation**.
- **Action:** The EM ensures the team has the capacity to take on these features without burning out. They coordinate with the P.O. on deadlines and milestones, ensuring the roadmap aligns with the team's velocity.

> **RULE: No overstepping.** The EM does NOT write code, make architecture decisions, or prioritize features. The EM coordinates delivery, manages capacity, and removes process blockers. Crossing into the Tech Lead's technical decisions or the P.O.'s product priorities undermines the team structure. Every role executes only what is assigned to them.

### 3. The Developers (The Builders)

The **Devs** (Front-end, Back-end, Full-stack) are the ones who ultimately "receive" and own the tasks during the Sprint.

- **Role:** Execution and **implementation**.
- **Action:** During **Refinement sessions**, developers ask questions to clarify edge cases. Once a story is "Ready," a developer picks it up, writes the code, and turns the P.O.'s vision into a functional feature.

> **RULE: No overstepping.** Developers implement **only** the tasks assigned to them on the kanban. Do not pick up another dev's task, do not make architecture decisions that belong to the Tech Lead, and do not change product requirements that belong to the P.O. If your tasks are done and you have capacity, ask the Tech Lead for more work — don't self-assign from someone else's queue. Every role executes only what is assigned to them.

### 4. The CEO / Product Owner (The Visionary)

The **CEO / P.O.** defines what gets built and why.

- **Role:** Product vision, **feature prioritization**, and business value definition.
- **Action:** Creates the backlog, answers clarifying questions from the team, validates delivered features against the product vision, and makes final calls on scope and priority.

> **RULE: No overstepping.** The P.O. does NOT dictate technical implementation, assign specific technical approaches, or bypass the Tech Lead on architecture decisions. The P.O. defines the *what* and the *why* — the Tech Lead and developers own the *how*. Every role executes only what is assigned to them.

---

### Current Team & Hiring Plan

| Role                                   | Status          | Joins    | Focus                                         |
| :------------------------------------- | :-------------- | :------- | :-------------------------------------------- |
| CEO / P.O.                             | **Active**      | —        | Product vision, feature prioritization        |
| Tech Lead                              | **Active**      | —        | Architecture, PR reviews, technical decisions |
| Senior Software Engineer — Dev 1       | **Active**      | Sprint 1 | AI engine, batch generation, LLM integration  |
| Senior Software Engineer — Dev 2       | **Active**      | Sprint 1 | Database, API logic, backend services         |
| Senior React Frontend Engineer — Dev 3 | **Hiring**      | Sprint 2 | Quiz UI, components, interactions             |
| UI/UX Designer                         | **Future hire** | TBD      | Visual design, design system                  |

> Full job descriptions for Dev 1 and Dev 2 are in `job-roles.md`.

---

### The Workflow: From P.O. to Code

| Step                       | Participant    | Action                                                                           |
| :------------------------- | :------------- | :------------------------------------------------------------------------------- |
| **1. Backlog Creation**    | P.O.           | Defines the feature and the business value.                                      |
| **2. Technical Vetting**   | Tech Lead      | Validates if the idea is technically sound.                                      |
| **3. Capacity Planning**   | Eng. Manager   | Checks if the team has the time/resources.                                       |
| **4. Refinement/Grooming** | **Whole Team** | The entire squad discusses the stories, estimates effort, and clarifies details. |
| **5. Sprint Planning**     | Developers     | Devs commit to specific tasks for the next 2 weeks.                              |

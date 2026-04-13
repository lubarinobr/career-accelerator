// V2-01 — Feedback level mapping
// Pure function, separated from llm.ts (which has "use server" directive).

export type FeedbackLevel = "beginner" | "intermediate" | "advanced";

/**
 * Map user level to feedback style.
 *   - Beginner (1-3): Simplified English, direct explanations
 *   - Intermediate (4-6): Explanation + guiding questions
 *   - Advanced (7+): Socratic method, technical language
 */
export function getFeedbackLevel(userLevel: number): FeedbackLevel {
  if (userLevel <= 3) return "beginner";
  if (userLevel <= 6) return "intermediate";
  return "advanced";
}

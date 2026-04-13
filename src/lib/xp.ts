// SP3-01 + S5-01 — XP calculation logic (Risk & Reward)
// SP3-03 + S5-03 — Leveling system (power-curve formula)
// Pure functions, no DB calls. Unit tested.

// S5-01: Difficulty-based XP scoring
const XP_CORRECT: Record<string, number> = { easy: 5, medium: 15, hard: 40 };
const XP_WRONG: Record<string, number> = { easy: -1, medium: -3, hard: -8 };
const XP_PERFECT_BONUS = 20;
const STREAK_FREEZE_COST = 50;
const PERFECT_LESSON_SIZE = 5;

// S5-03: Milestone titles for power-curve leveling
const MILESTONE_TITLES: Record<number, string> = {
  1: "Intern",
  2: "Apprentice",
  3: "Junior",
  4: "Mid-level",
  5: "Senior",
  6: "Specialist",
  7: "Expert",
  8: "Principal",
  9: "Distinguished",
  10: "Certified",
  25: "AWS Warrior",
  50: "Cloud Legend",
  100: "Grandmaster",
};

export type Difficulty = "easy" | "medium" | "hard";

// S5-01: Returns XP delta for an answer (can be negative)
export function calculateAnswerXP(
  isCorrect: boolean,
  difficulty: Difficulty,
): number {
  return isCorrect ? XP_CORRECT[difficulty] : XP_WRONG[difficulty];
}

// S5-01: Enforce XP floor at 0
export function clampXp(currentTotalXp: number, delta: number): number {
  return Math.max(0, currentTotalXp + delta);
}

export function calculateLessonBonusXP(
  correctCount: number,
  totalCount: number,
): number {
  return correctCount === totalCount && totalCount === PERFECT_LESSON_SIZE
    ? XP_PERFECT_BONUS
    : 0;
}

export function calculateStreakFreezeCost(): number {
  return STREAK_FREEZE_COST;
}

export function canAffordStreakFreeze(totalXp: number): boolean {
  return totalXp >= STREAK_FREEZE_COST;
}

// S5-03: Power-curve formula — xpRequired(level) = floor(50 * (level-1)^1.8)
// Level 1 = 0 XP (special case). Level 2 = floor(50 * 1^1.8) = 50.
// Level 3 = floor(50 * 2^1.8) = 174. Matches kanban table.
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(50 * Math.pow(level - 1, 1.8));
}

// S5-03: Get title for a level — milestone title or "LastTitle (Lv. N)"
function getTitle(level: number): string {
  if (MILESTONE_TITLES[level]) return MILESTONE_TITLES[level];

  // Find the highest milestone at or below this level
  const milestones = Object.keys(MILESTONE_TITLES)
    .map(Number)
    .filter((m) => m <= level)
    .sort((a, b) => b - a);

  const lastMilestone = milestones[0] ?? 1;
  return `${MILESTONE_TITLES[lastMilestone]} (Lv. ${level})`;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  nextLevelXp: number;
}

// S5-03: Calculate level from totalXp using power-curve formula
export function calculateLevel(totalXp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) {
    level++;
  }

  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);

  return {
    level,
    title: getTitle(level),
    currentXp: totalXp - currentLevelXp,
    nextLevelXp: nextLevelXp - currentLevelXp,
  };
}

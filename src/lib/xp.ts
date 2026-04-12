// SP3-01 — XP calculation logic
// SP3-03 — Leveling system
// Pure functions, no DB calls. Unit tested.

const XP_CORRECT = 10;
const XP_WRONG = 2;
const XP_PERFECT_BONUS = 20;
const STREAK_FREEZE_COST = 50;
const PERFECT_LESSON_SIZE = 5;

const LEVEL_THRESHOLDS = [
  { level: 1, title: "Intern", xpRequired: 0 },
  { level: 2, title: "Junior", xpRequired: 100 },
  { level: 3, title: "Mid-level", xpRequired: 300 },
  { level: 4, title: "Senior", xpRequired: 600 },
  { level: 5, title: "Specialist", xpRequired: 1000 },
  { level: 6, title: "Certified", xpRequired: 1500 },
] as const;

export function calculateAnswerXP(isCorrect: boolean): number {
  return isCorrect ? XP_CORRECT : XP_WRONG;
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

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  nextLevelXp: number;
}

export function calculateLevel(totalXp: number): LevelInfo {
  let currentLevel: (typeof LEVEL_THRESHOLDS)[number] = LEVEL_THRESHOLDS[0];

  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXp >= threshold.xpRequired) {
      currentLevel = threshold;
    } else {
      break;
    }
  }

  const currentLevelIndex = LEVEL_THRESHOLDS.findIndex(
    (t) => t.level === currentLevel.level,
  );
  const nextLevel = LEVEL_THRESHOLDS[currentLevelIndex + 1];

  const currentXp = totalXp - currentLevel.xpRequired;
  const nextLevelXp = nextLevel
    ? nextLevel.xpRequired - currentLevel.xpRequired
    : 0; // Max level reached

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentXp,
    nextLevelXp,
  };
}

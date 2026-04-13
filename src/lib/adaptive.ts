// V2-02 — Adaptive Difficulty Logic
// Pure functions, no DB calls. Unit tested.
// Analyzes user's recent success rate per difficulty and selects
// a difficulty distribution that keeps the user in "Flow State" (~70-80% success).
//
// Algorithm:
//   1. Calculate success rate per difficulty from recent answers
//   2. If success rate is too high (>85%) → shift toward harder questions
//   3. If success rate is too low (<60%) → shift toward easier questions
//   4. If no history → default balanced mix (2 easy, 2 medium, 1 hard)

export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface UserPerformance {
  easy: { correct: number; total: number };
  medium: { correct: number; total: number };
  hard: { correct: number; total: number };
}

const FLOW_TARGET = 0.75; // Target success rate for "Flow State"
const FLOW_HIGH = 0.85; // Above this = too easy, push harder
const FLOW_LOW = 0.60; // Below this = too hard, ease up

/**
 * Calculate the difficulty distribution for the next lesson.
 * Pure function — caller provides performance data from DB.
 *
 * @param performance - User's recent success rate per difficulty
 * @param lessonSize - Number of questions per lesson (default 5)
 * @returns Distribution of difficulties for the next lesson
 */
export function calculateDifficultyDistribution(
  performance: UserPerformance,
  lessonSize: number = 5,
): DifficultyDistribution {
  const totalAnswered =
    performance.easy.total +
    performance.medium.total +
    performance.hard.total;

  // No history — default balanced mix
  if (totalAnswered === 0) {
    return distributeDefault(lessonSize);
  }

  // Calculate overall success rate
  const totalCorrect =
    performance.easy.correct +
    performance.medium.correct +
    performance.hard.correct;
  const overallRate = totalCorrect / totalAnswered;

  // Calculate per-difficulty success rates (default to target if no data)
  const easyRate =
    performance.easy.total > 0
      ? performance.easy.correct / performance.easy.total
      : FLOW_TARGET;
  const mediumRate =
    performance.medium.total > 0
      ? performance.medium.correct / performance.medium.total
      : FLOW_TARGET;
  const hardRate =
    performance.hard.total > 0
      ? performance.hard.correct / performance.hard.total
      : FLOW_TARGET;

  // Determine shift direction based on overall performance
  if (overallRate > FLOW_HIGH) {
    // User is crushing it — shift harder
    return distributeHarder(lessonSize, easyRate, mediumRate, hardRate);
  }

  if (overallRate < FLOW_LOW) {
    // User is struggling — shift easier
    return distributeEasier(lessonSize, easyRate, mediumRate, hardRate);
  }

  // User is in the flow zone — maintain with slight adjustments
  return distributeBalanced(lessonSize, easyRate, mediumRate, hardRate);
}

/** Default distribution for new users: ~40% easy, ~40% medium, ~20% hard */
function distributeDefault(lessonSize: number): DifficultyDistribution {
  if (lessonSize <= 1) return { easy: 1, medium: 0, hard: 0 };
  if (lessonSize <= 2) return { easy: 1, medium: 1, hard: 0 };
  const hard = Math.max(0, Math.floor(lessonSize * 0.2));
  const easy = Math.floor(lessonSize * 0.4);
  const medium = lessonSize - easy - hard;
  return { easy, medium, hard };
}

/** User doing too well — push harder questions */
function distributeHarder(
  lessonSize: number,
  easyRate: number,
  mediumRate: number,
  _hardRate: number,
): DifficultyDistribution {
  // If they're acing easy/medium, reduce those and increase hard
  let hard = Math.max(2, Math.ceil(lessonSize * 0.4));
  let medium = Math.max(1, Math.ceil(lessonSize * 0.4));
  let easy = lessonSize - hard - medium;

  // If they're also acing medium, go even harder
  if (mediumRate > FLOW_HIGH && easyRate > FLOW_HIGH) {
    hard = Math.max(3, Math.ceil(lessonSize * 0.6));
    medium = Math.max(1, Math.floor(lessonSize * 0.2));
    easy = lessonSize - hard - medium;
  }

  return clampDistribution({ easy, medium, hard }, lessonSize);
}

/** User struggling — more easy questions */
function distributeEasier(
  lessonSize: number,
  _easyRate: number,
  mediumRate: number,
  hardRate: number,
): DifficultyDistribution {
  let easy = Math.max(2, Math.ceil(lessonSize * 0.4));
  let medium = Math.max(1, Math.ceil(lessonSize * 0.4));
  let hard = lessonSize - easy - medium;

  // If they're really struggling with hard, cut hard to minimum
  if (hardRate < 0.3) {
    hard = 0;
    medium = Math.max(1, Math.floor(lessonSize * 0.4));
    easy = lessonSize - medium;
  }

  // If also struggling with medium, go mostly easy
  if (mediumRate < 0.4) {
    easy = Math.max(3, Math.ceil(lessonSize * 0.6));
    medium = lessonSize - easy;
    hard = 0;
  }

  return clampDistribution({ easy, medium, hard }, lessonSize);
}

/** User in flow zone — slight adjustments per difficulty */
function distributeBalanced(
  lessonSize: number,
  easyRate: number,
  mediumRate: number,
  hardRate: number,
): DifficultyDistribution {
  // Start from default
  let easy = Math.max(1, Math.floor(lessonSize * 0.3));
  let medium = Math.max(1, Math.floor(lessonSize * 0.4));
  let hard = lessonSize - easy - medium;

  // Fine-tune: if easy is too high, swap one easy for medium/hard
  if (easyRate > FLOW_HIGH && easy > 1) {
    easy--;
    if (hardRate > FLOW_LOW) hard++;
    else medium++;
  }

  // If hard rate is low, swap one hard for medium
  if (hardRate < FLOW_LOW && hard > 0) {
    hard--;
    medium++;
  }

  return clampDistribution({ easy, medium, hard }, lessonSize);
}

/** Ensure distribution adds up to lessonSize and no negative values */
function clampDistribution(
  dist: DifficultyDistribution,
  lessonSize: number,
): DifficultyDistribution {
  let easy = Math.max(0, dist.easy);
  let medium = Math.max(0, dist.medium);
  let hard = Math.max(0, dist.hard);

  // If total exceeds lesson size, trim from the largest bucket first
  let total = easy + medium + hard;
  while (total > lessonSize) {
    if (easy >= medium && easy >= hard && easy > 0) easy--;
    else if (medium >= hard && medium > 0) medium--;
    else if (hard > 0) hard--;
    total = easy + medium + hard;
  }

  // If total is below lesson size, add to medium (safest)
  while (total < lessonSize) {
    medium++;
    total++;
  }

  return { easy, medium, hard };
}

// Shared TypeScript types
// Prisma-generated types are the source of truth for DB models.
// These types define API contracts shared across devs.

// SP2-04: Quiz API response — questions served to the client
// NOTE: correctOption and explanation are NOT included (don't leak answers)
export interface QuizQuestion {
  id: string;
  domain: string;
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  key: string;
  text: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
  totalXp: number;
  message?: string;
}

// SP2-05: Answer API request and response (per D2-S2-Q7)
export interface AnswerRequest {
  questionId: string;
  selectedOption: string;
}

export interface AnswerResponse {
  isCorrect: boolean;
  correctOption: string;
  selectedOption: string;
  explanation: string;
  aiFeedback: string | null;
  xpEarned: number; // S5: per-answer base XP — can be negative (Risk & Reward scoring)
  perfectBonus: number; // S6: perfect lesson bonus (20 if 5/5 correct on 5th answer, 0 otherwise)
  totalXp: number; // SP3-10: user's cumulative XP after this answer (includes bonus)
}

// SP3-02: User API response — dashboard stats
export interface UserStats {
  name: string;
  avatarUrl: string | null;
  totalXp: number;
  level: {
    level: number;
    title: string;
    currentXp: number;
    nextLevelXp: number;
  };
  streak: { currentStreak: number; longestStreak: number; isActive: boolean };
  streakFreezesAvailable: number;
  todayActivity: { questionsAnswered: number; correctCount: number; xpEarned: number } | null;
}

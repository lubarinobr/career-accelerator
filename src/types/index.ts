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
}

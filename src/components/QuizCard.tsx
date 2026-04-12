"use client";

import type { QuizQuestion } from "@/types";

const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
} as const;

interface QuizCardProps {
  question: QuizQuestion;
  children?: React.ReactNode;
}

export function QuizCard({ question, children }: QuizCardProps) {
  return (
    <div className="flex flex-1 flex-col px-4 pt-6">
      <div className="mb-6 flex items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          {question.domain}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyColors[question.difficulty]}`}
        >
          {question.difficulty.charAt(0).toUpperCase() +
            question.difficulty.slice(1)}
        </span>
      </div>

      <h2 className="text-lg leading-relaxed font-semibold text-gray-900">
        {question.questionText}
      </h2>

      <div className="mt-6 flex flex-col gap-3">{children}</div>
    </div>
  );
}

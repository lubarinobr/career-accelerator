"use client";

import type { AnswerResponse } from "@/types";

interface FeedbackModalProps {
  result: AnswerResponse;
  questionText: string;
  onNext: () => void;
}

export function FeedbackModal({
  result,
  questionText,
  onNext,
}: FeedbackModalProps) {
  const isCorrect = result.isCorrect;

  return (
    <div
      className={`flex min-h-screen flex-col ${isCorrect ? "bg-green-50" : "bg-red-50"}`}
    >
      <div className="flex flex-1 flex-col px-4 pt-12">
        {/* Result icon + text */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
          >
            {isCorrect ? (
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            ) : (
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <h2
            className={`text-2xl font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}
          >
            {isCorrect ? "Correct!" : "Wrong"}
          </h2>
        </div>

        {/* Question reminder */}
        <p className="mt-6 text-sm text-gray-500">{questionText}</p>

        {/* Correct answer (shown on wrong answers) */}
        {!isCorrect && (
          <p className="mt-4 text-base font-medium text-gray-900">
            Correct answer:{" "}
            <span className="font-bold text-green-700">
              {result.correctOption}
            </span>
          </p>
        )}

        {/* Explanation */}
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Explanation
          </h3>
          <p className="mt-2 leading-relaxed text-gray-800">
            {result.explanation}
          </p>
        </div>

        {/* AI Feedback (wrong answers only, nullable) */}
        {result.aiFeedback && (
          <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              AI Tutor
            </h3>
            <p className="mt-2 leading-relaxed text-gray-800">
              {result.aiFeedback}
            </p>
          </div>
        )}
      </div>

      {/* Next button anchored at bottom */}
      <div className="sticky bottom-0 bg-gradient-to-t from-white via-white p-4 pb-8">
        <button
          type="button"
          onClick={onNext}
          className={`w-full rounded-xl py-4 text-lg font-bold text-white transition-all active:scale-[0.98] ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
        >
          Next Question
        </button>
      </div>
    </div>
  );
}

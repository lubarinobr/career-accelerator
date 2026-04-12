"use client";

import { Confetti } from "@/components/Confetti";

interface QuestionResult {
  questionText: string;
  isCorrect: boolean;
}

interface LessonCompleteProps {
  results: QuestionResult[];
  onStartAnother: () => void;
  onBackToDashboard: () => void;
}

export function LessonComplete({
  results,
  onStartAnother,
  onBackToDashboard,
}: LessonCompleteProps) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const isPerfect = correctCount === total;
  const isGreat = correctCount >= total * 0.8;
  const isNearMiss = correctCount === total - 1 && !isPerfect;

  const getMessage = () => {
    if (isPerfect) return "PERFECT!";
    if (isNearMiss) return "So Close!";
    if (isGreat) return "Great Job!";
    if (correctCount >= total * 0.6) return "Lesson Complete";
    return "Keep Practicing!";
  };

  const getSubtext = () => {
    if (isPerfect) return "Flawless victory! You nailed every single one.";
    if (isNearMiss) return "Just one away from perfection! Try again?";
    if (isGreat)
      return `${correctCount} out of ${total} correct. You're on fire!`;
    return `You got ${correctCount} out of ${total} correct.`;
  };

  const getScoreColor = () => {
    if (isPerfect) return "from-yellow-400 to-orange-500";
    if (isGreat) return "from-green-400 to-emerald-500";
    return "from-blue-400 to-blue-600";
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Confetti for great scores */}
      {(isPerfect || isGreat) && (
        <Confetti count={isPerfect ? 120 : 60} />
      )}

      <div className="flex flex-1 flex-col items-center px-4 pt-12">
        {/* Animated score circle */}
        <div
          className={`animate-score-reveal flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${getScoreColor()} shadow-lg`}
        >
          <span className="text-4xl font-black text-white">
            {correctCount}/{total}
          </span>
        </div>

        {/* Title */}
        <h1
          className="animate-slide-up mt-6 text-3xl font-black text-gray-900"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          {getMessage()}
        </h1>

        {/* Subtitle */}
        <p
          className="animate-slide-up mt-2 text-center text-gray-500"
          style={{ animationDelay: "0.35s", opacity: 0 }}
        >
          {getSubtext()}
        </p>

        {/* Near-miss nudge */}
        {isNearMiss && (
          <div
            className="animate-slide-up mt-4 rounded-full bg-orange-100 px-4 py-2"
            style={{ animationDelay: "0.5s", opacity: 0 }}
          >
            <span className="text-sm font-semibold text-orange-700">
              One more try for the perfect score?
            </span>
          </div>
        )}

        {/* Question breakdown */}
        <div className="mt-8 w-full space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className="animate-slide-up flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
              style={{
                animationDelay: `${0.4 + index * 0.08}s`,
                opacity: 0,
              }}
            >
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${result.isCorrect ? "bg-green-500" : "bg-red-500"}`}
              >
                {result.isCorrect ? (
                  <svg
                    className="h-4 w-4 text-white"
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
                    className="h-4 w-4 text-white"
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
              <p className="text-sm leading-snug text-gray-800">
                {result.questionText}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="sticky bottom-0 space-y-3 bg-gradient-to-t from-white via-white p-4 pb-8">
        <button
          type="button"
          onClick={onStartAnother}
          className={`w-full rounded-xl py-4 text-lg font-bold text-white transition-all active:scale-[0.98] ${
            isNearMiss
              ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-lg"
              : "bg-blue-600"
          }`}
        >
          {isNearMiss ? "Try Again!" : "Start Another Lesson"}
        </button>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="w-full rounded-xl border-2 border-gray-200 bg-white py-4 text-lg font-bold text-gray-700 transition-all active:scale-[0.98]"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

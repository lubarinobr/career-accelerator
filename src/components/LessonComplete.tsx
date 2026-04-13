"use client";

import { Confetti } from "@/components/Confetti";

interface QuestionResult {
  questionText: string;
  isCorrect: boolean;
  xpEarned: number;
  difficulty: string;
}

interface LessonCompleteProps {
  results: QuestionResult[];
  totalXp: number;
  perfectBonus: number;
  onStartAnother: () => void;
  onBackToDashboard: () => void;
}

export function LessonComplete({
  results,
  totalXp,
  perfectBonus,
  onStartAnother,
  onBackToDashboard,
}: LessonCompleteProps) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const isPerfect = correctCount === total;
  const isGreat = correctCount >= total * 0.8;
  const isNearMiss = correctCount === total - 1 && !isPerfect;
  const lessonXpTotal = results.reduce((sum, r) => sum + r.xpEarned, 0) + perfectBonus;

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

        {/* XP Summary */}
        <div
          className="animate-slide-up mt-6 w-full rounded-2xl bg-white p-5 shadow-sm"
          style={{ animationDelay: "0.5s", opacity: 0 }}
        >
          {/* Lesson XP total */}
          <p
            className={`text-center text-2xl font-black ${lessonXpTotal >= 0 ? "text-green-600" : "text-amber-600"}`}
          >
            {lessonXpTotal >= 0 ? "+" : ""}
            {lessonXpTotal} XP
          </p>

          {/* Per-question XP breakdown */}
          <div className="mt-4 space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="capitalize text-gray-500">
                  Q{index + 1} — {result.difficulty}
                </span>
                <span
                  className={`font-semibold ${result.xpEarned >= 0 ? "text-green-600" : "text-amber-600"}`}
                >
                  {result.xpEarned >= 0 ? "+" : ""}
                  {result.xpEarned}
                </span>
              </div>
            ))}

            {/* Perfect bonus row */}
            {perfectBonus > 0 && (
              <div className="flex items-center justify-between border-t border-yellow-200 pt-2 text-sm">
                <span className="font-bold text-yellow-600">
                  PERFECT BONUS
                </span>
                <span className="font-black text-yellow-600">
                  +{perfectBonus}
                </span>
              </div>
            )}
          </div>

          {/* New total XP */}
          <div className="mt-3 border-t border-gray-100 pt-3 text-center">
            <span className="text-sm text-gray-500">Total: </span>
            <span className="text-sm font-bold text-gray-800">
              {totalXp} XP
            </span>
          </div>
        </div>

        {/* Question breakdown */}
        <div className="mt-6 w-full space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className="animate-slide-up flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
              style={{
                animationDelay: `${0.6 + index * 0.08}s`,
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
              <p className="flex-1 text-sm leading-snug text-gray-800">
                {result.questionText}
              </p>
              <span
                className={`shrink-0 text-xs font-semibold ${result.xpEarned >= 0 ? "text-green-600" : "text-amber-600"}`}
              >
                {result.xpEarned >= 0 ? "+" : ""}
                {result.xpEarned}
              </span>
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

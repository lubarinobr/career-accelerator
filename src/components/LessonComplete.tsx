"use client";

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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 flex-col items-center px-4 pt-12">
        {/* Score circle */}
        <div
          className={`flex h-28 w-28 items-center justify-center rounded-full ${isPerfect ? "bg-green-100" : "bg-blue-100"}`}
        >
          <span
            className={`text-4xl font-bold ${isPerfect ? "text-green-600" : "text-blue-600"}`}
          >
            {correctCount}/{total}
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {isPerfect ? "Perfect Lesson!" : "Lesson Complete"}
        </h1>
        <p className="mt-2 text-gray-500">
          You got {correctCount} out of {total} correct
        </p>

        {/* Question breakdown */}
        <div className="mt-8 w-full space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
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
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition-all active:scale-[0.98]"
        >
          Start Another Lesson
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

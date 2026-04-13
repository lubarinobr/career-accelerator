"use client";

import { useEffect, useState, useRef } from "react";

import type { AnswerResponse } from "@/types";

import { Confetti } from "@/components/Confetti";

interface FeedbackModalProps {
  result: AnswerResponse;
  questionText: string;
  combo: number;
  onNext: () => void;
}

function useAnimatedCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

const ENCOURAGEMENTS = [
  "Hard questions hit hard. Try again!",
  "That's how you learn. Keep going!",
  "The comeback is always stronger.",
  "Almost! You'll get the next one.",
];

let encouragementIndex = 0;
function getEncouragement(): string {
  const msg = ENCOURAGEMENTS[encouragementIndex % ENCOURAGEMENTS.length];
  encouragementIndex++;
  return msg;
}

export function FeedbackModal({
  result,
  questionText,
  combo,
  onNext,
}: FeedbackModalProps) {
  const isCorrect = result.isCorrect;
  const [showFlyup, setShowFlyup] = useState(true);
  const animatedXp = useAnimatedCounter(result.xpEarned, 600);
  const [encouragement] = useState(() => (!isCorrect ? getEncouragement() : ""));

  useEffect(() => {
    const timer = setTimeout(() => setShowFlyup(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex min-h-screen flex-col ${isCorrect ? "bg-green-50" : "bg-red-50"} ${!isCorrect ? "animate-shake" : ""}`}
    >
      {/* Confetti on correct answers */}
      {isCorrect && <Confetti count={combo >= 3 ? 100 : 50} />}

      <div className="flex flex-1 flex-col px-4 pt-12">
        {/* Result icon + text + XP */}
        <div className="relative flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full animate-bounce-in ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
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
          <div>
            <h2
              className={`text-2xl font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}
            >
              {isCorrect
                ? combo >= 5
                  ? "UNSTOPPABLE!"
                  : combo >= 3
                    ? "On Fire!"
                    : combo >= 2
                      ? "Nice Combo!"
                      : "Correct!"
                : "Wrong"}
            </h2>
            <p
              className={`text-sm font-bold animate-xp-glow ${isCorrect ? "text-yellow-500" : "text-amber-500"}`}
            >
              {isCorrect ? "+" : ""}{animatedXp} XP
            </p>
            {!isCorrect && (
              <p className="mt-1 text-xs text-gray-400">{encouragement}</p>
            )}
          </div>

          {/* XP flyup */}
          {showFlyup && (
            <span className={`animate-xp-flyup absolute -top-2 right-4 text-2xl font-black ${isCorrect ? "text-yellow-400" : "text-amber-400"}`}>
              {isCorrect ? "+" : ""}{result.xpEarned}
            </span>
          )}
        </div>

        {/* Combo badge */}
        {isCorrect && combo >= 2 && (
          <div className="mt-4 flex justify-center">
            <div className="animate-combo-pop inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 shadow-lg">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-black tracking-wide text-white">
                {combo}x COMBO
              </span>
            </div>
          </div>
        )}

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
        <div className="animate-slide-up mt-6 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Explanation
          </h3>
          <p className="mt-2 leading-relaxed text-gray-800">
            {result.explanation}
          </p>
        </div>

        {/* AI Feedback (wrong answers only, nullable) */}
        {result.aiFeedback && (
          <div
            className="animate-slide-up mt-4 rounded-xl bg-white p-4 shadow-sm"
            style={{ animationDelay: "0.15s", opacity: 0 }}
          >
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

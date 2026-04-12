"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { QuizQuestion, QuizResponse, AnswerResponse } from "@/types";
import type { OptionState } from "@/components/OptionButton";
import { QuizCard } from "@/components/QuizCard";
import { OptionButton } from "@/components/OptionButton";
import { FeedbackModal } from "@/components/FeedbackModal";
import { ProgressBar } from "@/components/ProgressBar";
import { LessonComplete } from "@/components/LessonComplete";

type QuizPhase = "loading" | "question" | "feedback" | "complete" | "error";

interface QuestionResult {
  questionText: string;
  isCorrect: boolean;
}

export function QuizFlow() {
  const router = useRouter();

  const [phase, setPhase] = useState<QuizPhase>("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResponse | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentQuestion = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;

  // Load questions on mount
  const loadQuestions = useCallback(async () => {
    setPhase("loading");
    setCurrentIndex(0);
    setResults([]);
    setSelectedOption(null);
    setAnswerResult(null);

    try {
      const res = await fetch("/api/quiz");
      if (!res.ok) {
        setErrorMessage("Failed to load questions. Please try again.");
        setPhase("error");
        return;
      }
      const data: QuizResponse = await res.json();
      if (data.questions.length === 0) {
        setErrorMessage(data.message ?? "No questions available. Check back later!");
        setPhase("error");
        return;
      }
      setQuestions(data.questions);
      setPhase("question");
    } catch {
      setErrorMessage("Failed to load questions. Please try again.");
      setPhase("error");
    }
  }, []);

  // Start quiz on first render
  useState(() => {
    loadQuestions();
  });

  const handleSelectOption = (key: string) => {
    if (isSubmitting || answerResult) return;
    setSelectedOption(key);
  };

  const handleCheck = async () => {
    if (!selectedOption || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOption,
        }),
      });
      if (!res.ok) {
        setErrorMessage("Failed to submit answer. Please try again.");
        setPhase("error");
        return;
      }
      const result: AnswerResponse = await res.json();
      setAnswerResult(result);
      setPhase("feedback");
    } catch {
      setErrorMessage("Failed to submit answer. Please try again.");
      setPhase("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!answerResult || !currentQuestion) return;

    setResults((prev) => [
      ...prev,
      {
        questionText: currentQuestion.questionText,
        isCorrect: answerResult.isCorrect,
      },
    ]);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setPhase("complete");
    } else {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setAnswerResult(null);
      setPhase("question");
    }
  };

  const handleClose = () => {
    router.push("/dashboard");
  };

  const getOptionState = (key: string): OptionState => {
    if (!answerResult) {
      return key === selectedOption ? "selected" : "default";
    }
    if (key === answerResult.correctOption) return "correct";
    if (key === selectedOption && !answerResult.isCorrect) return "wrong";
    return "dimmed";
  };

  // --- Loading state ---
  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500">Loading questions...</p>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-center text-gray-600">{errorMessage}</p>
        <button
          type="button"
          onClick={loadQuestions}
          className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="mt-3 text-sm text-gray-500 underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // --- Lesson Complete ---
  if (phase === "complete") {
    // Include the last question result
    const finalResults =
      answerResult && currentQuestion
        ? [
            ...results,
            {
              questionText: currentQuestion.questionText,
              isCorrect: answerResult.isCorrect,
            },
          ]
        : results;

    return (
      <LessonComplete
        results={finalResults}
        onStartAnother={loadQuestions}
        onBackToDashboard={handleClose}
      />
    );
  }

  // --- Feedback (full screen takeover) ---
  if (phase === "feedback" && answerResult && currentQuestion) {
    return (
      <FeedbackModal
        result={answerResult}
        questionText={currentQuestion.questionText}
        onNext={handleNext}
      />
    );
  }

  // --- Question phase ---
  if (!currentQuestion) return null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top bar: X close + progress */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={handleClose}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Close quiz"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex-1">
          <ProgressBar current={currentIndex} total={totalQuestions} />
        </div>
      </div>

      {/* Quiz card with options */}
      <QuizCard question={currentQuestion}>
        {currentQuestion.options.map((option) => (
          <OptionButton
            key={option.key}
            optionKey={option.key}
            text={option.text}
            state={getOptionState(option.key)}
            disabled={!!answerResult}
            onSelect={handleSelectOption}
          />
        ))}
      </QuizCard>

      {/* Check button (bottom anchored) */}
      <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 p-4 pb-8">
        <button
          type="button"
          onClick={handleCheck}
          disabled={!selectedOption || isSubmitting}
          className={`w-full rounded-xl py-4 text-lg font-bold text-white transition-all active:scale-[0.98] ${
            selectedOption && !isSubmitting
              ? "bg-blue-600"
              : "bg-gray-300 cursor-default"
          }`}
        >
          {isSubmitting ? "Checking..." : "Check"}
        </button>
      </div>
    </div>
  );
}

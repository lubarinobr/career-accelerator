// SP2-04 + V2-02 — GET /api/quiz
// Returns 5 questions for the authenticated user, adapted to their performance.
// V2-02: Adaptive difficulty — analyzes recent success rate per difficulty
// and selects questions that keep the user in "Flow State" (~70-80% success).
// Recycling: questions answered 30+ days ago are eligible again.
// Does NOT include correctOption or explanation (don't leak answers).

import { NextResponse } from "next/server";

import type { QuizResponse, QuizQuestion, QuestionOption } from "@/types";

import {
  calculateDifficultyDistribution,
  type Difficulty,
  type UserPerformance,
} from "@/lib/adaptive";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const QUESTIONS_PER_LESSON = 5;
const RECYCLE_DAYS = 30;
const PERFORMANCE_WINDOW = 50; // Look at last 50 answers for adaptive difficulty

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // SEC-01: Rate limiting — 20 req/min per user
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `quiz:${userId}`,
    RATE_LIMITS.quiz.maxRequests,
    RATE_LIMITS.quiz.windowMs,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    );
  }

  const recycleDate = new Date();
  recycleDate.setDate(recycleDate.getDate() - RECYCLE_DAYS);

  // Get IDs of questions answered within the last 30 days (not eligible)
  const recentAnswers = await prisma.userAnswer.findMany({
    where: {
      userId,
      answeredAt: { gt: recycleDate },
    },
    select: { questionId: true },
    distinct: ["questionId"],
  });

  const excludedIds = recentAnswers.map((a) => a.questionId);

  // Build where clause conditionally
  const baseWhere =
    excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {};

  // V2-02: Get user's recent performance for adaptive difficulty
  const recentPerformance = await prisma.userAnswer.findMany({
    where: { userId },
    orderBy: { answeredAt: "desc" },
    take: PERFORMANCE_WINDOW,
    select: {
      isCorrect: true,
      question: { select: { difficulty: true } },
    },
  });

  const performance: UserPerformance = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };

  for (const answer of recentPerformance) {
    const diff = answer.question.difficulty as Difficulty;
    if (diff in performance) {
      performance[diff].total++;
      if (answer.isCorrect) performance[diff].correct++;
    }
  }

  const distribution = calculateDifficultyDistribution(
    performance,
    QUESTIONS_PER_LESSON,
  );

  // Fetch questions per difficulty based on adaptive distribution
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const allQuestions: QuizQuestion[] = [];

  for (const diff of difficulties) {
    const needed = distribution[diff];
    if (needed === 0) continue;

    const diffWhere = { ...baseWhere, difficulty: diff };
    const available = await prisma.question.count({ where: diffWhere });

    if (available === 0) continue;

    const count = Math.min(needed, available);
    const offsets = new Set<number>();
    while (offsets.size < count) {
      offsets.add(Math.floor(Math.random() * available));
    }

    const questionPromises = [...offsets].map((offset) =>
      prisma.question.findMany({
        where: diffWhere,
        select: {
          id: true,
          domain: true,
          difficulty: true,
          questionText: true,
          options: true,
        },
        skip: offset,
        take: 1,
      }),
    );

    const results = await Promise.all(questionPromises);
    for (const result of results.flat()) {
      allQuestions.push({
        id: result.id,
        domain: result.domain,
        difficulty: result.difficulty as QuizQuestion["difficulty"],
        questionText: result.questionText,
        options: result.options as unknown as QuestionOption[],
      });
    }
  }

  // If adaptive selection returned fewer than needed (not enough questions
  // in a difficulty), fill remaining slots with any eligible question
  if (allQuestions.length < QUESTIONS_PER_LESSON) {
    const existingIds = allQuestions.map((q) => q.id);
    const fillWhere = {
      ...baseWhere,
      id: { notIn: [...excludedIds, ...existingIds] },
    };
    const fillAvailable = await prisma.question.count({ where: fillWhere });
    const fillNeeded = Math.min(
      QUESTIONS_PER_LESSON - allQuestions.length,
      fillAvailable,
    );

    if (fillNeeded > 0) {
      const offsets = new Set<number>();
      while (offsets.size < fillNeeded) {
        offsets.add(Math.floor(Math.random() * fillAvailable));
      }

      const fillPromises = [...offsets].map((offset) =>
        prisma.question.findMany({
          where: fillWhere,
          select: {
            id: true,
            domain: true,
            difficulty: true,
            questionText: true,
            options: true,
          },
          skip: offset,
          take: 1,
        }),
      );

      const fillResults = await Promise.all(fillPromises);
      for (const result of fillResults.flat()) {
        allQuestions.push({
          id: result.id,
          domain: result.domain,
          difficulty: result.difficulty as QuizQuestion["difficulty"],
          questionText: result.questionText,
          options: result.options as unknown as QuestionOption[],
        });
      }
    }
  }

  if (allQuestions.length === 0) {
    const response: QuizResponse = {
      questions: [],
      message: "You've answered all available questions! Check back later.",
    };
    return NextResponse.json(response);
  }

  // Shuffle to avoid predictable ordering (easy first, hard last)
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);

  const response: QuizResponse = {
    questions: shuffled,
  };

  return NextResponse.json(response);
}

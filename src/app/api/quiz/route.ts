// SP2-04 — GET /api/quiz
// Returns 5 unanswered questions for the authenticated user.
// Recycling: questions answered 30+ days ago are eligible again.
// Does NOT include correctOption or explanation (don't leak answers).

import { NextResponse } from "next/server";

import type { QuizResponse, QuizQuestion, QuestionOption } from "@/types";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const QUESTIONS_PER_LESSON = 5;
const RECYCLE_DAYS = 30;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
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
  const whereClause =
    excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {};

  // Get total eligible questions count for random offset
  const totalEligible = await prisma.question.count({ where: whereClause });

  if (totalEligible === 0) {
    const response: QuizResponse = {
      questions: [],
      message: "You've answered all available questions! Check back later.",
    };
    return NextResponse.json(response);
  }

  // Select random questions by picking random offsets
  const count = Math.min(QUESTIONS_PER_LESSON, totalEligible);
  const offsets = new Set<number>();
  while (offsets.size < count) {
    offsets.add(Math.floor(Math.random() * totalEligible));
  }

  const questionPromises = [...offsets].map((offset) =>
    prisma.question.findMany({
      where: whereClause,
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
  const questions = results.flat();

  const response: QuizResponse = {
    questions: questions.map(
      (q): QuizQuestion => ({
        id: q.id,
        domain: q.domain,
        difficulty: q.difficulty as QuizQuestion["difficulty"],
        questionText: q.questionText,
        options: q.options as unknown as QuestionOption[],
      }),
    ),
  };

  return NextResponse.json(response);
}

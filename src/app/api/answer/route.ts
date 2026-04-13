// SP2-05 + SP2-06 + SP3-10 + SP3-11 — POST /api/answer
// Full answer flow: save answer, calculate XP, generate AI feedback,
// update daily activity, update streaks on lesson complete.

import { NextResponse } from "next/server";

import type { AnswerRequest, AnswerResponse } from "@/types";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateFeedback } from "@/lib/llm";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { calculateStreak, getLocalDate } from "@/lib/streak";
import { validateTimezone, isValidUUID, isValidOption } from "@/lib/validation";
import {
  calculateAnswerXP,
  calculateLessonBonusXP,
  calculateLevel,
  type Difficulty,
} from "@/lib/xp";

const LESSON_SIZE = 5;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // SEC-01: Rate limiting — 30 req/min per user
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `answer:${userId}`,
    RATE_LIMITS.answer.maxRequests,
    RATE_LIMITS.answer.windowMs,
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

  const timezone = validateTimezone(request.headers.get("X-Timezone"));

  let body: AnswerRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { questionId, selectedOption } = body;

  if (!questionId || !selectedOption) {
    return NextResponse.json(
      { error: "questionId and selectedOption are required" },
      { status: 400 },
    );
  }

  if (typeof questionId !== "string" || !isValidUUID(questionId)) {
    return NextResponse.json(
      { error: "questionId must be a valid UUID" },
      { status: 400 },
    );
  }

  if (typeof selectedOption !== "string" || !isValidOption(selectedOption)) {
    return NextResponse.json(
      { error: "selectedOption must be A, B, C, or D" },
      { status: 400 },
    );
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // Check for duplicate answer (idempotent)
  const existingAnswer = await prisma.userAnswer.findFirst({
    where: { userId, questionId },
  });

  if (existingAnswer) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const response: AnswerResponse = {
      isCorrect: existingAnswer.isCorrect,
      correctOption: question.correctOption,
      selectedOption: existingAnswer.selectedOption,
      explanation: question.explanation,
      aiFeedback: existingAnswer.aiFeedback,
      xpEarned: existingAnswer.xpEarned,
      totalXp: user?.totalXp ?? 0,
    };
    return NextResponse.json(response);
  }

  const isCorrect = selectedOption === question.correctOption;

  // S5-02: Calculate XP with difficulty-based scoring
  let xpEarned = calculateAnswerXP(
    isCorrect,
    question.difficulty as Difficulty,
  );

  // SP2-06 + V2-01: Generate AI feedback for wrong answers (Socratic, level-aware)
  let aiFeedback: string | null = null;
  if (!isCorrect) {
    const options = question.options as { key: string; text: string }[];
    const feedbackUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true },
    });
    const userLevel = feedbackUser ? calculateLevel(feedbackUser.totalXp).level : 1;
    aiFeedback = await generateFeedback(
      question.questionText,
      options,
      question.correctOption,
      selectedOption,
      question.explanation,
      undefined,
      userLevel,
    );
  }

  // Save the answer
  await prisma.userAnswer.create({
    data: {
      userId,
      questionId,
      selectedOption,
      isCorrect,
      xpEarned,
      aiFeedback,
    },
  });

  // SP3-11: Upsert daily activity (on every answer)
  const today = getLocalDate(timezone);
  const todayDate = new Date(today + "T00:00:00Z");

  const dailyActivity = await prisma.dailyActivity.upsert({
    where: {
      userId_activityDate: { userId, activityDate: todayDate },
    },
    update: {
      questionsAnswered: { increment: 1 },
      correctCount: { increment: isCorrect ? 1 : 0 },
      xpEarned: { increment: xpEarned },
    },
    create: {
      userId,
      activityDate: todayDate,
      questionsAnswered: 1,
      correctCount: isCorrect ? 1 : 0,
      xpEarned,
    },
  });

  // SP3-10: Check for perfect lesson bonus on every 5th answer
  if (dailyActivity.questionsAnswered % LESSON_SIZE === 0) {
    const lastAnswers = await prisma.userAnswer.findMany({
      where: { userId },
      orderBy: { answeredAt: "desc" },
      take: LESSON_SIZE,
      select: { isCorrect: true },
    });

    const correctInLesson = lastAnswers.filter((a) => a.isCorrect).length;
    const bonus = calculateLessonBonusXP(correctInLesson, LESSON_SIZE);

    if (bonus > 0) {
      xpEarned += bonus;
      await prisma.dailyActivity.update({
        where: { userId_activityDate: { userId, activityDate: todayDate } },
        data: { xpEarned: { increment: bonus } },
      });
    }

    // SP3-11: Update streaks on lesson complete
    const streak = await prisma.streak.findUnique({ where: { userId } });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakFreezesAvailable: true },
    });

    const streakResult = calculateStreak(
      streak?.lastActiveDate?.toISOString().split("T")[0] ?? null,
      today,
      streak?.currentStreak ?? 0,
      streak?.longestStreak ?? 0,
      streak?.freezeUsedDate?.toISOString().split("T")[0] ?? null,
      (user?.streakFreezesAvailable ?? 0) > 0,
    );

    if (streakResult.action !== "none") {
      const streakData = {
        currentStreak: streakResult.currentStreak,
        longestStreak: streakResult.longestStreak,
        lastActiveDate: todayDate,
      };

      await prisma.streak.upsert({
        where: { userId },
        update: streakData,
        create: { userId, ...streakData },
      });

      if (streakResult.action === "apply_freeze") {
        const yesterday = new Date(todayDate);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);

        await prisma.streak.update({
          where: { userId },
          data: { freezeUsedDate: yesterday },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { streakFreezesAvailable: { decrement: 1 } },
        });
      }
    }
  }

  // S5-02: Update user total XP with floor enforcement (totalXp never below 0)
  let updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { totalXp: { increment: xpEarned } },
  });

  // Clamp totalXp to 0 if negative delta pushed it below floor
  if (updatedUser.totalXp < 0) {
    updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { totalXp: 0 },
    });
  }

  const response: AnswerResponse = {
    isCorrect,
    correctOption: question.correctOption,
    selectedOption,
    explanation: question.explanation,
    aiFeedback,
    xpEarned,
    totalXp: updatedUser.totalXp,
  };

  return NextResponse.json(response);
}

// SP2-05 + SP2-06 — POST /api/answer
// Receives { questionId, selectedOption }, saves to user_answers.
// Returns { isCorrect, correctOption, selectedOption, explanation, aiFeedback }.
// xpEarned is 0 for now (Sprint 3).
// SP2-06: On wrong answers, calls Claude (Haiku) for personalized feedback.
// Duplicate answers return the existing answer (idempotent, per D2-S2-Q6).

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateFeedback } from "@/lib/llm";
import type { AnswerRequest, AnswerResponse } from "@/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

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
      { status: 400 }
    );
  }

  // Validate selectedOption is A, B, C, or D
  if (!["A", "B", "C", "D"].includes(selectedOption)) {
    return NextResponse.json(
      { error: "selectedOption must be A, B, C, or D" },
      { status: 400 }
    );
  }

  // Look up the question
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
    const response: AnswerResponse = {
      isCorrect: existingAnswer.isCorrect,
      correctOption: question.correctOption,
      selectedOption: existingAnswer.selectedOption,
      explanation: question.explanation,
      aiFeedback: existingAnswer.aiFeedback,
      xpEarned: existingAnswer.xpEarned, // SP3-10 will calculate real XP
      totalXp: 0, // SP3-10 will return real cumulative XP
    };
    return NextResponse.json(response);
  }

  // Save the answer
  const isCorrect = selectedOption === question.correctOption;

  // SP2-06: Generate AI feedback for wrong answers (synchronous, per D1-S2-Q5)
  let aiFeedback: string | null = null;
  if (!isCorrect) {
    const options = question.options as { key: string; text: string }[];
    aiFeedback = await generateFeedback(
      question.questionText,
      options,
      question.correctOption,
      selectedOption,
      question.explanation
    );
  }

  const userAnswer = await prisma.userAnswer.create({
    data: {
      userId,
      questionId,
      selectedOption,
      isCorrect,
      xpEarned: 0, // XP calculation deferred to Sprint 3 (per Q12)
      aiFeedback,
    },
  });

  const response: AnswerResponse = {
    isCorrect: userAnswer.isCorrect,
    correctOption: question.correctOption,
    selectedOption: userAnswer.selectedOption,
    explanation: question.explanation,
    aiFeedback: userAnswer.aiFeedback,
    xpEarned: userAnswer.xpEarned, // SP3-10 will calculate real XP
    totalXp: 0, // SP3-10 will return real cumulative XP
  };

  return NextResponse.json(response);
}

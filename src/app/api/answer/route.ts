// TODO: S2-05 — POST /api/answer (Sprint 2)
// - Receives: { questionId, selectedOption }
// - Saves to user_answers
// - Returns: { isCorrect, correctOption, explanation }
// - If wrong: calls Claude API for simplified English feedback (S2-06)

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Answer API — coming in Sprint 2" },
    { status: 501 }
  );
}

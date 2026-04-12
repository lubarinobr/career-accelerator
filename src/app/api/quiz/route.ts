// TODO: S2-04 — GET /api/quiz (Sprint 2)
// - Returns 5 unanswered questions for the authenticated user
// - Excludes previously answered questions
// - Selects from pre-generated pool in DB

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Quiz API — coming in Sprint 2" },
    { status: 501 }
  );
}

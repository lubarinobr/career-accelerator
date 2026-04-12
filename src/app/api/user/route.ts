// TODO: S3-02 — GET /api/user (Sprint 3)
// - Returns: profile, total XP, level, streak info
// - Single call for the dashboard

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "User API — coming in Sprint 3" },
    { status: 501 }
  );
}

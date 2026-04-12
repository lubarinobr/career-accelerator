// SP3-07 — POST /api/streak-freeze/buy
// Deducts 50 XP from user, increments streakFreezesAvailable.
// Validates user can afford it first.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAffordStreakFreeze, calculateStreakFreezeCost } from "@/lib/xp";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXp: true, streakFreezesAvailable: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!canAffordStreakFreeze(user.totalXp)) {
    return NextResponse.json(
      {
        error: "Not enough XP",
        required: calculateStreakFreezeCost(),
        current: user.totalXp,
      },
      { status: 400 }
    );
  }

  const cost = calculateStreakFreezeCost();

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: { decrement: cost },
      streakFreezesAvailable: { increment: 1 },
    },
    select: {
      totalXp: true,
      streakFreezesAvailable: true,
    },
  });

  return NextResponse.json({
    success: true,
    totalXp: updatedUser.totalXp,
    streakFreezesAvailable: updatedUser.streakFreezesAvailable,
    cost,
  });
}

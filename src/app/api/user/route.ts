// SP3-02 — GET /api/user — profile + stats
// Returns everything the dashboard needs in one call.
// Side effect: auto-applies streak freeze if user missed exactly 1 day (SP3-07 / D2-S3-Q3).
// Creates streak record on first call if none exists (D2-S3-Q4).

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateLevel } from "@/lib/xp";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Upsert streak record — create with defaults if first call (D2-S3-Q4)
  let streak = await prisma.streak.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      freezeUsedDate: null,
    },
    update: {},
  });

  // Streak freeze auto-apply (D2-S3-Q3 + D2-S3-Q7)
  // If user missed exactly 1 day and has freezes available, consume one.
  // This runs on dashboard load so the user sees their streak preserved immediately.
  const timezone =
    request.headers.get("x-timezone") || "UTC";
  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: timezone,
  }); // YYYY-MM-DD
  const today = new Date(todayStr);

  if (streak.lastActiveDate && user.streakFreezesAvailable > 0) {
    const lastActive = new Date(streak.lastActiveDate.toISOString().split("T")[0]);
    const diffDays = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Missed exactly 1 day — auto-apply freeze
    if (diffDays === 2) {
      const yesterdayStr = new Date(today);
      yesterdayStr.setDate(yesterdayStr.getDate() - 1);

      // Only apply if freeze wasn't already used for this gap
      const alreadyUsed =
        streak.freezeUsedDate &&
        streak.freezeUsedDate.toISOString().split("T")[0] ===
          yesterdayStr.toISOString().split("T")[0];

      if (!alreadyUsed) {
        // Consume freeze: cover yesterday, keep streak alive
        const [updatedStreak] = await prisma.$transaction([
          prisma.streak.update({
            where: { userId },
            data: {
              lastActiveDate: yesterdayStr,
              freezeUsedDate: yesterdayStr,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              streakFreezesAvailable: { decrement: 1 },
            },
          }),
        ]);
        streak = updatedStreak;
      }
    }
  }

  // Determine if streak is active today
  const isActive = streak.lastActiveDate
    ? streak.lastActiveDate.toISOString().split("T")[0] === todayStr
    : false;

  // Get today's daily activity
  const todayActivity = await prisma.dailyActivity.findUnique({
    where: {
      userId_activityDate: {
        userId,
        activityDate: today,
      },
    },
  });

  // Calculate level from XP
  const level = calculateLevel(user.totalXp);

  return NextResponse.json({
    name: user.name,
    avatarUrl: user.avatarUrl,
    totalXp: user.totalXp,
    level,
    streak: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      isActive,
    },
    streakFreezesAvailable: user.streakFreezesAvailable,
    todayActivity: todayActivity
      ? {
          questionsAnswered: todayActivity.questionsAnswered,
          correctCount: todayActivity.correctCount,
        }
      : { questionsAnswered: 0, correctCount: 0 },
  });
}

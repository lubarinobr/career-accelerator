"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

import type { UserStats } from "@/types";

import { BottomNav } from "@/components/BottomNav";
import { LevelBadge } from "@/components/LevelBadge";
import { StreakBadge } from "@/components/StreakBadge";
import { XPBar } from "@/components/XPBar";
import { api } from "@/lib/api";

export function DashboardContent() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingFreeze, setBuyingFreeze] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api("/api/user");
      if (res.ok) {
        const data: UserStats = await res.json();
        setStats(data);
      }
    } catch {
      // Silently fail — dashboard shows loading state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleBuyFreeze = async () => {
    if (buyingFreeze || !stats) return;
    setBuyingFreeze(true);
    try {
      const res = await api("/api/streak-freeze/buy", { method: "POST" });
      if (res.ok) {
        await fetchStats(); // Refresh stats after purchase
      }
    } catch {
      // Silently fail
    } finally {
      setBuyingFreeze(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pb-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <BottomNav />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 pb-20">
        <p className="text-gray-500">Failed to load dashboard.</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchStats();
          }}
          className="mt-3 text-sm font-medium text-blue-600 underline"
        >
          Retry
        </button>
        <BottomNav />
      </div>
    );
  }

  const canAffordFreeze = stats.totalXp >= 50;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      <div className="px-4 pt-8">
        {/* Header: avatar + name + level badge */}
        <div className="flex items-center gap-4">
          {stats.avatarUrl && (
            <Image
              src={stats.avatarUrl}
              alt={stats.name}
              width={56}
              height={56}
              className="rounded-full ring-2 ring-blue-200"
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{stats.name}</h1>
            <div className="mt-1">
              <LevelBadge level={stats.level.level} title={stats.level.title} />
            </div>
          </div>
        </div>

        {/* Streak badge — most prominent (North Star metric) */}
        <div className="mt-6">
          <StreakBadge
            currentStreak={stats.streak.currentStreak}
            isActive={stats.streak.isActive}
          />
        </div>

        {/* XP progress bar */}
        <div className="mt-4">
          <XPBar
            currentXp={stats.level.currentXp}
            nextLevelXp={stats.level.nextLevelXp}
            title={stats.level.title}
          />
        </div>

        {/* Today's activity */}
        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Today
          </h3>
          {stats.todayActivity ? (
            <div className="mt-2 flex gap-6">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.todayActivity.questionsAnswered}
                </p>
                <p className="text-xs text-gray-500">questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.todayActivity.correctCount}
                </p>
                <p className="text-xs text-gray-500">correct</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400">
              No activity yet. Start a quiz!
            </p>
          )}
        </div>

        {/* Streak freeze */}
        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase">
                Streak Freezes
              </h3>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {stats.streakFreezesAvailable}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBuyFreeze}
              disabled={!canAffordFreeze || buyingFreeze}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                canAffordFreeze && !buyingFreeze
                  ? "bg-blue-600 text-white active:scale-[0.98]"
                  : "cursor-default bg-gray-200 text-gray-400"
              }`}
            >
              {buyingFreeze ? "Buying..." : "Buy (50 XP)"}
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => {
            setSigningOut(true);
            signOut({ callbackUrl: "/login" });
          }}
          disabled={signingOut}
          className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-600 transition-all active:scale-[0.98]"
        >
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>

      </div>

      <BottomNav />
    </div>
  );
}

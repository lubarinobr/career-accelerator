import { describe, it, expect } from "vitest";
import { calculateStreak, getLocalDate } from "./streak";

describe("calculateStreak", () => {
  // --- First day ever ---
  it("returns increment with streak 1 for first-time user (null lastActive)", () => {
    const result = calculateStreak(null, "2026-05-10", 0, 0, null, false);
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      isActive: true,
      action: "increment",
    });
  });

  // --- Already active today ---
  it("returns none when user already completed a lesson today", () => {
    const result = calculateStreak("2026-05-10", "2026-05-10", 5, 10, null, false);
    expect(result).toEqual({
      currentStreak: 5,
      longestStreak: 10,
      isActive: true,
      action: "none",
    });
  });

  // --- Consecutive days ---
  it("increments streak for consecutive day", () => {
    const result = calculateStreak("2026-05-09", "2026-05-10", 3, 5, null, false);
    expect(result).toEqual({
      currentStreak: 4,
      longestStreak: 5,
      isActive: true,
      action: "increment",
    });
  });

  it("updates longestStreak when current exceeds it", () => {
    const result = calculateStreak("2026-05-09", "2026-05-10", 5, 5, null, false);
    expect(result).toEqual({
      currentStreak: 6,
      longestStreak: 6,
      isActive: true,
      action: "increment",
    });
  });

  // --- Missed 1 day with freeze available ---
  it("returns apply_freeze when missed 1 day and freeze available", () => {
    const result = calculateStreak("2026-05-08", "2026-05-10", 7, 12, null, true);
    expect(result).toEqual({
      currentStreak: 8,
      longestStreak: 12,
      isActive: true,
      action: "apply_freeze",
    });
  });

  it("updates longestStreak when freeze saves a record streak", () => {
    const result = calculateStreak("2026-05-08", "2026-05-10", 12, 12, null, true);
    expect(result).toEqual({
      currentStreak: 13,
      longestStreak: 13,
      isActive: true,
      action: "apply_freeze",
    });
  });

  // --- Missed 1 day without freeze ---
  it("resets streak when missed 1 day and no freeze available", () => {
    const result = calculateStreak("2026-05-08", "2026-05-10", 7, 12, null, false);
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 12,
      isActive: true,
      action: "reset",
    });
  });

  // --- Missed 1 day but freeze already used for yesterday ---
  it("increments when freeze was already applied for the missed day", () => {
    const result = calculateStreak("2026-05-08", "2026-05-10", 7, 12, "2026-05-09", true);
    expect(result).toEqual({
      currentStreak: 8,
      longestStreak: 12,
      isActive: true,
      action: "increment",
    });
  });

  // --- Missed 2+ days ---
  it("resets streak when missed 2 days even with freeze", () => {
    const result = calculateStreak("2026-05-07", "2026-05-10", 10, 15, null, true);
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 15,
      isActive: true,
      action: "reset",
    });
  });

  it("resets streak when missed many days", () => {
    const result = calculateStreak("2026-04-01", "2026-05-10", 30, 30, null, false);
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 30,
      isActive: true,
      action: "reset",
    });
  });

  // --- Edge: first-time user preserves existing longestStreak ---
  it("preserves longestStreak if already higher on first login", () => {
    const result = calculateStreak(null, "2026-05-10", 0, 5, null, false);
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 5,
      isActive: true,
      action: "increment",
    });
  });
});

describe("getLocalDate", () => {
  it("returns a valid YYYY-MM-DD string for a known timezone", () => {
    const date = getLocalDate("America/Sao_Paulo");
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a valid date for UTC", () => {
    const date = getLocalDate("UTC");
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("falls back to UTC for invalid timezone", () => {
    const date = getLocalDate("Invalid/Timezone");
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

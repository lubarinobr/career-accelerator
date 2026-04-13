// S5-08 — Unit tests for difficulty-based XP scoring + power-curve leveling

import { describe, it, expect } from "vitest";

import {
  calculateAnswerXP,
  clampXp,
  calculateLessonBonusXP,
  calculateStreakFreezeCost,
  canAffordStreakFreeze,
  calculateLevel,
} from "./xp";

describe("Difficulty-based XP calculation (S5-01)", () => {
  // Correct answers
  it("awards +5 XP for correct easy answer", () => {
    expect(calculateAnswerXP(true, "easy")).toBe(5);
  });

  it("awards +15 XP for correct medium answer", () => {
    expect(calculateAnswerXP(true, "medium")).toBe(15);
  });

  it("awards +40 XP for correct hard answer", () => {
    expect(calculateAnswerXP(true, "hard")).toBe(40);
  });

  // Wrong answers (negative)
  it("deducts -1 XP for wrong easy answer", () => {
    expect(calculateAnswerXP(false, "easy")).toBe(-1);
  });

  it("deducts -3 XP for wrong medium answer", () => {
    expect(calculateAnswerXP(false, "medium")).toBe(-3);
  });

  it("deducts -8 XP for wrong hard answer", () => {
    expect(calculateAnswerXP(false, "hard")).toBe(-8);
  });
});

describe("XP floor clamping (S5-01)", () => {
  it("clamps to 0 when delta would push below zero", () => {
    expect(clampXp(3, -8)).toBe(0);
  });

  it("applies delta normally when result is positive", () => {
    expect(clampXp(100, -8)).toBe(92);
  });

  it("clamps to 0 when totalXp is 0 and delta is negative", () => {
    expect(clampXp(0, -1)).toBe(0);
  });

  it("allows positive delta from 0", () => {
    expect(clampXp(0, 5)).toBe(5);
  });

  it("handles exact zero result", () => {
    expect(clampXp(8, -8)).toBe(0);
  });
});

describe("Lesson bonus XP", () => {
  it("awards 20 bonus XP for a perfect 5/5 lesson", () => {
    expect(calculateLessonBonusXP(5, 5)).toBe(20);
  });

  it("does not award bonus for 4/5", () => {
    expect(calculateLessonBonusXP(4, 5)).toBe(0);
  });

  it("does not award bonus for 0/5", () => {
    expect(calculateLessonBonusXP(0, 5)).toBe(0);
  });

  it("does not award bonus for a different lesson size", () => {
    expect(calculateLessonBonusXP(3, 3)).toBe(0);
  });
});

describe("Streak freeze cost (S5-04 verification)", () => {
  it("returns 50 as the freeze cost", () => {
    expect(calculateStreakFreezeCost()).toBe(50);
  });

  it("can afford freeze with exactly 50 XP", () => {
    expect(canAffordStreakFreeze(50)).toBe(true);
  });

  it("can afford freeze with more than 50 XP", () => {
    expect(canAffordStreakFreeze(1000)).toBe(true);
  });

  it("cannot afford freeze with 49 XP", () => {
    expect(canAffordStreakFreeze(49)).toBe(false);
  });

  it("cannot afford freeze with 0 XP", () => {
    expect(canAffordStreakFreeze(0)).toBe(false);
  });
});

describe("Power-curve leveling system (S5-03)", () => {
  // Level 1 — Intern (0 XP)
  it("returns level 1 Intern at 0 XP", () => {
    const level = calculateLevel(0);
    expect(level.level).toBe(1);
    expect(level.title).toBe("Intern");
    expect(level.currentXp).toBe(0);
  });

  // Level 2 — Apprentice (50 XP)
  it("returns level 2 Apprentice at 50 XP", () => {
    const level = calculateLevel(50);
    expect(level.level).toBe(2);
    expect(level.title).toBe("Apprentice");
  });

  it("returns level 1 at 49 XP (just before Apprentice)", () => {
    const level = calculateLevel(49);
    expect(level.level).toBe(1);
    expect(level.title).toBe("Intern");
    expect(level.currentXp).toBe(49);
  });

  // Level 3 — Junior (174 XP)
  it("returns level 3 Junior at 174 XP", () => {
    const level = calculateLevel(174);
    expect(level.level).toBe(3);
    expect(level.title).toBe("Junior");
  });

  it("returns level 3 Junior at 175 XP (still within level 3)", () => {
    const level = calculateLevel(175);
    expect(level.level).toBe(3);
    expect(level.title).toBe("Junior");
  });

  // Level 5 — Senior
  it("returns level 5 Senior at 630 XP", () => {
    const level = calculateLevel(630);
    expect(level.level).toBe(5);
    expect(level.title).toBe("Senior");
  });

  // Level 10 — Certified (2858 XP)
  it("returns level 10 Certified at 2858 XP", () => {
    const level = calculateLevel(2858);
    expect(level.level).toBe(10);
    expect(level.title).toBe("Certified");
  });

  // Between-milestone title format
  // Formula: xpForLevel(N) = floor(50 * (N-1)^1.8)
  it("returns 'Certified (Lv. 14)' for level 14", () => {
    const xpNeeded = Math.floor(50 * Math.pow(13, 1.8)); // level 14 = 50*(14-1)^1.8
    const level = calculateLevel(xpNeeded);
    expect(level.level).toBe(14);
    expect(level.title).toBe("Certified (Lv. 14)");
  });

  it("returns 'Certified (Lv. 11)' for level 11", () => {
    const xpNeeded = Math.floor(50 * Math.pow(10, 1.8)); // level 11 = 50*(11-1)^1.8
    const level = calculateLevel(xpNeeded);
    expect(level.level).toBe(11);
    expect(level.title).toBe("Certified (Lv. 11)");
  });

  // Milestone level 25 — AWS Warrior
  it("returns AWS Warrior at level 25", () => {
    const xpNeeded = Math.floor(50 * Math.pow(24, 1.8)); // level 25 = 50*(25-1)^1.8
    const level = calculateLevel(xpNeeded);
    expect(level.level).toBe(25);
    expect(level.title).toBe("AWS Warrior");
  });

  // No level cap — level 200 works
  it("handles level 200 with no cap", () => {
    const xpNeeded = Math.floor(50 * Math.pow(199, 1.8)); // level 200 = 50*(200-1)^1.8
    const level = calculateLevel(xpNeeded);
    expect(level.level).toBe(200);
    expect(level.title).toContain("Grandmaster");
    expect(level.title).toContain("Lv. 200");
  });

  // nextLevelXp shows correct XP needed
  it("returns correct nextLevelXp for level 1", () => {
    const level = calculateLevel(0);
    // nextLevelXp = xpForLevel(2) - xpForLevel(1) = 50 - 0 = 50
    expect(level.nextLevelXp).toBe(50);
  });

  it("returns correct currentXp progress within a level", () => {
    const level = calculateLevel(60);
    expect(level.level).toBe(2);
    expect(level.currentXp).toBe(10); // 60 - 50 = 10
  });

  // Boundary: level 2 to level 3
  it("returns level 2 at 173 XP (boundary test)", () => {
    const level = calculateLevel(173);
    expect(level.level).toBe(2);
    expect(level.title).toBe("Apprentice");
  });
});

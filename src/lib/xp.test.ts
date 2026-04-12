import { describe, it, expect } from "vitest";
import {
  calculateAnswerXP,
  calculateLessonBonusXP,
  calculateStreakFreezeCost,
  canAffordStreakFreeze,
  calculateLevel,
} from "./xp";

describe("XP calculation", () => {
  it("awards 10 XP for a correct answer", () => {
    expect(calculateAnswerXP(true)).toBe(10);
  });

  it("awards 2 XP for a wrong answer", () => {
    expect(calculateAnswerXP(false)).toBe(2);
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

describe("Streak freeze cost", () => {
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

describe("Leveling system", () => {
  it("returns Intern at 0 XP", () => {
    const level = calculateLevel(0);
    expect(level.level).toBe(1);
    expect(level.title).toBe("Intern");
    expect(level.currentXp).toBe(0);
    expect(level.nextLevelXp).toBe(100);
  });

  it("returns Intern at 99 XP (just before Junior)", () => {
    const level = calculateLevel(99);
    expect(level.level).toBe(1);
    expect(level.title).toBe("Intern");
    expect(level.currentXp).toBe(99);
    expect(level.nextLevelXp).toBe(100);
  });

  it("returns Junior at exactly 100 XP", () => {
    const level = calculateLevel(100);
    expect(level.level).toBe(2);
    expect(level.title).toBe("Junior");
    expect(level.currentXp).toBe(0);
    expect(level.nextLevelXp).toBe(200);
  });

  it("returns Mid-level at 300 XP", () => {
    const level = calculateLevel(300);
    expect(level.level).toBe(3);
    expect(level.title).toBe("Mid-level");
    expect(level.currentXp).toBe(0);
    expect(level.nextLevelXp).toBe(300);
  });

  it("returns Senior at 600 XP", () => {
    const level = calculateLevel(600);
    expect(level.level).toBe(4);
    expect(level.title).toBe("Senior");
    expect(level.currentXp).toBe(0);
    expect(level.nextLevelXp).toBe(400);
  });

  it("returns Specialist at 1000 XP", () => {
    const level = calculateLevel(1000);
    expect(level.level).toBe(5);
    expect(level.title).toBe("Specialist");
    expect(level.currentXp).toBe(0);
    expect(level.nextLevelXp).toBe(500);
  });

  it("returns Certified at 1500 XP (max level)", () => {
    const level = calculateLevel(1500);
    expect(level.level).toBe(6);
    expect(level.title).toBe("Certified");
    expect(level.currentXp).toBe(0);
    expect(level.nextLevelXp).toBe(0); // max level
  });

  it("returns Certified at 2000 XP (beyond max)", () => {
    const level = calculateLevel(2000);
    expect(level.level).toBe(6);
    expect(level.title).toBe("Certified");
    expect(level.currentXp).toBe(500);
    expect(level.nextLevelXp).toBe(0);
  });

  it("returns correct progress within a level", () => {
    const level = calculateLevel(450);
    expect(level.level).toBe(3);
    expect(level.title).toBe("Mid-level");
    expect(level.currentXp).toBe(150); // 450 - 300
    expect(level.nextLevelXp).toBe(300); // 600 - 300
  });
});

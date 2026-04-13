// V2-02 — Adaptive Difficulty unit tests

import { describe, it, expect } from "vitest";

import {
  calculateDifficultyDistribution,
  type UserPerformance,
  type DifficultyDistribution,
} from "./adaptive";

/** Helper: create performance data */
function perf(
  easy: [number, number],
  medium: [number, number],
  hard: [number, number],
): UserPerformance {
  return {
    easy: { correct: easy[0], total: easy[1] },
    medium: { correct: medium[0], total: medium[1] },
    hard: { correct: hard[0], total: hard[1] },
  };
}

/** Helper: assert distribution adds up to lesson size */
function assertValidDistribution(dist: DifficultyDistribution, size: number) {
  expect(dist.easy + dist.medium + dist.hard).toBe(size);
  expect(dist.easy).toBeGreaterThanOrEqual(0);
  expect(dist.medium).toBeGreaterThanOrEqual(0);
  expect(dist.hard).toBeGreaterThanOrEqual(0);
}

describe("calculateDifficultyDistribution", () => {
  // --- Default (no history) ---
  it("returns default distribution for new user (no answers)", () => {
    const dist = calculateDifficultyDistribution(perf([0, 0], [0, 0], [0, 0]));
    assertValidDistribution(dist, 5);
    expect(dist.easy).toBe(2);
    expect(dist.medium).toBe(2);
    expect(dist.hard).toBe(1);
  });

  it("returns valid distribution for lesson size 3", () => {
    const dist = calculateDifficultyDistribution(
      perf([0, 0], [0, 0], [0, 0]),
      3,
    );
    assertValidDistribution(dist, 3);
  });

  // --- User crushing it (>85% overall) ---
  it("shifts harder when user has high overall success rate", () => {
    // 90% overall: 9/10 easy, 9/10 medium, 9/10 hard
    const dist = calculateDifficultyDistribution(
      perf([9, 10], [9, 10], [9, 10]),
    );
    assertValidDistribution(dist, 5);
    // Should have more hard questions than default (1)
    expect(dist.hard).toBeGreaterThanOrEqual(2);
  });

  it("goes mostly hard when acing all difficulties", () => {
    // 95%+ on everything
    const dist = calculateDifficultyDistribution(
      perf([10, 10], [10, 10], [10, 10]),
    );
    assertValidDistribution(dist, 5);
    expect(dist.hard).toBeGreaterThanOrEqual(3);
  });

  // --- User struggling (<60% overall) ---
  it("shifts easier when user has low overall success rate", () => {
    // 40% overall
    const dist = calculateDifficultyDistribution(
      perf([3, 10], [2, 10], [1, 10]),
    );
    assertValidDistribution(dist, 5);
    expect(dist.easy).toBeGreaterThanOrEqual(2);
  });

  it("removes hard when user is bombing hard questions", () => {
    // 50% overall but hard rate is <30%
    const dist = calculateDifficultyDistribution(
      perf([8, 10], [5, 10], [2, 10]),
    );
    assertValidDistribution(dist, 5);
    // Hard rate 20% — should reduce hard questions
    expect(dist.hard).toBeLessThanOrEqual(1);
  });

  it("goes mostly easy when struggling with medium too", () => {
    // Very low: easy 50%, medium 30%, hard 10%
    const dist = calculateDifficultyDistribution(
      perf([5, 10], [3, 10], [1, 10]),
    );
    assertValidDistribution(dist, 5);
    expect(dist.easy).toBeGreaterThanOrEqual(3);
  });

  // --- User in flow zone (60-85%) ---
  it("maintains balanced distribution in flow zone", () => {
    // 75% overall
    const dist = calculateDifficultyDistribution(
      perf([8, 10], [7, 10], [7, 10]),
    );
    assertValidDistribution(dist, 5);
    // Should be roughly balanced
    expect(dist.easy).toBeGreaterThanOrEqual(1);
    expect(dist.medium).toBeGreaterThanOrEqual(1);
    expect(dist.hard).toBeGreaterThanOrEqual(1);
  });

  it("adjusts within flow zone when easy rate is very high", () => {
    // 73% overall, but easy is 100%
    const dist = calculateDifficultyDistribution(
      perf([10, 10], [6, 10], [6, 10]),
    );
    assertValidDistribution(dist, 5);
    // Easy rate >85% so should reduce easy
    expect(dist.easy).toBeLessThanOrEqual(1);
  });

  // --- Edge cases ---
  it("handles partial performance data (only easy answered)", () => {
    const dist = calculateDifficultyDistribution(
      perf([8, 10], [0, 0], [0, 0]),
    );
    assertValidDistribution(dist, 5);
  });

  it("handles very small lesson size", () => {
    const dist = calculateDifficultyDistribution(
      perf([5, 10], [5, 10], [5, 10]),
      2,
    );
    assertValidDistribution(dist, 2);
  });

  it("handles large lesson size", () => {
    const dist = calculateDifficultyDistribution(
      perf([5, 10], [5, 10], [5, 10]),
      10,
    );
    assertValidDistribution(dist, 10);
  });

  it("always produces valid distribution regardless of inputs", () => {
    // Fuzz test with various inputs
    const scenarios: [number, number][][] = [
      [[0, 0], [0, 0], [0, 0]],
      [[10, 10], [0, 0], [0, 0]],
      [[0, 10], [0, 10], [0, 10]],
      [[10, 10], [10, 10], [10, 10]],
      [[1, 100], [1, 100], [1, 100]],
      [[5, 5], [5, 5], [5, 5]],
    ];

    for (const [e, m, h] of scenarios) {
      for (const size of [1, 3, 5, 7, 10]) {
        const dist = calculateDifficultyDistribution(
          perf(e as [number, number], m as [number, number], h as [number, number]),
          size,
        );
        assertValidDistribution(dist, size);
      }
    }
  });
});

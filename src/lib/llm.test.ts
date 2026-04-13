// V2-01 — Socratic Feedback level mapping tests

import { describe, it, expect } from "vitest";

import { getFeedbackLevel } from "./feedback-level";

describe("getFeedbackLevel", () => {
  it("returns beginner for level 1", () => {
    expect(getFeedbackLevel(1)).toBe("beginner");
  });

  it("returns beginner for level 3", () => {
    expect(getFeedbackLevel(3)).toBe("beginner");
  });

  it("returns intermediate for level 4", () => {
    expect(getFeedbackLevel(4)).toBe("intermediate");
  });

  it("returns intermediate for level 6", () => {
    expect(getFeedbackLevel(6)).toBe("intermediate");
  });

  it("returns advanced for level 7", () => {
    expect(getFeedbackLevel(7)).toBe("advanced");
  });

  it("returns advanced for level 10", () => {
    expect(getFeedbackLevel(10)).toBe("advanced");
  });

  it("returns advanced for level 50", () => {
    expect(getFeedbackLevel(50)).toBe("advanced");
  });
});

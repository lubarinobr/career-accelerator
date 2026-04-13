import { describe, it, expect, beforeEach, vi } from "vitest";

import { checkRateLimit, resetRateLimitStore } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit("user-1", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.retryAfterSeconds).toBeNull();
  });

  it("tracks remaining count correctly", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user-2", 5, 60_000);
    }
    const result = checkRateLimit("user-2", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("blocks requests at the limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("user-3", 5, 60_000);
    }
    const result = checkRateLimit("user-3", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("resets after window expires", () => {
    vi.useFakeTimers();

    for (let i = 0; i < 5; i++) {
      checkRateLimit("user-4", 5, 60_000);
    }

    // Blocked
    expect(checkRateLimit("user-4", 5, 60_000).allowed).toBe(false);

    // Advance past window
    vi.advanceTimersByTime(60_001);

    // Allowed again
    const result = checkRateLimit("user-4", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("isolates keys from each other", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("user-5", 5, 60_000);
    }
    // user-5 blocked
    expect(checkRateLimit("user-5", 5, 60_000).allowed).toBe(false);
    // different user still allowed
    expect(checkRateLimit("user-6", 5, 60_000).allowed).toBe(true);
  });

  it("returns correct retryAfterSeconds", () => {
    vi.useFakeTimers();

    for (let i = 0; i < 5; i++) {
      checkRateLimit("user-7", 5, 60_000);
    }

    const result = checkRateLimit("user-7", 5, 60_000);
    expect(result.allowed).toBe(false);
    // Retry after should be close to 60 seconds (full window)
    expect(result.retryAfterSeconds).toBe(60);
  });

  it("allows 1 request with limit of 1", () => {
    const first = checkRateLimit("user-8", 1, 60_000);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(0);

    const second = checkRateLimit("user-8", 1, 60_000);
    expect(second.allowed).toBe(false);
  });
});

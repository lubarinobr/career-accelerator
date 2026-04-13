// SEC-01 — In-memory sliding window rate limiter
// Zero dependencies. Keyed by identifier (userId or IP).
// Note: Vercel serverless = stateless. Limits reset on cold start.
// Acceptable for MVP single-region deploy. For v2, use Upstash Redis.

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60s to prevent memory leaks
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number | null;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0]!;
    const retryAfterMs = oldestInWindow + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    retryAfterSeconds: null,
  };
}

// Pre-configured limits per route category
export const RATE_LIMITS = {
  answer: { maxRequests: 30, windowMs: 60_000 },
  quiz: { maxRequests: 20, windowMs: 60_000 },
  streakFreeze: { maxRequests: 5, windowMs: 60_000 },
  auth: { maxRequests: 10, windowMs: 60_000 },
} as const;

// For testing: reset all state
export function resetRateLimitStore() {
  store.clear();
  lastCleanup = Date.now();
}

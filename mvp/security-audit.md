# Security Audit Report

**Date:** 2026-04-12
**Stack:** Supabase, Vercel (Next.js), Anthropic AI
**Auditor:** Senior Software Engineer (Security Review)

---

## Summary

| Priority | Issue | Severity | Effort |
|----------|-------|----------|--------|
| Now | Rotate Supabase password + Anthropic key | CRITICAL | 15 min |
| ~~Now~~ | ~~Enable RLS on all tables~~ | ~~HIGH~~ | **DONE** (2026-04-12) |
| ~~This week~~ | ~~Add security headers~~ | ~~HIGH~~ | **DONE** (2026-04-12) |
| ~~This week~~ | ~~Guard `llm.ts` from client import~~ | ~~HIGH~~ | **DONE** (2026-04-12) |
| Soon | Rate limiting on API routes | MEDIUM | 2-3 hrs |
| ~~Soon~~ | ~~Input validation (timezone, request bodies)~~ | ~~MEDIUM~~ | **DONE** (2026-04-12) |
| Soon | Security logging | MEDIUM | 1-2 hrs |
| Soon | `npm audit fix` | MODERATE | 15 min |
| ~~Backlog~~ | ~~Auth config hardening~~ | ~~LOW~~ | **DONE** (2026-04-12) |
| ~~Backlog~~ | ~~Add `vercel.json`~~ | ~~LOW~~ | **DONE** (2026-04-12) |

---

## CRITICAL

### 1. Exposed Secrets in `.env.local`

**File:** `.env.local`
**Risk:** Plaintext database credentials (Supabase PostgreSQL) and Anthropic API key stored on disk. If the developer machine or file is compromised, all backend systems are fully accessible.

**Status:** `.env.local` is correctly in `.gitignore`, but secrets should still be rotated as a precaution.

**Action:**
- Rotate the Supabase database password immediately
- Regenerate the Anthropic API key immediately
- Use Vercel Environment Variables (encrypted at rest) for production
- Verify secrets were never committed: `git log -p -- .env.local`
- Consider using a secrets manager (e.g., Doppler, Vault) for team environments

---

## HIGH

### 2. No Row-Level Security (RLS) on Supabase

**File:** `prisma/migrations/20260412201226_init/migration.sql`
**Risk:** Zero RLS policies exist. Anyone with the database connection string can read/write any user's data (answers, streaks, XP, daily activity). This bypasses all application-level auth checks entirely.

**Action:** Create a new Prisma migration enabling RLS on every table:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Example policies (adapt auth method to your setup)
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "user_answers_select_own" ON user_answers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "daily_activity_select_own" ON daily_activity
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "streaks_select_own" ON streaks
  FOR SELECT USING (user_id = auth.uid());

-- Repeat for INSERT, UPDATE, DELETE as needed
```

---

### 3. Missing Security Headers

**File:** `next.config.ts`
**Risk:** No CSP, X-Frame-Options, HSTS, or X-Content-Type-Options configured. Leaves the app open to clickjacking, MIME sniffing, and XSS attacks.

**Action:** Add a `headers()` function to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ...existing config
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};
```

---

### 4. Anthropic API Key Exposure Risk

**File:** `src/lib/llm.ts` (Line 23)
**Risk:** The LLM client is in a shared `src/lib/` module. Currently only imported server-side, but no guard prevents accidental client-side import, which would leak the API key to browsers.

**Action (choose one):**
- Add `"use server"` directive at the top of `src/lib/llm.ts`
- Rename file to `llm.server.ts` (Next.js convention preventing client bundling)

---

## MEDIUM

### 5. No Rate Limiting on API Endpoints

**Files:** All routes under `src/app/api/`
**Risk:** All endpoints lack rate limiting. An attacker could:
- Drain Anthropic API credits by spamming `/api/answer`
- DoS Supabase by hammering `/api/user` or `/api/quiz`
- Exploit `/api/streak-freeze/buy` (financial transaction via XP deduction)

**Action:** Implement rate limiting using Vercel KV + Upstash or middleware:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

// In each API route:
const { success } = await ratelimit.limit(session.user.id);
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

---

### 6. Unvalidated `X-Timezone` Header

**Files:** `src/app/api/user/route.ts:41`, `src/app/api/answer/route.ts:24`
**Risk:** Timezone header is extracted without validation. If ever logged or displayed, it could become an XSS vector.

**Current code:**
```typescript
const timezone = request.headers.get("x-timezone") || "UTC";
```

**Action:** Validate against known timezones:
```typescript
const VALID_TIMEZONES = Intl.supportedValuesOf("timeZone");
const rawTimezone = request.headers.get("x-timezone") || "UTC";
const timezone = VALID_TIMEZONES.includes(rawTimezone) ? rawTimezone : "UTC";
```

---

### 7. No Security Event Logging

**Files:** All routes under `src/app/api/`
**Risk:** Failed auth attempts, unauthorized access, and suspicious patterns are silently dropped. Zero visibility into active attacks.

**Action:** Add structured logging on auth failures and 4xx/5xx responses:

```typescript
if (!session?.user?.id) {
  console.warn(`[SECURITY] Unauthorized access attempt`, {
    endpoint: "/api/answer",
    ip: request.headers.get("x-forwarded-for"),
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Consider integrating with Vercel Log Drains or a service like Datadog/Sentry for alerting.

---

### 8. Vulnerable Dependencies

**Source:** `npm audit`
**Risk:** `@hono/node-server <1.19.13` has a moderate vulnerability (middleware bypass via repeated slashes), pulled in transitively by Prisma.

**Action:**
```bash
npm audit fix
```

Add `npm audit --audit-level=moderate` to CI/CD pipeline to catch future issues.

---

## LOW

### 9. Auth Config Hardening

**File:** `src/lib/auth.ts`
**Issues:**
- No explicit `secure: true` and `sameSite: "strict"` cookie settings for production
- Google OAuth credentials use `!` non-null assertions with no runtime validation
- No token expiration handling beyond NextAuth defaults

**Action:**
- Add explicit cookie configuration in NextAuth options:
  ```typescript
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  ```
- Validate env vars at startup:
  ```typescript
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth credentials");
  }
  ```

---

### 10. Missing `vercel.json`

**Risk:** No explicit function timeout, region pinning, or env scoping configured. Defaults may not match security requirements.

**Action:** Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## Additional Recommendations

### CSRF Protection
- NextAuth handles CSRF internally with session-based tokens, but consider adding explicit `SameSite=Strict` cookie attributes
- Document CSRF strategy in codebase

### Request Body Validation
- Add Zod schema validation to all POST endpoints
- Add request size limits in middleware or Vercel config

### API Documentation
- Document expected request/response schemas, auth requirements, rate limits, and error codes
- Consider OpenAPI/Swagger for structured documentation

### Supabase-Specific
- Review Supabase Dashboard for any publicly exposed APIs
- Ensure `anon` key is only used for public operations
- Confirm `service_role` key is never exposed client-side

### Monitoring
- Set up Vercel Analytics for traffic anomaly detection
- Configure Supabase alerts for unusual database activity
- Set Anthropic API usage alerts to detect credit drain attacks

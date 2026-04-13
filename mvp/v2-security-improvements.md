# v2 Security Improvements — Post-MVP Backlog

Items that go beyond MVP-level hardening. Prioritized by impact.

---

## Rate Limiting

| Improvement | Why | How |
|-------------|-----|-----|
| Replace in-memory store with Upstash Redis | In-memory resets on cold start — attacker just waits for new instance | `@upstash/ratelimit` + Vercel KV or Upstash Redis. ~10 lines to swap. Free tier covers MVP traffic |
| Add global rate limit in middleware | Current limits are per-route. No protection against distributed abuse across routes | Single sliding window check in `middleware.ts` before route dispatch (e.g. 100 req/min per IP) |
| Add progressive penalties | Repeated offenders get longer blocks | Track violation count per key, double window on each consecutive 429 |

## Authentication & Sessions

| Improvement | Why | How |
|-------------|-----|-----|
| Token blocklist for forced logout | JWT can't be revoked server-side. Stolen token valid until expiry | Store revoked JTI (JWT ID) in Redis/KV. Check on each request. Small set, fast lookup |
| Refresh token rotation | Single long-lived token = single point of compromise | Short-lived access token (15 min) + refresh token (7 days). NextAuth supports this via `jwt` callback |
| Account linking protection | User could have multiple accounts if email changes on Google side | Check email uniqueness on sign-in, merge accounts if needed |

## Input Validation

| Improvement | Why | How |
|-------------|-----|-----|
| Replace custom validators with Zod schemas | Zod already in `package.json` but unused. Schema validation is more robust and self-documenting | Define `AnswerRequestSchema`, `QuizResponseSchema`, etc. Parse at route entry |
| Add request body size limits | Large payloads can cause memory issues | `export const config = { api: { bodyParser: { sizeLimit: '1mb' } } }` per route or in `next.config.ts` |

## Database

| Improvement | Why | How |
|-------------|-----|-----|
| Create non-root DB user | App uses `postgres` (service_role) — bypasses RLS | Create `app_user` role in Supabase with minimal privileges. Update `DATABASE_URL` |
| Connection pool tuning | Default pg.Pool settings (max: 10) may not match Vercel concurrency | Set `max`, `min`, `idleTimeoutMillis`, `connectionTimeoutMillis` based on production metrics |
| Query timeout | Slow queries can hold connections and block others | Add `statement_timeout` to pool config (e.g. 10s) |

## Monitoring & Logging

| Improvement | Why | How |
|-------------|-----|-----|
| Structured security logging | No visibility into 429s, auth failures, or suspicious patterns | Log rate limit hits, failed auth attempts, unusual access patterns to a structured logger (e.g. Axiom, Datadog) |
| Error tracking (Sentry) | LLM failures and unexpected errors are silent in production | Add `@sentry/nextjs`. Captures unhandled exceptions + performance data |
| Security alerts | No notification when something goes wrong | Webhook on repeated 429s or auth failures → Slack/PagerDuty |

## Infrastructure

| Improvement | Why | How |
|-------------|-----|-----|
| CSP (Content Security Policy) header | Missing from current security headers. Prevents XSS via inline scripts | Add `Content-Security-Policy` to `next.config.ts` headers. Start with report-only mode |
| Dependency auto-updates | npm vulnerabilities accumulate silently | Enable Dependabot or Renovate on the GitHub repo. Auto-PR for security patches |
| Pre-commit secret scanning | `.env.local` is gitignored but accidents happen | Add `gitleaks` or `trufflehog` as pre-commit hook |
| Staging environment | No staging = deploy to prod blind | Create Vercel preview environment with separate Supabase project |

// TODO: S2-01 — Batch question generation script (Sprint 2)
// - Calls Claude API to generate AWS Cloud Practitioner questions
// - Covers 4 domains x 3 difficulties = 12 batches
// - Validates output against questions schema (JSON)
// - Inserts into Supabase via Prisma
//
// Usage: npx tsx scripts/generate-questions.ts

// SP2-01 — Batch question generation script
// Generates AWS CLF-C02 questions using Claude API and inserts into Supabase via Prisma
// Usage: npx tsx scripts/generate-questions.ts
// Optional: npx tsx scripts/generate-questions.ts --domain "Cloud Concepts" --difficulty easy --count 10

import Anthropic from "@anthropic-ai/sdk";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Pool } from "pg";
import { z } from "zod/v4";

import {
  DOMAINS,
  DIFFICULTIES,
  type Domain,
  type Difficulty,
  buildQuestionPrompt,
  getQuestionCount,
} from "./prompts/question-prompts";

dotenv.config({ path: ".env.local" });

// --- Prisma client (standalone, per Tech Lead D1-S2-Q10) ---
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// --- Anthropic client ---
const anthropic = new Anthropic();
const MODEL = "claude-sonnet-4-6";
const BATCH_SIZE = 10;

// --- Zod validation schema (per Tech Lead D1-S2-Q2) ---
const QuestionSchema = z.object({
  questionText: z.string().min(10),
  options: z
    .array(
      z.object({
        key: z.enum(["A", "B", "C", "D"]),
        text: z.string().min(1),
      }),
    )
    .length(4),
  correctOption: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(10),
});

const QuestionsArraySchema = z.array(QuestionSchema);

// --- Stats tracking ---
const stats = {
  generated: 0,
  inserted: 0,
  failed: 0,
  validationErrors: 0,
};

async function generateBatch(
  domain: Domain,
  difficulty: Difficulty,
  count: number,
  topic?: string,
): Promise<z.infer<typeof QuestionSchema>[]> {
  const prompt = buildQuestionPrompt(domain, difficulty, count, topic);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON — handle cases where model wraps in markdown fences
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error(
      `No JSON array found in response for ${domain}/${difficulty}`,
    );
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = QuestionsArraySchema.parse(parsed);
  return validated;
}

async function insertQuestions(
  questions: z.infer<typeof QuestionSchema>[],
  domain: Domain,
  difficulty: Difficulty,
): Promise<number> {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({
      data: {
        domain,
        difficulty,
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
      },
    });
    count++;
  }
  return count;
}

async function generateForDomainDifficulty(
  domain: Domain,
  difficulty: Difficulty,
  targetCount: number,
  topic?: string,
) {
  const label = topic
    ? `${domain} / ${difficulty} / ${topic}`
    : `${domain} / ${difficulty}`;
  console.log(`\n--- ${label} (target: ${targetCount}) ---`);

  let remaining = targetCount;
  let batchNum = 0;

  while (remaining > 0) {
    const batchCount = Math.min(BATCH_SIZE, remaining);
    batchNum++;

    try {
      console.log(`  Batch ${batchNum}: generating ${batchCount} questions...`);
      const questions = await generateBatch(domain, difficulty, batchCount, topic);
      stats.generated += questions.length;

      const inserted = await insertQuestions(questions, domain, difficulty);
      stats.inserted += inserted;
      remaining -= inserted;
      console.log(
        `  Batch ${batchNum}: ✓ ${inserted} inserted (${remaining} remaining)`,
      );
    } catch (error) {
      stats.failed++;
      if (error instanceof z.ZodError) {
        stats.validationErrors++;
        console.error(
          `  Batch ${batchNum}: ✗ validation error:`,
          error.issues[0]?.message,
        );
      } else if (error instanceof SyntaxError) {
        stats.validationErrors++;
        console.error(`  Batch ${batchNum}: ✗ JSON parse error`);
      } else {
        console.error(
          `  Batch ${batchNum}: ✗ error:`,
          error instanceof Error ? error.message : error,
        );
      }
      // Retry logic: continue to next batch, remaining stays the same
      // After 3 consecutive failures for the same domain/difficulty, skip
      if (stats.failed >= 3) {
        console.error(
          `  Skipping remaining ${remaining} for ${domain}/${difficulty} after 3 failures`,
        );
        break;
      }
    }
  }
}

async function main() {
  // Parse CLI args for targeted generation
  const args = process.argv.slice(2);
  const domainArg = getArg(args, "--domain");
  const difficultyArg = getArg(args, "--difficulty") as Difficulty | undefined;
  const countArg = getArg(args, "--count");
  const topicArg = getArg(args, "--topic");

  console.log("=== Career Accelerator — Question Generator ===");
  console.log(`Model: ${MODEL}`);
  console.log(`Batch size: ${BATCH_SIZE}`);

  if (domainArg && difficultyArg && countArg) {
    // Targeted generation
    const topicLabel = topicArg ? ` / topic: ${topicArg}` : "";
    console.log(`\nTargeted: ${domainArg} / ${difficultyArg} x ${countArg}${topicLabel}`);
    await generateForDomainDifficulty(
      domainArg as Domain,
      difficultyArg,
      parseInt(countArg),
      topicArg,
    );
  } else {
    // Full generation: weighted distribution
    console.log(
      "\nFull generation: 600 questions (weighted CLF-C02 distribution)",
    );
    for (const domain of DOMAINS) {
      for (const difficulty of DIFFICULTIES) {
        const count = getQuestionCount(domain, difficulty);
        await generateForDomainDifficulty(domain, difficulty, count);
        stats.failed = 0; // Reset per-combination failure counter
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Generated: ${stats.generated}`);
  console.log(`Inserted:  ${stats.inserted}`);
  console.log(`Failed batches: ${stats.failed}`);
  console.log(`Validation errors: ${stats.validationErrors}`);

  await prisma.$disconnect();
  await pool.end();
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

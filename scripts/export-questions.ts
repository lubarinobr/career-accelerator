// SP2-13 — CSV export for question quality review
// Exports all questions from DB to data/questions-export.csv for CEO spot-check
// Usage: npx tsx scripts/export-questions.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function main() {
  console.log("Exporting questions to CSV...");

  const questions = await prisma.question.findMany({
    orderBy: [{ domain: "asc" }, { difficulty: "asc" }, { createdAt: "asc" }],
  });

  console.log(`Found ${questions.length} questions`);

  const header = [
    "id",
    "domain",
    "difficulty",
    "questionText",
    "optionA",
    "optionB",
    "optionC",
    "optionD",
    "correctOption",
    "explanation",
  ].join(",");

  const rows = questions.map((q) => {
    const options = q.options as { key: string; text: string }[];
    const optionMap: Record<string, string> = {};
    for (const opt of options) {
      optionMap[opt.key] = opt.text;
    }

    return [
      q.id,
      escapeCsv(q.domain),
      q.difficulty,
      escapeCsv(q.questionText),
      escapeCsv(optionMap["A"] ?? ""),
      escapeCsv(optionMap["B"] ?? ""),
      escapeCsv(optionMap["C"] ?? ""),
      escapeCsv(optionMap["D"] ?? ""),
      q.correctOption,
      escapeCsv(q.explanation),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  const outDir = join(process.cwd(), "data");
  mkdirSync(outDir, { recursive: true });

  const outPath = join(outDir, "questions-export.csv");
  writeFileSync(outPath, csv, "utf-8");

  console.log(`Exported ${questions.length} questions to ${outPath}`);

  // Print distribution summary
  const dist: Record<string, Record<string, number>> = {};
  for (const q of questions) {
    if (!dist[q.domain]) dist[q.domain] = {};
    dist[q.domain][q.difficulty] = (dist[q.domain][q.difficulty] ?? 0) + 1;
  }

  console.log("\nDistribution:");
  for (const [domain, diffs] of Object.entries(dist)) {
    const total = Object.values(diffs).reduce((a, b) => a + b, 0);
    console.log(`  ${domain}: ${total} (easy: ${diffs["easy"] ?? 0}, medium: ${diffs["medium"] ?? 0}, hard: ${diffs["hard"] ?? 0})`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

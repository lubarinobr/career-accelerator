import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const tables = await prisma.$queryRawUnsafe<
    { schemaname: string; tablename: string; rowsecurity: boolean }[]
  >(
    "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
  );
  console.log("TABLES:");
  console.table(tables);

  const pols = await prisma.$queryRawUnsafe<
    { tablename: string; policyname: string }[]
  >(
    "SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;"
  );
  console.log("POLICIES:");
  console.table(pols);

  await prisma.$disconnect();
  await pool.end();
}

main();

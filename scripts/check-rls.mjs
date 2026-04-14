import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const rows = await prisma.$queryRawUnsafe(
  "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
);
console.log("TABLES:");
console.table(rows);
const pols = await prisma.$queryRawUnsafe(
  "SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;"
);
console.log("POLICIES:");
console.table(pols);
await prisma.$disconnect();

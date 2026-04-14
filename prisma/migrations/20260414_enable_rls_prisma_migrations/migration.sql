-- Enable RLS on Prisma's internal migrations tracking table.
-- Supabase flagged `public._prisma_migrations` as rls_disabled_in_public on 2026-04-13.
-- The postgres role (Prisma's connection) owns the table and bypasses RLS,
-- so migrations continue to work. Non-owner roles (anon, authenticated) get deny-all.

ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "_prisma_migrations_no_select" ON "_prisma_migrations"
  FOR SELECT USING (false);
CREATE POLICY "_prisma_migrations_no_insert" ON "_prisma_migrations"
  FOR INSERT WITH CHECK (false);
CREATE POLICY "_prisma_migrations_no_update" ON "_prisma_migrations"
  FOR UPDATE USING (false);
CREATE POLICY "_prisma_migrations_no_delete" ON "_prisma_migrations"
  FOR DELETE USING (false);

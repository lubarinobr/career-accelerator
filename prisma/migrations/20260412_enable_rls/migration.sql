-- Enable Row Level Security on all tables
-- Our app uses Prisma with the postgres (service_role) connection,
-- which bypasses RLS by default. Enabling RLS protects against:
--   1. Supabase REST API (anon key) access from browsers
--   2. Any other role that isn't the table owner
--   3. Accidental exposure if Supabase anon key leaks

-- Enable RLS on all 5 tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- The postgres role (our Prisma connection) is the table owner,
-- so it bypasses RLS automatically. These policies are for any
-- NON-owner role (e.g., Supabase anon, authenticated, or custom roles).

-- QUESTIONS table: read-only for everyone (public quiz content)
CREATE POLICY "questions_select_all" ON questions
  FOR SELECT USING (true);

-- Block all other operations on questions from non-owner roles
CREATE POLICY "questions_no_insert" ON questions
  FOR INSERT WITH CHECK (false);
CREATE POLICY "questions_no_update" ON questions
  FOR UPDATE USING (false);
CREATE POLICY "questions_no_delete" ON questions
  FOR DELETE USING (false);

-- USERS table: users can only read their own row
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (false);
CREATE POLICY "users_no_insert" ON users
  FOR INSERT WITH CHECK (false);
CREATE POLICY "users_no_update" ON users
  FOR UPDATE USING (false);
CREATE POLICY "users_no_delete" ON users
  FOR DELETE USING (false);

-- USER_ANSWERS table: no access from non-owner roles
CREATE POLICY "user_answers_no_select" ON user_answers
  FOR SELECT USING (false);
CREATE POLICY "user_answers_no_insert" ON user_answers
  FOR INSERT WITH CHECK (false);
CREATE POLICY "user_answers_no_update" ON user_answers
  FOR UPDATE USING (false);
CREATE POLICY "user_answers_no_delete" ON user_answers
  FOR DELETE USING (false);

-- DAILY_ACTIVITY table: no access from non-owner roles
CREATE POLICY "daily_activity_no_select" ON daily_activity
  FOR SELECT USING (false);
CREATE POLICY "daily_activity_no_insert" ON daily_activity
  FOR INSERT WITH CHECK (false);
CREATE POLICY "daily_activity_no_update" ON daily_activity
  FOR UPDATE USING (false);
CREATE POLICY "daily_activity_no_delete" ON daily_activity
  FOR DELETE USING (false);

-- STREAKS table: no access from non-owner roles
CREATE POLICY "streaks_no_select" ON streaks
  FOR SELECT USING (false);
CREATE POLICY "streaks_no_insert" ON streaks
  FOR INSERT WITH CHECK (false);
CREATE POLICY "streaks_no_update" ON streaks
  FOR UPDATE USING (false);
CREATE POLICY "streaks_no_delete" ON streaks
  FOR DELETE USING (false);

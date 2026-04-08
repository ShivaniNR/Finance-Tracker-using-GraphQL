-- =====================================================
-- Migration 002: Row-Level Security policies
-- Every table is locked down — users can only access their own data
-- =====================================================


-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- profiles: users can only read/update their own profile
-- (INSERT handled by trigger, not client)
-- =====================================================
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- =====================================================
-- categories: users see own categories + system defaults
-- can only create/modify their own
-- =====================================================
CREATE POLICY "Users read own and system categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id OR is_system = true);

CREATE POLICY "Users create own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id AND is_system = false)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);


-- =====================================================
-- transactions: users can only CRUD their own transactions
-- =====================================================
CREATE POLICY "Users read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================
-- audit_log: read-only for users (writes happen via trigger)
-- =====================================================
CREATE POLICY "Users read own audit log"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

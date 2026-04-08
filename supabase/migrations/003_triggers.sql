-- =====================================================
-- Migration 003: Triggers and auto-functions
-- =====================================================


-- =====================================================
-- TRIGGER 1: Auto-create profile when user signs up
-- Fires after Supabase Auth creates a new user
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'first_name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =====================================================
-- TRIGGER 2: Seed default categories for new user
-- Fires after profile is created
-- =====================================================
CREATE OR REPLACE FUNCTION seed_user_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, icon, color, is_system) VALUES
    (NEW.id, 'Salary',         'INCOME',  '💰', '#10B981', true),
    (NEW.id, 'Freelance',      'INCOME',  '💻', '#3B82F6', true),
    (NEW.id, 'Investment',     'INCOME',  '📈', '#8B5CF6', true),
    (NEW.id, 'Groceries',      'EXPENSE', '🛒', '#EF4444', true),
    (NEW.id, 'Food & Dining',  'EXPENSE', '🍕', '#F97316', true),
    (NEW.id, 'Transport',      'EXPENSE', '🚗', '#F59E0B', true),
    (NEW.id, 'Entertainment',  'EXPENSE', '🎬', '#EC4899', true),
    (NEW.id, 'Shopping',       'EXPENSE', '🛍️', '#6366F1', true),
    (NEW.id, 'Utilities',      'EXPENSE', '💡', '#14B8A6', true),
    (NEW.id, 'Health',         'EXPENSE', '🏥', '#06B6D4', true),
    (NEW.id, 'Education',      'EXPENSE', '📚', '#84CC16', true),
    (NEW.id, 'Rent',           'EXPENSE', '🏠', '#D946EF', true),
    (NEW.id, 'Other',          'BOTH',    '📌', '#6B7280', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION seed_user_categories();


-- =====================================================
-- TRIGGER 3: Audit log — auto-log every transaction change
-- Records INSERT, UPDATE, DELETE with old/new data as JSONB
-- =====================================================
CREATE OR REPLACE FUNCTION log_transaction_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER transaction_audit
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION log_transaction_change();


-- =====================================================
-- TRIGGER 4: Auto-update updated_at timestamp
-- Applies to profiles and transactions
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

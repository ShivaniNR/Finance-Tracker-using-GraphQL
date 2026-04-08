-- =====================================================
-- Migration 001: Create core tables
-- Finance Tracker — V1.0 schema
-- =====================================================


-- =====================================================
-- TABLE 1: profiles
-- Extends Supabase auth.users with app-specific fields
-- =====================================================
CREATE TABLE profiles (
  id             UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name     TEXT        NOT NULL,
  last_name      TEXT,
  display_name   TEXT        NOT NULL,
  currency       TEXT        DEFAULT 'INR',
  monthly_budget NUMERIC(12,2),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);


-- =====================================================
-- TABLE 2: categories
-- User-defined + system default transaction categories
-- =====================================================
CREATE TABLE categories (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name        TEXT        NOT NULL,
  type        TEXT        DEFAULT 'BOTH' CHECK (type IN ('INCOME', 'EXPENSE', 'BOTH')),
  icon        TEXT,
  color       TEXT,
  is_system   BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_category_per_user UNIQUE(user_id, name)
);

CREATE INDEX idx_categories_user ON categories(user_id);


-- =====================================================
-- TABLE 3: transactions
-- Core financial data — every income/expense record
-- =====================================================
CREATE TABLE transactions (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id     UUID        REFERENCES categories(id) ON DELETE SET NULL,
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  type            TEXT        NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  description     TEXT        NOT NULL,
  date            DATE        NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  receipt_url     TEXT,
  is_recurring    BOOLEAN     DEFAULT false,
  ai_categorized  BOOLEAN     DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_date_type ON transactions(user_id, date, type);


-- =====================================================
-- TABLE 4: audit_log
-- Immutable record of every financial data change
-- =====================================================
CREATE TABLE audit_log (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name  TEXT        NOT NULL,
  record_id   UUID        NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_record ON audit_log(record_id);

-- ============================================================
-- Verdant Estates — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- 1. LISTINGS
CREATE TABLE IF NOT EXISTS listings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price BIGINT NOT NULL,
  address TEXT NOT NULL,
  coords JSONB DEFAULT '[]',
  beds INT NOT NULL DEFAULT 1,
  baths INT NOT NULL DEFAULT 1,
  area NUMERIC NOT NULL DEFAULT 0,
  year_built INT,
  image TEXT DEFAULT '',
  images JSONB DEFAULT '[]',
  floor_plan TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  features JSONB DEFAULT '[]',
  agent JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- users table for JWT auth
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENQUIRIES
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  message TEXT DEFAULT '',
  property_id BIGINT REFERENCES listings(id) ON DELETE SET NULL,
  property_name TEXT DEFAULT '',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SAVED HOMES
CREATE TABLE IF NOT EXISTS saved_homes (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  property_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- 4. ALERTS
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  filters JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_beds ON listings(beds);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_saved_homes_user ON saved_homes(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_email ON alerts(email);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 6. Updated_at trigger (auto-set on update)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS enquiries_updated_at ON enquiries;
CREATE TRIGGER enquiries_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Row Level Security (RLS)
-- Service role key bypasses RLS by design, so these permissive policies
-- allow full access via the backend. If you add Supabase Auth later,
-- tighten these policies to restrict user-facing queries.
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permissive policies (service_role bypasses RLS, these are for documentation)
DROP POLICY IF EXISTS "Service role full access" ON listings;
CREATE POLICY "Service role full access" ON listings FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role full access" ON enquiries;
CREATE POLICY "Service role full access" ON enquiries FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role full access" ON saved_homes;
CREATE POLICY "Service role full access" ON saved_homes FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role full access" ON alerts;
CREATE POLICY "Service role full access" ON alerts FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role full access" ON users;
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);

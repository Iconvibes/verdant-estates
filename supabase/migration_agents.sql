-- ═══════════════════════════════════════════════════════════════
-- VERDANT ESTATES — Migration: Agent System + Approval Workflow
-- ═══════════════════════════════════════════════════════════════
-- Run this ONCE in Supabase SQL Editor after the original
-- migration.sql has already been run.
-- ═══════════════════════════════════════════════════════════════

-- 1. Add property_name to enquiries table
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS property_name TEXT;

-- 2. Add agent_id and status columns to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES auth.users(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('pending', 'published', 'rejected'));

-- 3. Create agents profile table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- Agents RLS policies
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Agents are publicly readable" ON agents;
CREATE POLICY "Agents are publicly readable"
  ON agents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Agents can insert own profile" ON agents;
CREATE POLICY "Agents can insert own profile"
  ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Agents can update own profile" ON agents;
CREATE POLICY "Agents can update own profile"
  ON agents FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Admin_users RLS policies
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Admins can view own record" ON admin_users;
CREATE POLICY "Admins can view own record"
  ON admin_users FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Listings policies: drop old, recreate with status filter
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Listings are publicly readable" ON listings;
CREATE POLICY "Listings are publicly readable"
  ON listings FOR SELECT
  USING (status = 'published' OR status IS NULL);

DROP POLICY IF EXISTS "Authenticated users can insert listings" ON listings;
CREATE POLICY "Authenticated users can insert listings"
  ON listings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update listings" ON listings;
CREATE POLICY "Authenticated users can update listings"
  ON listings FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete listings" ON listings;
CREATE POLICY "Authenticated users can delete listings"
  ON listings FOR DELETE
  USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════
-- Auto-add existing admin user to admin_users table
-- This finds admin@verdantestates.ng and inserts them
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  admin_uid UUID;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@verdantestates.ng';
  IF admin_uid IS NOT NULL THEN
    INSERT INTO admin_users (user_id) VALUES (admin_uid)
      ON CONFLICT (user_id) DO NOTHING;
    RAISE NOTICE 'Admin user added successfully (ID: %)', admin_uid;
  ELSE
    RAISE NOTICE 'No user found with email admin@verdantestates.ng — add manually later';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Indexes for performance
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_agent_id ON listings(agent_id);

-- 6. Add view_count to listings for performance tracking
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_listings_view_count ON listings(view_count DESC);

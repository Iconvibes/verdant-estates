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

-- 7. RPC function for atomic view counting
CREATE OR REPLACE FUNCTION increment_view_count(p_listing_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE listings SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- 8. Supabase Storage bucket for agent profile photos
-- ═══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('agent-photos', 'agent-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "Agent photos are publicly readable" ON storage.objects;
CREATE POLICY "Agent photos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agent-photos');

DROP POLICY IF EXISTS "Authenticated users can upload agent photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload agent photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'agent-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own agent photos" ON storage.objects;
CREATE POLICY "Users can update own agent photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'agent-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own agent photos" ON storage.objects;
CREATE POLICY "Users can delete own agent photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'agent-photos' AND auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════
-- 9. Agent approval workflow
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE agents ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_agents_approved ON agents(approved);

-- ═══════════════════════════════════════════════════════════════
-- 10. Supabase Storage bucket for listing photos
-- ═══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('listing-photos', 'listing-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Listing photos are publicly readable" ON storage.objects;
CREATE POLICY "Listing photos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

DROP POLICY IF EXISTS "Authenticated users can upload listing photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete listing photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete listing photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');
-- ═══════════════════════════════════════════════════════════════
-- 11. Team Members (admin-managed profiles for /agents page)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Sales Partner',
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  bio TEXT,
  specialties JSONB DEFAULT '[]',
  experience INT DEFAULT 0,
  languages JSONB DEFAULT '["English"]',
  certifications JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members are publicly readable" ON team_members;
CREATE POLICY "Team members are publicly readable"
  ON team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage team members" ON team_members;
CREATE POLICY "Authenticated users can manage team members"
  ON team_members FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_team_members_sort ON team_members(sort_order);

-- ═══════════════════════════════════════════════════════════════
-- 12. Assign listings to team members
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE listings ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES team_members(id);
CREATE INDEX IF NOT EXISTS idx_listings_team_member ON listings(team_member_id);

-- ═══════════════════════════════════════════════════════════════
-- 13. Route enquiries to assigned team member
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES team_members(id);
CREATE INDEX IF NOT EXISTS idx_enquiries_team_member ON enquiries(team_member_id);

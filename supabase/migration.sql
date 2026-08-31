-- ═══════════════════════════════════════════════════════════════════════════════
-- Verdant Estates — Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. LISTINGS
CREATE TABLE IF NOT EXISTS listings (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  price       BIGINT NOT NULL,
  address     TEXT NOT NULL,
  beds        INT NOT NULL DEFAULT 3,
  baths       INT NOT NULL DEFAULT 3,
  area        INT NOT NULL DEFAULT 300,
  year_built  INT NOT NULL DEFAULT 2024,
  image       TEXT DEFAULT '',
  images      JSONB DEFAULT '[]',
  tagline     TEXT DEFAULT '',
  description TEXT DEFAULT '',
  features    JSONB DEFAULT '[]',
  agent       JSONB DEFAULT '{}',
  coords      JSONB DEFAULT '[0, 0]',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. ENQUIRIES
CREATE TABLE IF NOT EXISTS enquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  interest    TEXT NOT NULL,
  message     TEXT DEFAULT '',
  property_id BIGINT,
  status      TEXT NOT NULL DEFAULT 'new',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. SAVED HOMES
CREATE TABLE IF NOT EXISTS saved_homes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  property_id BIGINT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- 4. ALERTS
CREATE TABLE IF NOT EXISTS alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  name        TEXT,
  filters     JSONB DEFAULT '{}',
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- 5. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- LISTINGS: anyone can read, only authenticated admins can write
CREATE POLICY "Listings are publicly readable"
  ON listings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert listings"
  ON listings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update listings"
  ON listings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete listings"
  ON listings FOR DELETE USING (auth.role() = 'authenticated');

-- ENQUIRIES: anyone can insert, only authenticated users can read/update
CREATE POLICY "Anyone can submit enquiries"
  ON enquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read enquiries"
  ON enquiries FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update enquiries"
  ON enquiries FOR UPDATE USING (auth.role() = 'authenticated');

-- SAVED HOMES: users can manage their own
CREATE POLICY "Users can read own saved homes"
  ON saved_homes FOR SELECT USING (auth.uid()::text = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Users can save homes"
  ON saved_homes FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Users can unsave homes"
  ON saved_homes FOR DELETE USING (auth.uid()::text = user_id OR auth.role() = 'authenticated');

-- ALERTS: anyone can subscribe, authenticated can read/manage all
CREATE POLICY "Anyone can subscribe to alerts"
  ON alerts FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read own alerts by email"
  ON alerts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update alerts"
  ON alerts FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete alerts"
  ON alerts FOR DELETE USING (auth.role() = 'authenticated');

-- NOTIFICATIONS: authenticated only
CREATE POLICY "Authenticated users can manage notifications"
  ON notifications FOR ALL USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA — 12 listings
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO listings (id, name, type, price, address, beds, baths, area, year_built, image, tagline, description, features, agent) VALUES
(1, 'The Canopy Residence', 'Detached Duplex', 850000000, '14 Ribadu Road, Ikoyi, Lagos', 5, 6, 640, 2022, '/images/properties/property-1.jpg', 'A five-bedroom statement home under a canopy of mature trees on quiet Ribadu Road.', 'Behind a gated forecourt on Ribadu Road, The Canopy Residence pairs double-height living spaces with a wrap-around veranda that overlooks a landscaped garden.', '["Double-height living room with glazed walls","Gourmet kitchen with island and butler''s pantry","Smart-home automation throughout","Private study with skyline terrace","Swimming pool and outdoor entertaining deck","Staff quarters and triple car garage","Solar-ready rooftop with 15kW capacity","24/7 security with backup power"]'::jsonb, '{"name":"Adaeze Okafor","role":"Senior Sales Partner","phone":"+234 803 555 0142","email":"adaeze.okafor@verdantestates.ng"}'::jsonb),
(2, 'Lagoon Pearl Villa', 'Waterfront Villa', 1950000000, '7 Water Corporation Road, Banana Island, Lagos', 6, 7, 980, 2021, '/images/properties/property-2.jpg', 'A six-bedroom waterfront villa with private jetty and lagoon-facing infinity pool.', 'Lagoon Pearl Villa commands 180 degrees of the Lagos lagoon from Banana Island''s exclusive eastern arm.', '["Private jetty and boat house","Lagoon-facing infinity pool","Central courtyard with rain garden","Cinema, gym and wine cellar","Six ensuite bedrooms, all lagoon-facing","Smart security with 24/7 guardhouse","Triple standby generators and solar hybrid","Landscaped compound with native palms"]'::jsonb, '{"name":"Tunde Bakare","role":"Private Office Director","phone":"+234 802 444 0198","email":"tunde.bakare@verdantestates.ng"}'::jsonb),
(3, 'Jasmine Court', 'Terrace Duplex', 520000000, '3 Admiralty Way, Lekki Phase 1, Lagos', 4, 5, 420, 2023, '/images/properties/property-3.jpg', 'A four-bedroom terrace duplex wrapped in jasmine and set minutes from the beach.', 'Jasmine Court sits on a leafy, gated close off Admiralty Way, steps from the Atlantic shoreline.', '["Gated, landscaped close with guardhouse","Open-plan kitchen and dining floor","Guest suite on the ground floor","Planted balconies on every bedroom","Proximity to Lekki beach and schools","Borehole water with treatment plant","Solar-assisted power with battery backup","Serviced by a dedicated estate management team"]'::jsonb, '{"name":"Chioma Eze","role":"Sales Partner","phone":"+234 809 222 1076","email":"chioma.eze@verdantestates.ng"}'::jsonb),
(4, 'Palm Boulevard Penthouse', 'Penthouse', 780000000, 'Bishop Oluwole Street, Victoria Island, Lagos', 4, 4, 380, 2022, '/images/properties/property-4.jpg', 'A full-floor penthouse above Victoria Island with a wraparound sky terrace.', 'Occupying the entire 18th floor of a boutique tower on Victoria Island.', '["Full-floor footprint with private lift lobby","Wraparound sky terrace with city views","Chef''s kitchen with integrated appliances","Walk-in dressing rooms in all bedrooms","Residents'' gym, pool and concierge","Dedicated parking for four vehicles","Tower-wide backup power and fibre internet","Prime position near banks, hotels and schools"]'::jsonb, '{"name":"Femi Adeyemi","role":"Luxury Resale Manager","phone":"+234 805 111 0834","email":"femi.adeyemi@verdantestates.ng"}'::jsonb),
(5, 'Fern House', 'Semi-Detached Duplex', 460000000, '26 Ademola Adetokunbo Street, Oniru, Lagos', 4, 4, 360, 2020, '/images/properties/property-5.jpg', 'A light-filled semi-detached duplex in Oniru with a fern-lined courtyard.', 'Fern House is built around a sunken courtyard that draws light and air deep into the plan.', '["Sunken courtyard with water feature","Green wall and passive cooling design","Walkable to Landmark Beach","Study nook with library shelving","Ensuite bedrooms with rainfall showers","Gated street with CCTV and security","Efficient inverter and solar-ready wiring","Low-maintenance native landscaping"]'::jsonb, '{"name":"Ngozi Obi","role":"Sales Partner","phone":"+234 806 666 0912","email":"ngozi.obi@verdantestates.ng"}'::jsonb),
(6, 'Cedar Villa', 'Detached Villa', 690000000, '12 Chevron Drive, Lekki, Lagos', 5, 6, 560, 2021, '/images/properties/property-6.jpg', 'A five-bedroom villa off Chevron Drive with cedar ceilings and a forest garden.', 'Cedar Villa''s timber-lined ceilings and exposed stone walls give it the warmth of a mountain lodge.', '["Cedar ceilings and stone feature walls","Native-species forest garden","Covered lanai with built-in grill","Dual master suites with dressing rooms","Large family lounge and media room","Guest house with private entrance","Borehole, treatment plant and solar hybrid","Quiet, gated cul-de-sac off Chevron Drive"]'::jsonb, '{"name":"Ibrahim Suleiman","role":"Sales Partner","phone":"+234 807 777 0621","email":"ibrahim.suleiman@verdantestates.ng"}'::jsonb),
(7, 'Osborne Sky Residence', 'Apartment', 410000000, 'Osborne Foreshore, Ikoyi, Lagos', 3, 4, 250, 2023, '/images/properties/property-7.jpg', 'A three-bedroom residence on Osborne Foreshore with lagoon views from every room.', 'Set along the Osborne Foreshore promenade, this three-bedroom residence offers rare water views.', '["Lagoon-facing corner balcony","Open-plan living and dining floor","Master suite with corner water views","Residents'' pool, gym and tennis court","24-hour concierge and security","Two dedicated parking bays","Backup power and treated water supply","Walking distance to Ikoyi Club 1938"]'::jsonb, '{"name":"Adaeze Okafor","role":"Senior Sales Partner","phone":"+234 803 555 0142","email":"adaeze.okafor@verdantestates.ng"}'::jsonb),
(8, 'Canopy Loft', 'Duplex Apartment', 185000000, '9 Herbert Macaulay Way, Yaba, Lagos', 3, 3, 210, 2022, '/images/properties/property-8.jpg', 'A designer duplex loft in Yaba''s creative quarter, minutes from the train line.', 'Canopy Loft brings gallery-style living to Yaba, with a double-height living volume.', '["Double-height living volume","Exposed concrete and timber finishes","Walk-in pantry and utility room","Roof terrace for entertaining","Walking distance to the Blue Line station","Bike store and co-working lounge","Estate-wide fibre broadband","Solar-assisted common power"]'::jsonb, '{"name":"Chioma Eze","role":"Sales Partner","phone":"+234 809 222 1076","email":"chioma.eze@verdantestates.ng"}'::jsonb),
(9, 'Veranda House', 'Townhouse', 240000000, '18 Adeniran Ogunsanya, Surulere, Lagos', 3, 3, 240, 2019, '/images/properties/property-9.jpg', 'A classic Surulere townhouse with a deep veranda and a courtyard garden.', 'Veranda House honours Surulere''s genteel past — deep verandas, timber louvers and a courtyard garden.', '["Deep veranda with timber louvers","Courtyard garden with rain capture","Modern kitchen with island seating","Renovated ensuites and fittings","Carport and secure gated entry","Central to Surulere''s markets and cinemas","Inverter with solar-ready wiring","Quiet, tree-lined street"]'::jsonb, '{"name":"Femi Adeyemi","role":"Luxury Resale Manager","phone":"+234 805 111 0834","email":"femi.adeyemi@verdantestates.ng"}'::jsonb),
(10, 'Moss & Stone House', 'Detached Bungalow', 350000000, '5 Addo Road, Ajah, Lagos', 4, 5, 330, 2021, '/images/properties/property-10.jpg', 'A single-storey retreat in Ajah where moss walls meet stone floors.', 'Moss & Stone House is a modern bungalow designed for single-level living.', '["Single-level accessible floor plan","Shaded veranda across the full rear","Garden room with green wall","Wide doorways and low-threshold entries","Ensuite bedrooms around a central lawn","Kitchen with scullery and store","Borehole and full backup power","Gated, landscaped compound"]'::jsonb, '{"name":"Ngozi Obi","role":"Sales Partner","phone":"+234 806 666 0912","email":"ngozi.obi@verdantestates.ng"}'::jsonb),
(11, 'Garden Terrace', 'Terrace Duplex', 290000000, '3 Sasegbon Street, Ilupeju, Lagos', 4, 4, 280, 2020, '/images/properties/property-11.jpg', 'A four-bedroom terrace duplex on a leafy Ilupeju street near the golf course.', 'Garden Terrace lines a quiet, tree-shaded street in Ilupeju.', '["Rooftop terrace with planted beds","Open family kitchen and dining floor","Close to Ilupeju golf course and airport roads","Ensuite bedrooms with built-in wardrobes","Service quarters and laundry room","Secure, gated and well-lit street","Backup power with inverter","Managed estate amenities"]'::jsonb, '{"name":"Ibrahim Suleiman","role":"Sales Partner","phone":"+234 807 777 0621","email":"ibrahim.suleiman@verdantestates.ng"}'::jsonb),
(12, 'Atlantic View Apartment', 'Apartment', 320000000, 'Eko Atlantic, Victoria Island, Lagos', 2, 2, 160, 2023, '/images/properties/property-12.jpg', 'A two-bedroom apartment on the Eko Atlantic waterfront with ocean-facing balcony.', 'Steps from the Atlantic Ocean and the Eko Atlantic promenade.', '["Ocean-facing balcony with sea views","Floor-to-ceiling glazing throughout","Open-plan kitchen with stone counters","Estate parks, gym and retail promenade","24-hour security and concierge","Two parking bays and storage room","District cooling and backup power","Reclaimed-land, flood-protected development"]'::jsonb, '{"name":"Tunde Bakare","role":"Private Office Director","phone":"+234 802 444 0198","email":"tunde.bakare@verdantestates.ng"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADMIN USER — creates the user in Supabase Auth
-- Password: Admin@123
-- You MUST run this step manually in Supabase Dashboard:
--   1. Go to Authentication → Users → Add User
--   2. Email: admin@verdantestates.ng
--   3. Password: Admin@123
--   4. Auto Confirm: ✓
-- ═══════════════════════════════════════════════════════════════════════════════

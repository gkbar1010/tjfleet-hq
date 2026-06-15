-- ============================================================
-- TJFleet HQ — Row Level Security (RLS) Setup
-- Run this AFTER Prisma migrations create the tables.
-- ============================================================

-- ============================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. FORCE RLS FOR TABLE OWNERS TOO
--    (prevents bypassing RLS even as table owner)
-- ============================================================
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
ALTER TABLE vehicles FORCE ROW LEVEL SECURITY;
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;
ALTER TABLE files FORCE ROW LEVEL SECURITY;
ALTER TABLE notes FORCE ROW LEVEL SECURITY;

-- ============================================================
-- 3. DROP ANY EXISTING POLICIES (idempotent re-runs)
-- ============================================================
DROP POLICY IF EXISTS "Service role full access on users" ON users;
DROP POLICY IF EXISTS "Service role full access on customers" ON customers;
DROP POLICY IF EXISTS "Service role full access on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Service role full access on bookings" ON bookings;
DROP POLICY IF EXISTS "Service role full access on files" ON files;
DROP POLICY IF EXISTS "Service role full access on notes" ON notes;

DROP POLICY IF EXISTS "Block public access on users" ON users;
DROP POLICY IF EXISTS "Block public access on customers" ON customers;
DROP POLICY IF EXISTS "Block public access on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Block public access on bookings" ON bookings;
DROP POLICY IF EXISTS "Block public access on files" ON files;
DROP POLICY IF EXISTS "Block public access on notes" ON notes;

-- ============================================================
-- 4. SERVICE ROLE FULL ACCESS POLICIES
--    Our app uses the service_role key via Prisma (server-side only).
--    These policies grant full CRUD to the service role.
-- ============================================================
CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on customers"
  ON customers FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on vehicles"
  ON vehicles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on files"
  ON files FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on notes"
  ON notes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 5. AUTHENTICATED USERS — READ-ONLY ACCESS
--    Logged-in users (via anon key with valid JWT) can read.
--    All writes go through server actions using service_role.
-- ============================================================
CREATE POLICY "Authenticated read on users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read on customers"
  ON customers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read on vehicles"
  ON vehicles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read on bookings"
  ON bookings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read on files"
  ON files FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read on notes"
  ON notes FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- 6. PUBLIC (ANON) — NO ACCESS
--    Default with RLS enabled and no anon policy = blocked.
--    No policies for 'anon' role = zero public access.
-- ============================================================

-- ============================================================
-- 7. SUPABASE STORAGE BUCKETS
--    Run these to create the storage buckets.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-documents', 'customer-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-files', 'booking-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: vehicle photos are publicly readable
CREATE POLICY "Public read vehicle photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-photos');

-- Storage: only service role can upload/modify/delete
CREATE POLICY "Service role manage vehicle photos"
  ON storage.objects FOR ALL
  USING (bucket_id = 'vehicle-photos' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'vehicle-photos' AND auth.role() = 'service_role');

CREATE POLICY "Service role manage customer documents"
  ON storage.objects FOR ALL
  USING (bucket_id = 'customer-documents' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'customer-documents' AND auth.role() = 'service_role');

CREATE POLICY "Service role manage booking files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'booking-files' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'booking-files' AND auth.role() = 'service_role');

-- Authenticated users can read private buckets (for viewing in the admin portal)
CREATE POLICY "Authenticated read customer documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'customer-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated read booking files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'booking-files' AND auth.role() = 'authenticated');

-- ============================================================
-- DONE. Summary:
-- - RLS enabled + forced on all 6 tables
-- - Public/anon: ZERO access (no policies = blocked)
-- - Authenticated: read-only on all tables
-- - Service role: full CRUD on all tables
-- - Storage: 3 buckets, vehicle-photos public, others private
-- - All writes go through server actions using service_role key
-- ============================================================

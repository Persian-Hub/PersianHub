-- Drop all existing tables and recreate from scratch
-- This will completely clear the database

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS business_services CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop any existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON subcategories;
DROP POLICY IF EXISTS "Approved businesses are viewable by everyone" ON businesses;
DROP POLICY IF EXISTS "Business owners can insert their own businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can update their own businesses" ON businesses;
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Business services are viewable by everyone" ON business_services;
DROP POLICY IF EXISTS "Business owners can manage their services" ON business_services;
DROP POLICY IF EXISTS "Audit log is viewable by admins only" ON audit_log;

-- Clean up any remaining objects
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;

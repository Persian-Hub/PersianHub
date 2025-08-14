-- Update RLS policies to allow guest access for viewing businesses and related data

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view all approved businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view all categories" ON categories;
DROP POLICY IF EXISTS "Users can view all subcategories" ON subcategories;
DROP POLICY IF EXISTS "Users can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view business services" ON business_services;

-- Create new policies that allow public read access
CREATE POLICY "Anyone can view approved businesses" ON businesses
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view subcategories" ON subcategories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view approved reviews" ON reviews
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can view business services" ON business_services
    FOR SELECT USING (true);

-- Keep write policies restricted to authenticated users
CREATE POLICY "Authenticated users can insert businesses" ON businesses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Business owners can update their businesses" ON businesses
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can insert reviews" ON reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Reviewers can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = reviewer_id AND status = 'pending');

-- Admin policies (we'll add role-based access later)
CREATE POLICY "Admins can manage all businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

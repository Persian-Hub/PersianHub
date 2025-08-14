-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(200),
  category_id INTEGER REFERENCES categories(id),
  subcategory_id INTEGER REFERENCES subcategories(id),
  opening_hours JSONB,
  images TEXT[],
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id)
);

-- Create business services junction table
CREATE TABLE IF NOT EXISTS business_services (
  id SERIAL PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_subcategory ON businesses(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_services ENABLE ROW LEVEL SECURITY;

-- Business policies
CREATE POLICY "Anyone can view approved businesses" ON businesses
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Business owners can view their own businesses" ON businesses
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Business owners can insert their own businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update their own businesses" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);

-- Business services policies
CREATE POLICY "Anyone can view services for approved businesses" ON business_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_services.business_id 
      AND businesses.status = 'approved'
    )
  );

CREATE POLICY "Business owners can manage their business services" ON business_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_services.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

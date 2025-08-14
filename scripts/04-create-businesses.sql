-- Create businesses table
CREATE TABLE businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(200),
  images TEXT[] DEFAULT '{}',
  category_id INTEGER REFERENCES categories(id) NOT NULL,
  subcategory_id INTEGER REFERENCES subcategories(id) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  opening_hours JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_services table
CREATE TABLE business_services (
  id SERIAL PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_subcategory ON businesses(subcategory_id);
CREATE INDEX idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_services ENABLE ROW LEVEL SECURITY;

-- Create policies for businesses
CREATE POLICY "Approved businesses are viewable by everyone" ON businesses
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Business owners can view their own businesses" ON businesses
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Business owners can insert their own businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update their own businesses" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);

-- Create policies for business_services
CREATE POLICY "Business services are viewable by everyone" ON business_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_services.business_id 
      AND businesses.status = 'approved'
    )
  );

CREATE POLICY "Business owners can manage their services" ON business_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_services.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

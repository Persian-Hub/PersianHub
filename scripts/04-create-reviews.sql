-- Create reviews and ratings table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by_admin_id UUID REFERENCES profiles(id),
  UNIQUE(business_id, reviewer_id)
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Review policies
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own reviews" ON reviews
  FOR SELECT USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can insert their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own pending reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id AND status = 'pending');

-- Audit log policies (admin only for now)
CREATE POLICY "Only authenticated users can view audit log" ON audit_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create function to calculate average rating
CREATE OR REPLACE FUNCTION calculate_average_rating(business_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(rating::DECIMAL), 0)
    FROM reviews 
    WHERE business_id = business_uuid AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to update business slug
CREATE OR REPLACE FUNCTION generate_business_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for business slug generation
DROP TRIGGER IF EXISTS business_slug_trigger ON businesses;
CREATE TRIGGER business_slug_trigger
  BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION generate_business_slug();

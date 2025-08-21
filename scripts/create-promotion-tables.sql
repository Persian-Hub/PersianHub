-- Create promotions table to track business promotion purchases
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  promotion_start_date TIMESTAMP WITH TIME ZONE,
  promotion_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promotion_settings table for admin to manage promotion costs
CREATE TABLE IF NOT EXISTS promotion_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_cost DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  promotion_duration_days INTEGER NOT NULL DEFAULT 30,
  currency VARCHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default promotion settings
INSERT INTO promotion_settings (promotion_cost, promotion_duration_days, currency, is_active)
VALUES (10.00, 30, 'USD', true)
ON CONFLICT DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promotions_business_id ON promotions(business_id);
CREATE INDEX IF NOT EXISTS idx_promotions_user_id ON promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(promotion_start_date, promotion_end_date);

-- Add is_promoted column to businesses table if it doesn't exist
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;

-- Create function to check if business is currently promoted
CREATE OR REPLACE FUNCTION is_business_promoted(business_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM promotions 
    WHERE business_id = business_uuid 
    AND status = 'completed'
    AND promotion_start_date <= NOW()
    AND promotion_end_date >= NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to update business promotion status
CREATE OR REPLACE FUNCTION update_business_promotion_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the is_promoted flag based on active promotions
  UPDATE businesses 
  SET is_promoted = is_business_promoted(NEW.business_id)
  WHERE id = NEW.business_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update promotion status
DROP TRIGGER IF EXISTS trigger_update_promotion_status ON promotions;
CREATE TRIGGER trigger_update_promotion_status
  AFTER INSERT OR UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_business_promotion_status();

-- Enable RLS on new tables
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotions table
CREATE POLICY "Users can view their own promotions" ON promotions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own promotions" ON promotions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all promotions" ON promotions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all promotions" ON promotions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS policies for promotion_settings table
CREATE POLICY "Anyone can view promotion settings" ON promotion_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify promotion settings" ON promotion_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

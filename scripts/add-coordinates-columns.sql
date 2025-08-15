-- Add latitude and longitude columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Update existing businesses with coordinates extracted from location column
-- Convert geography to geometry before using ST_X/ST_Y functions
UPDATE businesses 
SET 
  latitude = ST_Y(location::geometry),
  longitude = ST_X(location::geometry)
WHERE location IS NOT NULL;

-- Add some sample coordinates for testing (Sydney area)
-- You can remove this section if you have real location data
UPDATE businesses 
SET 
  latitude = -33.8688 + (RANDOM() - 0.5) * 0.1,  -- Random coordinates around Sydney
  longitude = 151.2093 + (RANDOM() - 0.5) * 0.1
WHERE latitude IS NULL OR longitude IS NULL;

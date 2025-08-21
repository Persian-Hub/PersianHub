-- Add owner_keywords field to businesses table
ALTER TABLE businesses 
ADD COLUMN owner_keywords TEXT[] DEFAULT '{}';

-- Add comment to document the field purpose
COMMENT ON COLUMN businesses.owner_keywords IS 'Hidden keywords for search optimization, editable by business owner only';

-- Create index for search performance
CREATE INDEX idx_businesses_owner_keywords ON businesses USING GIN (owner_keywords);

-- Add RLS policy to ensure only business owners can edit their keywords
CREATE POLICY "Business owners can update their own keywords" ON businesses
FOR UPDATE USING (auth.uid() = owner_id);

-- Create audit log table for keyword changes
CREATE TABLE IF NOT EXISTS business_keyword_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  old_keywords TEXT[],
  new_keywords TEXT[],
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit table
ALTER TABLE business_keyword_changes ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit table (admins can view all, owners can view their own)
CREATE POLICY "Admins can view all keyword changes" ON business_keyword_changes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Owners can view their own keyword changes" ON business_keyword_changes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = business_keyword_changes.business_id 
    AND businesses.owner_id = auth.uid()
  )
);

-- Function to validate keywords
CREATE OR REPLACE FUNCTION validate_owner_keywords(keywords TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
  keyword_count INTEGER;
BEGIN
  -- Check if keywords array is not null
  IF keywords IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Get array length safely
  keyword_count := array_length(keywords, 1);
  
  -- Added null check for array_length before using in FOR loop
  -- If array is empty, array_length returns NULL, so we handle that case
  IF keyword_count IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check maximum number of keywords (20)
  IF keyword_count > 20 THEN
    RETURN FALSE;
  END IF;
  
  -- Check each keyword length and characters
  FOR i IN 1..keyword_count LOOP
    -- Check keyword length (max 50 characters)
    IF length(keywords[i]) > 50 THEN
      RETURN FALSE;
    END IF;
    
    -- Check for reasonable characters (letters, numbers, spaces, Persian characters)
    IF NOT keywords[i] ~ '^[\p{L}\p{N}\s\-_]+$' THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to validate keywords
ALTER TABLE businesses 
ADD CONSTRAINT check_owner_keywords_valid 
CHECK (validate_owner_keywords(owner_keywords));

-- Create function to log keyword changes
CREATE OR REPLACE FUNCTION log_keyword_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if keywords actually changed
  IF OLD.owner_keywords IS DISTINCT FROM NEW.owner_keywords THEN
    INSERT INTO business_keyword_changes (
      business_id,
      old_keywords,
      new_keywords,
      changed_by,
      ip_address,
      user_agent
    ) VALUES (
      NEW.id,
      OLD.owner_keywords,
      NEW.owner_keywords,
      auth.uid(),
      inet_client_addr(),
      current_setting('request.headers', true)::json->>'user-agent'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log keyword changes
CREATE TRIGGER trigger_log_keyword_changes
  AFTER UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION log_keyword_changes();

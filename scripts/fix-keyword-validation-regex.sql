-- Fix the validate_owner_keywords function to use PostgreSQL-compatible regex
-- This replaces the problematic \p{L}\p{N} Unicode property escapes

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
    
    -- Replace Unicode property escapes with PostgreSQL-compatible character classes
    -- Allow: letters (a-z, A-Z), numbers (0-9), spaces, hyphens, underscores, and Persian/Arabic characters
    -- Persian/Arabic Unicode ranges: \u0600-\u06FF (Arabic), \u0750-\u077F (Arabic Supplement)
    IF NOT keywords[i] ~ '^[a-zA-Z0-9\s\-_\u0600-\u06FF\u0750-\u077F]+$' THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

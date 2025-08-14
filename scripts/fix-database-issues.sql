-- Add missing is_business_owner column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_business_owner BOOLEAN DEFAULT FALSE;

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Users can view public profile info" ON profiles;
CREATE POLICY "Users can view public profile info" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

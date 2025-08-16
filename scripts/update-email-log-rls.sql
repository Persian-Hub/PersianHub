-- Update RLS policy to allow system inserts for email logging
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "email_log_insert_policy" ON email_log;

-- Create new policy that allows inserts from authenticated users and service role
CREATE POLICY "email_log_insert_policy" ON email_log
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts since this is for system logging

-- Ensure RLS is enabled
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated and service roles
GRANT INSERT ON email_log TO authenticated;
GRANT INSERT ON email_log TO service_role;

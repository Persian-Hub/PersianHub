-- Table (create/align columns as needed)
CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('queued','sending','sent','failed','cancelled')) DEFAULT 'queued',
  attempts integer NOT NULL DEFAULT 0,
  attempted_at timestamptz[] NOT NULL DEFAULT '{}',
  sent_at timestamptz,
  provider text DEFAULT 'smtp',
  provider_message_id text,
  from_email text NOT NULL,
  from_name text,
  reply_to text,
  to_emails jsonb NOT NULL,
  cc_emails jsonb NOT NULL DEFAULT '[]'::jsonb,
  bcc_emails jsonb NOT NULL DEFAULT '[]'::jsonb,
  subject text NOT NULL,
  template_key text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_code text,
  error_message text,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid()
);

-- Indexes used by code paths
CREATE UNIQUE INDEX IF NOT EXISTS email_log_correlation_id_uidx ON email_log (correlation_id);
CREATE INDEX IF NOT EXISTS email_log_status_idx ON email_log (status);
CREATE INDEX IF NOT EXISTS email_log_created_at_idx ON email_log (created_at);

-- Enable RLS and allow basic ops (service role bypasses RLS anyway)
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_log_select ON email_log;
DROP POLICY IF EXISTS email_log_insert ON email_log;
DROP POLICY IF EXISTS email_log_update ON email_log;

CREATE POLICY email_log_select ON email_log FOR SELECT USING (true);
CREATE POLICY email_log_insert ON email_log FOR INSERT WITH CHECK (true);
CREATE POLICY email_log_update ON email_log FOR UPDATE USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON email_log TO anon, authenticated, service_role;

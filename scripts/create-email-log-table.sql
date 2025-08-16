-- =========================================================
-- Email logging: table, indexes, RLS, admin view (idempotent)
-- =========================================================

BEGIN;

-- Ensure gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Table
CREATE TABLE IF NOT EXISTS public.email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Status & delivery
  status TEXT NOT NULL CHECK (status IN ('queued','sending','sent','failed','cancelled')) DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  attempted_at TIMESTAMPTZ[] NOT NULL DEFAULT ARRAY[]::TIMESTAMPTZ[],
  sent_at TIMESTAMPTZ,

  -- Provider
  provider TEXT NOT NULL DEFAULT 'smtp',
  provider_message_id TEXT,

  -- Addressing
  from_email TEXT NOT NULL,
  from_name  TEXT,
  reply_to   TEXT,
  to_emails  JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of strings
  cc_emails  JSONB NOT NULL DEFAULT '[]'::jsonb,
  bcc_emails JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Content
  subject          TEXT NOT NULL,
  template_key     TEXT NOT NULL,                 -- e.g., 'business_approved', 'review_pending'
  template_version TEXT NOT NULL DEFAULT 'v1',
  variables        JSONB NOT NULL DEFAULT '{}'::jsonb,
  body_text        TEXT,
  body_html        TEXT,

  -- Errors
  error_code    TEXT,
  error_message TEXT,

  -- Dedup & correlation
  dedup_key      TEXT UNIQUE,
  correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),

  -- Entity tracking
  entity_type  TEXT,   -- e.g., 'business', 'review'
  entity_id    UUID,
  actor_user_id UUID,

  -- Scheduling / priority
  scheduled_for TIMESTAMPTZ,
  priority INTEGER NOT NULL DEFAULT 5
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_email_log_status_created ON public.email_log (status, created_at);
CREATE INDEX IF NOT EXISTS idx_email_log_entity          ON public.email_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_email_log_correlation     ON public.email_log (correlation_id);
CREATE INDEX IF NOT EXISTS idx_email_log_scheduled       ON public.email_log (scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_log_failed          ON public.email_log (created_at, attempts) WHERE status = 'failed';
CREATE INDEX IF NOT EXISTS idx_email_log_recipients      ON public.email_log USING GIN (to_emails);

-- 3) RLS
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- Remove legacy/redundant policy if it exists (service_role bypasses RLS anyway)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'email_log'
      AND policyname = 'Service role can manage email logs'
  ) THEN
    DROP POLICY "Service role can manage email logs" ON public.email_log;
  END IF;
END$$;

-- Create admin SELECT policy if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'email_log'
      AND policyname = 'Admins can view email logs'
  ) THEN
    CREATE POLICY "Admins can view email logs"
      ON public.email_log
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
      );
  END IF;
END$$;

-- 4) Admin-safe view (mask variables after 7 days; excludes bodies)
CREATE OR REPLACE VIEW public.email_log_admin AS
SELECT 
  id,
  created_at,
  status,
  attempts,
  attempted_at,
  sent_at,
  provider,
  provider_message_id,
  from_email,
  from_name,
  reply_to,
  to_emails,
  cc_emails,
  bcc_emails,
  subject,
  template_key,
  template_version,
  CASE 
    WHEN created_at > NOW() - INTERVAL '7 days' THEN variables
    ELSE '{}'::jsonb
  END AS variables,
  error_code,
  error_message,
  dedup_key,
  correlation_id,
  entity_type,
  entity_id,
  actor_user_id,
  scheduled_for,
  priority
FROM public.email_log;

-- Allow authenticated users to read the admin view (RLS still applies on base table)
GRANT SELECT ON public.email_log_admin TO authenticated;

-- 5) Documentation
COMMENT ON TABLE  public.email_log IS 'Tracks all email notifications sent by the system for audit and retry purposes';
COMMENT ON COLUMN public.email_log.dedup_key      IS 'Unique key to prevent duplicate emails for the same event';
COMMENT ON COLUMN public.email_log.template_key   IS 'Identifies which email template was used (e.g., business_approved, review_pending)';
COMMENT ON COLUMN public.email_log.variables      IS 'JSON object containing template variables used for email generation';
COMMENT ON COLUMN public.email_log.attempted_at   IS 'Array of timestamps for each send attempt';

COMMIT;

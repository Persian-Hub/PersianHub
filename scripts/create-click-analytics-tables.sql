-- ============================================================
-- Click Analytics Schema (PostgreSQL / Supabase-ready)
-- ============================================================

-- 1) RAW CLICK EVENTS
CREATE TABLE IF NOT EXISTS business_clicks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  action_type      TEXT NOT NULL CHECK (action_type IN ('view', 'call', 'directions')),
  clicked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User context (optional)
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id       TEXT,            -- anonymous session identifier

  -- Privacy-friendly tracking
  ip_hash          TEXT,            -- hashed IP (do NOT store raw IP)
  user_agent_hash  TEXT,            -- hashed UA/device fingerprint
  referrer_domain  TEXT,            -- only the domain (no full URL)

  -- Metadata
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes separately (PostgreSQL syntax)
CREATE INDEX IF NOT EXISTS idx_business_clicks_business_id
  ON business_clicks(business_id);
CREATE INDEX IF NOT EXISTS idx_business_clicks_action_type
  ON business_clicks(action_type);
CREATE INDEX IF NOT EXISTS idx_business_clicks_clicked_at
  ON business_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_business_clicks_user_id
  ON business_clicks(user_id);

-- 2) DAILY AGGREGATED ANALYTICS
CREATE TABLE IF NOT EXISTS business_click_analytics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date             DATE NOT NULL,

  -- daily totals by action type
  view_count       INTEGER NOT NULL DEFAULT 0,
  call_count       INTEGER NOT NULL DEFAULT 0,
  directions_count INTEGER NOT NULL DEFAULT 0,

  -- additional metrics
  unique_users     INTEGER NOT NULL DEFAULT 0, -- approx by user_id/session_id

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (business_id, date)
);

CREATE INDEX IF NOT EXISTS idx_business_analytics_business_id
  ON business_click_analytics(business_id);
CREATE INDEX IF NOT EXISTS idx_business_analytics_date
  ON business_click_analytics(date);

-- 3) SYSTEM-WIDE ANALYTICS SETTINGS
CREATE TABLE IF NOT EXISTS analytics_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key   TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert defaults (use JSONB values with to_jsonb)
INSERT INTO analytics_settings (setting_key, setting_value, description)
VALUES
  ('data_retention_days',         to_jsonb(365),  'Number of days to keep raw click data before archiving'),
  ('aggregation_enabled',         to_jsonb(true), 'Whether to create daily aggregated analytics'),
  ('privacy_mode',                to_jsonb(true), 'Enable privacy-compliant tracking (hash IPs, etc.)'),
  ('deduplication_window_seconds',to_jsonb(5),    'Window for deduplicating rapid clicks from same session')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Daily aggregation for a given date (default: yesterday)
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE DEFAULT (CURRENT_DATE - 1))
RETURNS VOID AS $$
BEGIN
  INSERT INTO business_click_analytics (
    business_id,
    date,
    view_count,
    call_count,
    directions_count,
    unique_users
  )
  SELECT
    business_id,
    target_date,
    COUNT(*) FILTER (WHERE action_type = 'view')        AS view_count,
    COUNT(*) FILTER (WHERE action_type = 'call')        AS call_count,
    COUNT(*) FILTER (WHERE action_type = 'directions')  AS directions_count,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) AS unique_users
  FROM business_clicks
  WHERE clicked_at >= target_date
    AND clicked_at <  (target_date + 1)
  GROUP BY business_id
  ON CONFLICT (business_id, date)
  DO UPDATE SET
    view_count       = EXCLUDED.view_count,
    call_count       = EXCLUDED.call_count,
    directions_count = EXCLUDED.directions_count,
    unique_users     = EXCLUDED.unique_users,
    updated_at       = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION aggregate_daily_analytics IS 'Run daily (e.g., via cron/scheduler) to build/update per-day analytics.';

-- Cleanup function: remove old raw clicks using retention setting
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS VOID AS $$
DECLARE
  retention_days INTEGER;
BEGIN
  -- Extract scalar number from JSONB
  SELECT (setting_value)::text::integer
  INTO retention_days
  FROM analytics_settings
  WHERE setting_key = 'data_retention_days';

  retention_days := COALESCE(retention_days, 365);

  DELETE FROM business_clicks
  WHERE clicked_at < NOW() - (retention_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_analytics IS 'Run weekly/monthly to delete old raw click data per retention policy.';

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE business_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_click_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_settings ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: your schema uses businesses.owner_id to link an owner
-- Owners can view RAW click events for their own businesses
CREATE POLICY "Owners can view their business clicks"
ON business_clicks
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Admins can view ALL raw clicks
CREATE POLICY "Admins can view all business clicks"
ON business_clicks
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- If you want public/anon client inserts (without service role), enable this:
-- Otherwise, omit and insert via server using service role (recommended).
CREATE POLICY "Anyone can insert click events"
ON business_clicks
FOR INSERT
WITH CHECK (true);

-- Owners can view their aggregated analytics
CREATE POLICY "Owners can view their analytics"
ON business_click_analytics
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Admins can view all aggregated analytics
CREATE POLICY "Admins can view all analytics"
ON business_click_analytics
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins manage analytics settings
CREATE POLICY "Admins can manage analytics settings"
ON analytics_settings
FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- Category Requests + Search Analytics (idempotent migration)
-- with increment_category_search() Option B (drop & recreate)
-- ============================================================

-- 1) TABLES
CREATE TABLE IF NOT EXISTS public.category_requests (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_category_name     text NOT NULL,
  proposed_subcategory_name  text,
  description                text,
  example_businesses         text,
  requested_by               uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  business_id                uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  status                     text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','merged')),
  admin_notes                text,
  approved_by                uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at                timestamptz,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.category_search_analytics (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term       text NOT NULL,  -- normalized to lower(trim(...))
  search_count      integer NOT NULL DEFAULT 1,
  first_searched_at timestamptz NOT NULL DEFAULT now(),
  last_searched_at  timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 2) NORMALIZATION + CONSTRAINTS FOR SEARCH ANALYTICS

-- Normalize search_term to lower(trim(...)) before insert/update
CREATE OR REPLACE FUNCTION public._normalize_category_search_term()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.search_term IS NOT NULL THEN
    NEW.search_term := lower(trim(NEW.search_term));
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.first_searched_at := COALESCE(NEW.first_searched_at, now());
    NEW.last_searched_at  := COALESCE(NEW.last_searched_at,  now());
    NEW.search_count      := COALESCE(NEW.search_count, 1);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_category_search_term_insupd ON public.category_search_analytics;
CREATE TRIGGER trg_normalize_category_search_term_insupd
BEFORE INSERT OR UPDATE ON public.category_search_analytics
FOR EACH ROW EXECUTE FUNCTION public._normalize_category_search_term();

-- Unique index so ON CONFLICT (search_term) works
CREATE UNIQUE INDEX IF NOT EXISTS ux_category_search_analytics_search_term
  ON public.category_search_analytics (search_term);

-- 3) INDEXES
CREATE INDEX IF NOT EXISTS idx_category_requests_status
  ON public.category_requests (status);

CREATE INDEX IF NOT EXISTS idx_category_requests_proposed_name_ci
  ON public.category_requests ((lower(proposed_category_name)));

CREATE INDEX IF NOT EXISTS idx_category_search_analytics_count_desc
  ON public.category_search_analytics (search_count DESC);

-- 4) FUNCTIONS

-- (Option B) Drop old function signature, then recreate with new param name
DROP FUNCTION IF EXISTS public.increment_category_search(text);

CREATE OR REPLACE FUNCTION public.increment_category_search(p_term text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- normalize to lower(trim(...)) so variants collapse into one row
  INSERT INTO public.category_search_analytics (
    search_term,
    search_count,
    first_searched_at,
    last_searched_at
  )
  VALUES (
    lower(trim(p_term)),
    1,
    now(),
    now()
  )
  ON CONFLICT (search_term)
  DO UPDATE SET
    search_count     = public.category_search_analytics.search_count + 1,
    last_searched_at = now();
END;
$$;

-- Auto-approve popular categories (SECURITY DEFINER to bypass RLS if needed)
-- Assumes public.categories(name) and public.subcategories(name, category_id) exist.
CREATE OR REPLACE FUNCTION public.auto_approve_popular_categories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req RECORD;
  business_count integer;
  searches integer;
BEGIN
  FOR req IN
    SELECT *
    FROM public.category_requests
    WHERE status = 'pending'
  LOOP
    -- Count pending requests for the same proposed category (case-insensitive)
    SELECT COUNT(*) INTO business_count
    FROM public.category_requests
    WHERE status = 'pending'
      AND lower(trim(proposed_category_name)) = lower(trim(req.proposed_category_name));

    -- Look up searches for the same term
    SELECT COALESCE(search_count, 0) INTO searches
    FROM public.category_search_analytics
    WHERE search_term = lower(trim(req.proposed_category_name));

    IF business_count >= 10 OR searches >= 100 THEN
      -- Create category if not exists (case-insensitive)
      INSERT INTO public.categories (name, created_at, updated_at)
      SELECT initcap(trim(req.proposed_category_name)), now(), now()
      WHERE NOT EXISTS (
        SELECT 1 FROM public.categories c
        WHERE lower(c.name) = lower(trim(req.proposed_category_name))
      );

      -- Create subcategory if provided and not existing for that category
      IF req.proposed_subcategory_name IS NOT NULL AND length(trim(req.proposed_subcategory_name)) > 0 THEN
        INSERT INTO public.subcategories (name, category_id, created_at, updated_at)
        SELECT initcap(trim(req.proposed_subcategory_name)), c.id, now(), now()
        FROM public.categories c
        WHERE lower(c.name) = lower(trim(req.proposed_category_name))
          AND NOT EXISTS (
            SELECT 1 FROM public.subcategories s
            WHERE s.category_id = c.id
              AND lower(s.name) = lower(trim(req.proposed_subcategory_name))
          );
      END IF;

      -- Mark all matching pending requests as approved
      UPDATE public.category_requests
      SET status      = 'approved',
          approved_at = now(),
          admin_notes = 'Auto-approved: ' || business_count || ' businesses, ' || searches || ' searches',
          updated_at  = now()
      WHERE status = 'pending'
        AND lower(trim(proposed_category_name)) = lower(trim(req.proposed_category_name));
    END IF;
  END LOOP;
END;
$$;

-- Trigger: run auto-approval after each new request
CREATE OR REPLACE FUNCTION public._trigger_auto_approve_categories()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.auto_approve_popular_categories();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_approve_categories ON public.category_requests;
CREATE TRIGGER trg_auto_approve_categories
AFTER INSERT ON public.category_requests
FOR EACH ROW EXECUTE FUNCTION public._trigger_auto_approve_categories();

-- Keep updated_at on category_requests fresh
CREATE OR REPLACE FUNCTION public._touch_category_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_category_requests_updated_at ON public.category_requests;
CREATE TRIGGER trg_touch_category_requests_updated_at
BEFORE UPDATE ON public.category_requests
FOR EACH ROW EXECUTE FUNCTION public._touch_category_requests_updated_at();

-- 5) RLS

ALTER TABLE public.category_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_search_analytics ENABLE ROW LEVEL SECURITY;

-- Recreate policies idempotently
DROP POLICY IF EXISTS "Users can view own category requests"   ON public.category_requests;
DROP POLICY IF EXISTS "Users can create category requests"     ON public.category_requests;
DROP POLICY IF EXISTS "Admins can manage category requests"    ON public.category_requests;

CREATE POLICY "Users can view own category requests"
  ON public.category_requests
  FOR SELECT
  USING (requested_by = auth.uid());

CREATE POLICY "Users can create category requests"
  ON public.category_requests
  FOR INSERT
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Admins can manage category requests"
  ON public.category_requests
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage search analytics" ON public.category_search_analytics;

CREATE POLICY "Admins can manage search analytics"
  ON public.category_search_analytics
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- OPTIONAL: allow clients to log searches directly (otherwise use server/service role)
-- DROP POLICY IF EXISTS "Anyone can insert search analytics" ON public.category_search_analytics;
-- CREATE POLICY "Anyone can insert search analytics"
--   ON public.category_search_analytics
--   FOR INSERT
--   WITH CHECK (true);

-- ============================================================
-- Notes:
-- - auto_approve_popular_categories() assumes tables:
--     public.categories(name, created_at, updated_at)
--     public.subcategories(name, category_id, created_at, updated_at)
--   Adjust if your schema differs.
-- - Run your scheduler (cron) to call:
--     SELECT public.auto_approve_popular_categories();
--   every 6 hours (or use your existing job setup).
-- ============================================================

-- Add foreign key constraints between category_requests and profiles tables
-- This enables PostgREST to properly join these tables in Supabase queries

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_category_requests_requested_by ON public.category_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_category_requests_approved_by  ON public.category_requests(approved_by);

-- 1) FK: requested_by -> profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'category_requests_requested_by_profiles_fkey'
  ) THEN
    ALTER TABLE public.category_requests
      ADD CONSTRAINT category_requests_requested_by_profiles_fkey
      FOREIGN KEY (requested_by) REFERENCES public.profiles(id)
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END$$;

-- validate only if all requested_by have a profile row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.category_requests r
    LEFT JOIN public.profiles p ON p.id = r.requested_by
    WHERE r.requested_by IS NOT NULL AND p.id IS NULL
  ) THEN
    ALTER TABLE public.category_requests
      VALIDATE CONSTRAINT category_requests_requested_by_profiles_fkey;
  END IF;
END$$;

-- 2) FK: approved_by -> profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'category_requests_approved_by_profiles_fkey'
  ) THEN
    ALTER TABLE public.category_requests
      ADD CONSTRAINT category_requests_approved_by_profiles_fkey
      FOREIGN KEY (approved_by) REFERENCES public.profiles(id)
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END$$;

-- validate only if all approved_by have a profile row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.category_requests r
    LEFT JOIN public.profiles p ON p.id = r.approved_by
    WHERE r.approved_by IS NOT NULL AND p.id IS NULL
  ) THEN
    ALTER TABLE public.category_requests
      VALIDATE CONSTRAINT category_requests_approved_by_profiles_fkey;
  END IF;
END$$;

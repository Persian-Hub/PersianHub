-- Create business_reports table for user reports about businesses
CREATE TABLE IF NOT EXISTS public.business_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  report_category text NOT NULL CHECK (report_category IN (
    'bullying_unwanted_contact',
    'restricted_items',
    'nudity_sexual_activity', 
    'scam_fraud_spam',
    'false_information',
    'intellectual_property',
    'child_sexual_abuse'
  )),
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_reports_business_id ON public.business_reports(business_id);
CREATE INDEX IF NOT EXISTS idx_business_reports_status ON public.business_reports(status);
CREATE INDEX IF NOT EXISTS idx_business_reports_category ON public.business_reports(report_category);
CREATE INDEX IF NOT EXISTS idx_business_reports_created_at ON public.business_reports(created_at);

-- Enable RLS
ALTER TABLE public.business_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON public.business_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports" ON public.business_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" ON public.business_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports" ON public.business_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_business_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_reports_updated_at
  BEFORE UPDATE ON public.business_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_business_reports_updated_at();

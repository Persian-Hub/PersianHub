-- Create business verification requests table
CREATE TABLE IF NOT EXISTS public.business_verification_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    request_message text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at timestamp with time zone,
    approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_verification_requests_business_id ON public.business_verification_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_business_verification_requests_status ON public.business_verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_business_verification_requests_requested_by ON public.business_verification_requests(requested_by);

-- Enable RLS
ALTER TABLE public.business_verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Business owners can view their own verification requests
CREATE POLICY "Business owners can view their own verification requests" ON public.business_verification_requests
    FOR SELECT USING (
        requested_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE businesses.id = business_verification_requests.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- Business owners can create verification requests for their own businesses
CREATE POLICY "Business owners can create verification requests" ON public.business_verification_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE businesses.id = business_verification_requests.business_id 
            AND businesses.owner_id = auth.uid()
        )
    );

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests" ON public.business_verification_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admins can update verification requests
CREATE POLICY "Admins can update verification requests" ON public.business_verification_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_verification_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_verification_requests_updated_at
    BEFORE UPDATE ON public.business_verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_business_verification_requests_updated_at();

-- Persian Hub Complete Database Setup
-- Run this script to create all tables, relationships, and policies

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.business_services CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.subcategories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies (read-only for all users)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Create subcategories table
CREATE TABLE public.subcategories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

-- Enable RLS on subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Subcategories policies (read-only for all users)
CREATE POLICY "Subcategories are viewable by everyone" ON public.subcategories
    FOR SELECT USING (true);

-- Create businesses table
CREATE TABLE public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id),
    subcategory_id UUID REFERENCES public.subcategories(id),
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    phone TEXT,
    email TEXT,
    website TEXT,
    opening_hours JSONB,
    images TEXT[],
    services TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Businesses policies
CREATE POLICY "Approved businesses are viewable by everyone" ON public.businesses
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Business owners can view their own businesses" ON public.businesses
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Business owners can insert their own businesses" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update their own businesses" ON public.businesses
    FOR UPDATE USING (auth.uid() = owner_id);

-- Create business_services junction table
CREATE TABLE public.business_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    price_range TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on business_services
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;

-- Business services policies
CREATE POLICY "Business services are viewable by everyone" ON public.business_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND status = 'approved'
        )
    );

CREATE POLICY "Business owners can manage their business services" ON public.business_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_admin_id UUID REFERENCES public.profiles(id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Approved reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own reviews" ON public.reviews
    FOR SELECT USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can insert their own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Create audit_log table
CREATE TABLE public.audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies (admin only)
CREATE POLICY "Only admins can view audit logs" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert categories and subcategories
INSERT INTO public.categories (name, slug, description) VALUES
('Food & Dining', 'food-dining', 'Restaurants, cafes, and food services'),
('Health & Beauty', 'health-beauty', 'Health services and beauty treatments'),
('Home Services', 'home-services', 'Home maintenance and repair services'),
('Automotive', 'automotive', 'Car services and automotive businesses'),
('Retail & Shopping', 'retail-shopping', 'Stores and retail businesses'),
('Education', 'education', 'Educational services and institutions'),
('Technology', 'technology', 'IT services and technology businesses'),
('Events & Entertainment', 'events-entertainment', 'Event planning and entertainment services'),
('Professional Services', 'professional-services', 'Business and professional services'),
('Travel & Transport', 'travel-transport', 'Transportation and travel services'),
('Construction & Trades', 'construction-trades', 'Construction and trade services'),
('Legal & Finance', 'legal-finance', 'Legal and financial services');

-- Insert subcategories
INSERT INTO public.subcategories (category_id, name, slug) VALUES
((SELECT id FROM public.categories WHERE slug = 'food-dining'), 'Restaurants', 'restaurants'),
((SELECT id FROM public.categories WHERE slug = 'food-dining'), 'Cafes & Bakeries', 'cafes-bakeries'),
((SELECT id FROM public.categories WHERE slug = 'food-dining'), 'Catering', 'catering'),
((SELECT id FROM public.categories WHERE slug = 'health-beauty'), 'Hair Salons', 'hair-salons'),
((SELECT id FROM public.categories WHERE slug = 'health-beauty'), 'Spas & Massage', 'spas-massage'),
((SELECT id FROM public.categories WHERE slug = 'health-beauty'), 'Medical Clinics', 'medical-clinics'),
((SELECT id FROM public.categories WHERE slug = 'home-services'), 'Plumbing', 'plumbing'),
((SELECT id FROM public.categories WHERE slug = 'home-services'), 'Electrical', 'electrical'),
((SELECT id FROM public.categories WHERE slug = 'home-services'), 'Cleaning Services', 'cleaning-services'),
((SELECT id FROM public.categories WHERE slug = 'automotive'), 'Car Repair', 'car-repair'),
((SELECT id FROM public.categories WHERE slug = 'automotive'), 'Car Wash', 'car-wash'),
((SELECT id FROM public.categories WHERE slug = 'automotive'), 'Car Dealership', 'car-dealership'),
((SELECT id FROM public.categories WHERE slug = 'retail-shopping'), 'Clothing Stores', 'clothing-stores'),
((SELECT id FROM public.categories WHERE slug = 'retail-shopping'), 'Grocery Stores', 'grocery-stores'),
((SELECT id FROM public.categories WHERE slug = 'retail-shopping'), 'Electronics', 'electronics'),
((SELECT id FROM public.categories WHERE slug = 'education'), 'Schools', 'schools'),
((SELECT id FROM public.categories WHERE slug = 'education'), 'Tutoring Services', 'tutoring-services'),
((SELECT id FROM public.categories WHERE slug = 'education'), 'Language Centers', 'language-centers'),
((SELECT id FROM public.categories WHERE slug = 'technology'), 'IT Services', 'it-services'),
((SELECT id FROM public.categories WHERE slug = 'technology'), 'Web Design', 'web-design'),
((SELECT id FROM public.categories WHERE slug = 'technology'), 'Mobile Repairs', 'mobile-repairs'),
((SELECT id FROM public.categories WHERE slug = 'events-entertainment'), 'Event Planners', 'event-planners'),
((SELECT id FROM public.categories WHERE slug = 'events-entertainment'), 'Wedding Services', 'wedding-services'),
((SELECT id FROM public.categories WHERE slug = 'events-entertainment'), 'Photography & Video', 'photography-video'),
((SELECT id FROM public.categories WHERE slug = 'professional-services'), 'Accounting', 'accounting'),
((SELECT id FROM public.categories WHERE slug = 'professional-services'), 'Consulting', 'consulting'),
((SELECT id FROM public.categories WHERE slug = 'professional-services'), 'Marketing & Ads', 'marketing-ads'),
((SELECT id FROM public.categories WHERE slug = 'travel-transport'), 'Taxi & Rideshare', 'taxi-rideshare'),
((SELECT id FROM public.categories WHERE slug = 'travel-transport'), 'Moving Services', 'moving-services'),
((SELECT id FROM public.categories WHERE slug = 'travel-transport'), 'Travel Agencies', 'travel-agencies'),
((SELECT id FROM public.categories WHERE slug = 'construction-trades'), 'Builders', 'builders'),
((SELECT id FROM public.categories WHERE slug = 'construction-trades'), 'Painters', 'painters'),
((SELECT id FROM public.categories WHERE slug = 'construction-trades'), 'Roofing Services', 'roofing-services'),
((SELECT id FROM public.categories WHERE slug = 'legal-finance'), 'Lawyers', 'lawyers'),
((SELECT id FROM public.categories WHERE slug = 'legal-finance'), 'Insurance', 'insurance'),
((SELECT id FROM public.categories WHERE slug = 'legal-finance'), 'Financial Advisers', 'financial-advisers');

-- Create indexes for better performance
CREATE INDEX idx_businesses_status ON public.businesses(status);
CREATE INDEX idx_businesses_category ON public.businesses(category_id);
CREATE INDEX idx_businesses_location ON public.businesses USING GIST(location);
CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_reviews_business ON public.reviews(business_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

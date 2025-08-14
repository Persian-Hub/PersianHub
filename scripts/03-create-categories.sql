-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE subcategories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Subcategories are viewable by everyone" ON subcategories
  FOR SELECT USING (true);

-- Insert categories and subcategories
INSERT INTO categories (name, slug) VALUES
('Food & Dining', 'food-dining'),
('Health & Beauty', 'health-beauty'),
('Home Services', 'home-services'),
('Automotive', 'automotive'),
('Retail & Shopping', 'retail-shopping'),
('Education', 'education'),
('Technology', 'technology'),
('Events & Entertainment', 'events-entertainment'),
('Professional Services', 'professional-services'),
('Travel & Transport', 'travel-transport'),
('Construction & Trades', 'construction-trades'),
('Legal & Finance', 'legal-finance');

-- Insert subcategories
INSERT INTO subcategories (name, slug, category_id) VALUES
-- Food & Dining
('Restaurants', 'restaurants', 1),
('Cafes & Bakeries', 'cafes-bakeries', 1),
('Catering', 'catering', 1),
-- Health & Beauty
('Hair Salons', 'hair-salons', 2),
('Spas & Massage', 'spas-massage', 2),
('Medical Clinics', 'medical-clinics', 2),
-- Home Services
('Plumbing', 'plumbing', 3),
('Electrical', 'electrical', 3),
('Cleaning Services', 'cleaning-services', 3),
-- Automotive
('Car Repair', 'car-repair', 4),
('Car Wash', 'car-wash', 4),
('Car Dealership', 'car-dealership', 4),
-- Retail & Shopping
('Clothing Stores', 'clothing-stores', 5),
('Grocery Stores', 'grocery-stores', 5),
('Electronics', 'electronics', 5),
-- Education
('Schools', 'schools', 6),
('Tutoring Services', 'tutoring-services', 6),
('Language Centers', 'language-centers', 6),
-- Technology
('IT Services', 'it-services', 7),
('Web Design', 'web-design', 7),
('Mobile Repairs', 'mobile-repairs', 7),
-- Events & Entertainment
('Event Planners', 'event-planners', 8),
('Wedding Services', 'wedding-services', 8),
('Photography & Video', 'photography-video', 8),
-- Professional Services
('Accounting', 'accounting', 9),
('Consulting', 'consulting', 9),
('Marketing & Ads', 'marketing-ads', 9),
-- Travel & Transport
('Taxi & Rideshare', 'taxi-rideshare', 10),
('Moving Services', 'moving-services', 10),
('Travel Agencies', 'travel-agencies', 10),
-- Construction & Trades
('Builders', 'builders', 11),
('Painters', 'painters', 11),
('Roofing Services', 'roofing-services', 11),
-- Legal & Finance
('Lawyers', 'lawyers', 12),
('Insurance', 'insurance', 12),
('Financial Advisers', 'financial-advisers', 12);

-- Create categories and subcategories tables
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- Insert categories and subcategories data
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
  ('Legal & Finance', 'legal-finance')
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories
INSERT INTO subcategories (category_id, name, slug) VALUES
  -- Food & Dining
  ((SELECT id FROM categories WHERE slug = 'food-dining'), 'Restaurants', 'restaurants'),
  ((SELECT id FROM categories WHERE slug = 'food-dining'), 'Cafes & Bakeries', 'cafes-bakeries'),
  ((SELECT id FROM categories WHERE slug = 'food-dining'), 'Catering', 'catering'),
  
  -- Health & Beauty
  ((SELECT id FROM categories WHERE slug = 'health-beauty'), 'Hair Salons', 'hair-salons'),
  ((SELECT id FROM categories WHERE slug = 'health-beauty'), 'Spas & Massage', 'spas-massage'),
  ((SELECT id FROM categories WHERE slug = 'health-beauty'), 'Medical Clinics', 'medical-clinics'),
  
  -- Home Services
  ((SELECT id FROM categories WHERE slug = 'home-services'), 'Plumbing', 'plumbing'),
  ((SELECT id FROM categories WHERE slug = 'home-services'), 'Electrical', 'electrical'),
  ((SELECT id FROM categories WHERE slug = 'home-services'), 'Cleaning Services', 'cleaning-services'),
  
  -- Automotive
  ((SELECT id FROM categories WHERE slug = 'automotive'), 'Car Repair', 'car-repair'),
  ((SELECT id FROM categories WHERE slug = 'automotive'), 'Car Wash', 'car-wash'),
  ((SELECT id FROM categories WHERE slug = 'automotive'), 'Car Dealership', 'car-dealership'),
  
  -- Retail & Shopping
  ((SELECT id FROM categories WHERE slug = 'retail-shopping'), 'Clothing Stores', 'clothing-stores'),
  ((SELECT id FROM categories WHERE slug = 'retail-shopping'), 'Grocery Stores', 'grocery-stores'),
  ((SELECT id FROM categories WHERE slug = 'retail-shopping'), 'Electronics', 'electronics'),
  
  -- Education
  ((SELECT id FROM categories WHERE slug = 'education'), 'Schools', 'schools'),
  ((SELECT id FROM categories WHERE slug = 'education'), 'Tutoring Services', 'tutoring-services'),
  ((SELECT id FROM categories WHERE slug = 'education'), 'Language Centers', 'language-centers'),
  
  -- Technology
  ((SELECT id FROM categories WHERE slug = 'technology'), 'IT Services', 'it-services'),
  ((SELECT id FROM categories WHERE slug = 'technology'), 'Web Design', 'web-design'),
  ((SELECT id FROM categories WHERE slug = 'technology'), 'Mobile Repairs', 'mobile-repairs'),
  
  -- Events & Entertainment
  ((SELECT id FROM categories WHERE slug = 'events-entertainment'), 'Event Planners', 'event-planners'),
  ((SELECT id FROM categories WHERE slug = 'events-entertainment'), 'Wedding Services', 'wedding-services'),
  ((SELECT id FROM categories WHERE slug = 'events-entertainment'), 'Photography & Video', 'photography-video'),
  
  -- Professional Services
  ((SELECT id FROM categories WHERE slug = 'professional-services'), 'Accounting', 'accounting'),
  ((SELECT id FROM categories WHERE slug = 'professional-services'), 'Consulting', 'consulting'),
  ((SELECT id FROM categories WHERE slug = 'professional-services'), 'Marketing & Ads', 'marketing-ads'),
  
  -- Travel & Transport
  ((SELECT id FROM categories WHERE slug = 'travel-transport'), 'Taxi & Rideshare', 'taxi-rideshare'),
  ((SELECT id FROM categories WHERE slug = 'travel-transport'), 'Moving Services', 'moving-services'),
  ((SELECT id FROM categories WHERE slug = 'travel-transport'), 'Travel Agencies', 'travel-agencies'),
  
  -- Construction & Trades
  ((SELECT id FROM categories WHERE slug = 'construction-trades'), 'Builders', 'builders'),
  ((SELECT id FROM categories WHERE slug = 'construction-trades'), 'Painters', 'painters'),
  ((SELECT id FROM categories WHERE slug = 'construction-trades'), 'Roofing Services', 'roofing-services'),
  
  -- Legal & Finance
  ((SELECT id FROM categories WHERE slug = 'legal-finance'), 'Lawyers', 'lawyers'),
  ((SELECT id FROM categories WHERE slug = 'legal-finance'), 'Insurance', 'insurance'),
  ((SELECT id FROM categories WHERE slug = 'legal-finance'), 'Financial Advisers', 'financial-advisers')
ON CONFLICT (category_id, name) DO NOTHING;

-- Roles Table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,

  -- Core identity
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,

  -- Personal info
  first_name TEXT,
  last_name TEXT,
  avatar TEXT,

  -- Role and permissions
  role_id INTEGER REFERENCES roles(id),

  -- Status and verification
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'suspended', 'removed')),
  is_email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  password_reset_token TEXT,

  -- Notification preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT TRUE,
  notification_email TEXT,
  notification_phone TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- User Roles Switch
CREATE TABLE user_roles_switch (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Showrooms
CREATE TABLE showrooms (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  is_main_branch BOOLEAN DEFAULT FALSE,
  parent_id INTEGER REFERENCES showrooms(id) ON DELETE SET NULL,
  address TEXT,
  address_ar TEXT,
  location TEXT,
  phone TEXT,
  logo TEXT
  is_featured boolean DEFAULT false
);

-- Car Makes
CREATE TABLE car_makes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  image TEXT NOT NULL
);

-- Showroom Service Makes
CREATE TABLE showroom_service_makes (
  id SERIAL PRIMARY KEY,
  showroom_id INTEGER NOT NULL REFERENCES showrooms(id),
  make_id INTEGER NOT NULL REFERENCES car_makes(id)
);

-- Car Categories
CREATE TABLE car_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  image TEXT NOT NULL,
  count INTEGER DEFAULT 0
);

-- Car Models
CREATE TABLE car_models (
  id SERIAL PRIMARY KEY,
  make_id INTEGER NOT NULL REFERENCES car_makes(id),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL
);

-- Car Features
CREATE TABLE car_features (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT
);

-- Car Services
CREATE TABLE car_services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  image TEXT
);

-- Car Listings
CREATE TABLE car_listings (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL,                             -- FK to users
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT NOT NULL,
  description_ar TEXT,
  price INTEGER NOT NULL,
  currency TEXT,
  year INTEGER NOT NULL,
  make_id INTEGER NOT NULL,                               -- FK to car_makes
  model_id INTEGER NOT NULL,                              -- FK to car_models
  category_id INTEGER NOT NULL,                           -- FK to car_categories
  mileage INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  engine_capacity_id INTEGER,
  cylinder_count INTEGER DEFAULT 0,
  color TEXT NOT NULL,
  interior_color TEXT,
  tinted BOOLEAN DEFAULT FALSE,
  condition TEXT NOT NULL,
  location TEXT NOT NULL,
  images TEXT[],                                          -- Array of image URLs
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'sold', 'expired', 'rejected')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_imported BOOLEAN DEFAULT FALSE,

  owner_type TEXT CHECK (owner_type IN ('first', 'second', 'third', 'fourth', 'fifth')),
  has_warranty BOOLEAN DEFAULT FALSE,
  warranty_expiry TIMESTAMP,
  has_insurance BOOLEAN DEFAULT FALSE,
  insurance_type TEXT CHECK (insurance_type IN ('comprehensive', 'third-party', 'none')),
  insurance_expiry TIMESTAMP,

  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);


-- Car Listing Features
CREATE TABLE car_listing_features (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES car_listings(id),
  feature_id INTEGER NOT NULL REFERENCES car_features(id)
);

-- Showroom Services
CREATE TABLE showroom_services (
  id SERIAL PRIMARY KEY,
  showroom_id INTEGER NOT NULL REFERENCES showrooms(id),
  service_id INTEGER NOT NULL REFERENCES car_services(id),
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'QAR',
  description TEXT,
  description_ar TEXT,
  is_featured BOOLEAN DEFAULT FALSE
);

-- Service Bookings
CREATE TABLE service_bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  service_id INTEGER NOT NULL REFERENCES showroom_services(id),
  scheduled_at TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'confirmed', 'complete', 'expired', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  car_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  recipient_type TEXT NOT NULL,
  type TEXT NOT NULL,
  listing_id INTEGER REFERENCES car_listings(id),
  title TEXT,
  content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'failed', 'read', 'unread')),
  sent_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  car_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'under_investigation')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search History
CREATE TABLE search_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Static Content
CREATE TABLE static_content
(
    id integer NOT NULL DEFAULT nextval('static_content_id_seq'::regclass),
    key text COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    title text COLLATE pg_catalog."default",
    title_ar text COLLATE pg_catalog."default",
    content_ar text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default",
    author integer,
    placement text COLLATE pg_catalog."default" DEFAULT 'both'::text
)

-- Transactions
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,                         -- Amount in smallest currency unit
  currency TEXT NOT NULL DEFAULT 'QAR',            -- Currency code
  description TEXT NOT NULL,                       -- Description of the transaction
  payment_method TEXT NOT NULL,                    -- e.g., 'credit_card', 'paypal'
  payment_id TEXT NOT NULL,                        -- Payment processor ID
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,                                  -- Additional dynamic payment data
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stripe_customers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  stripe_customer_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Plans
CREATE TABLE subscription_plans
(
    id SERIAL PRIMARY KEY,
    name text COLLATE pg_catalog."default" NOT NULL,
    name_ar text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    description_ar text COLLATE pg_catalog."default",
    price integer NOT NULL,
    currency text COLLATE pg_catalog."default" DEFAULT 'QAR'::text,
    duration_days integer NOT NULL,
    listing_limit integer,
    featured_listing_limit integer DEFAULT 0,
    priority_listing boolean DEFAULT false,
    showroom_limit integer DEFAULT 0,
    service_limit integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
)

-- User Subscriptions
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),                             -- User ID
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),                -- Subscription Plan ID
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),                               -- Start Date of Subscription
  end_date TIMESTAMP NOT NULL,                                               -- End Date of Subscription
  is_active BOOLEAN DEFAULT TRUE,                                            -- Subscription active flag
  auto_renew BOOLEAN DEFAULT FALSE,                                          -- Auto-renewal flag
  payment_method TEXT,                                                       -- Payment method (e.g., 'credit_card', 'paypal')
  transaction_id INTEGER REFERENCES transactions(id),                        -- Associated transaction (Payment ID)
  created_at TIMESTAMP DEFAULT NOW()                                         -- Record creation timestamp
);

-- Promotion Packages
CREATE TABLE promotion_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  duration_days INTEGER NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,         -- Higher value = more prominent
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Listing Promotions
CREATE TABLE listing_promotions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES car_listings(id),          -- Linked car listing
  package_id INTEGER NOT NULL REFERENCES promotion_packages(id),    -- Promotion package used
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),                      -- Promotion start date
  end_date TIMESTAMP NOT NULL,                                      -- Promotion end date
  transaction_id INTEGER REFERENCES transactions(id),               -- Related transaction (if applicable)
  is_active BOOLEAN DEFAULT TRUE,                                   -- Whether promotion is currently active
  created_at TIMESTAMP DEFAULT NOW()                                -- Record creation timestamp
);

CREATE TABLE service_promotion_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  duration_days INTEGER NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_promotions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES car_listings(id),
  package_id INTEGER NOT NULL REFERENCES service_promotion_packages(id),
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP NOT NULL,
  transaction_id INTEGER REFERENCES transactions(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
  email VARCHAR(255) PRIMARY KEY,
  token VARCHAR(32) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: public.settings

CREATE TABLE settings
(
    id INTEGER PRIMARY KEY,    
    logo text COLLATE pg_catalog."default",
    favicon text COLLATE pg_catalog."default",
    site_name text COLLATE pg_catalog."default" NOT NULL DEFAULT 'CarMarket'::text,
    site_name_ar text COLLATE pg_catalog."default" NOT NULL DEFAULT 'سوق السيارات'::text,
    site_description text COLLATE pg_catalog."default",
    site_description_ar text COLLATE pg_catalog."default",
    contact_email text COLLATE pg_catalog."default",
    phone_number text COLLATE pg_catalog."default",
    address text COLLATE pg_catalog."default",
    address_ar text COLLATE pg_catalog."default",
    primary_color text COLLATE pg_catalog."default" NOT NULL DEFAULT '#3563E9'::text,
    secondary_color text COLLATE pg_catalog."default" NOT NULL DEFAULT '#1A202C'::text,
    enable_registration boolean NOT NULL DEFAULT true,
    require_email_verification boolean NOT NULL DEFAULT false,
    allow_user_rating boolean NOT NULL DEFAULT true,
    max_listings_per_user integer NOT NULL DEFAULT 5,
    max_images_per_listing integer NOT NULL DEFAULT 10,
    email_config jsonb,
    integrations jsonb,
    allowed_languages text[] COLLATE pg_catalog."default" NOT NULL DEFAULT ARRAY['en'::text, 'ar'::text],
    default_language text COLLATE pg_catalog."default" NOT NULL DEFAULT 'en'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    sms_config jsonb,
    google_maps_config jsonb
)

CREATE TABLE permissions
(
    id integer PRIMARY KEY,
    code text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    created_at timestamp without time zone NOT NULL DEFAULT now()
)

CREATE TABLE role_permissions
(
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
)

CREATE TABLE car_engine_capacities (
    id SERIAL PRIMARY KEY,
    size_liters DECIMAL(3,1) NOT NULL UNIQUE, -- e.g., 1.2, 2.0, 3.5
    description TEXT,                         -- Optional: e.g., "1.2L Inline-4"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-------------- Insert Queries ---------------

-- Roles
INSERT INTO roles (id, name, name_ar, description, created_at, updated_at) VALUES
(1, 'BUYER', 'مشتري', 'Can browse and purchase cars.', NOW(), NOW()),
(2, 'SELLER', 'بائع', 'Can list and sell cars.', NOW(), NOW()),
(3, 'DEALER', 'معرض - أساسي', 'Basic showroom features.', NOW(), NOW()),
(4, 'GARAGE', 'معرض - مميز', 'Premium showroom features.', NOW(), NOW()),
(5, 'MODERATOR', 'مشرف', 'Moderates content.', NOW(), NOW()),
(6, 'SENIOR_MODERATOR', 'مشرف أول', 'Senior moderator with more permissions.', NOW(), NOW()),
(7, 'ADMIN', 'مشرف عام', 'Admin role.', NOW(), NOW()),
(8, 'SUPER_ADMIN', 'مشرف مميز', 'Top-level administrator.', NOW(), NOW());

-- Users
INSERT INTO users (
  id, username, email, password, first_name, last_name, role, is_email_verified,
  created_at, role_id, phone, email_notifications, sms_notifications,
  notification_email, notification_phone, status
) VALUES
(1, 'buyer_user', 'buyer@example.com', 'hashed_password', 'Buyer', 'User', 'BUYER', true, '2025-04-27 09:37:07.228727', 1, '1234567890', true, true, NULL, NULL, 'active'),
(2, 'seller_user', 'seller@example.com', 'hashed_password', 'Seller', 'User', 'SELLER', true, '2025-04-27 09:37:07.228727', 2, '1234567891', true, true, NULL, NULL, 'active'),
(3, 'DEALER_user', 'DEALER@example.com', 'hashed_password', 'Showroom', 'Basic', 'DEALER', true, '2025-04-27 09:37:07.228727', 3, '1234567892', true, true, NULL, NULL, 'active'),
(4, 'GARAGE_user', 'GARAGE@example.com', 'hashed_password', 'Showroom', 'Premium', 'GARAGE', true, '2025-04-27 09:37:07.228727', 4, '1234567893', true, true, NULL, NULL, 'active'),
(5, 'moderator_user', 'moderator@example.com', 'hashed_password', 'Moderator', 'User', 'MODERATOR', true, '2025-04-27 09:37:07.228727', 5, '1234567894', true, true, NULL, NULL, 'active'),
(6, 'senior_moderator_user', 'senior_moderator@example.com', 'hashed_password', 'Senior', 'Moderator', 'SENIOR_MODERATOR', true, '2025-04-27 09:37:07.228727', 6, '1234567895', true, true, NULL, NULL, 'active'),
(7, 'admin_user', 'admin@example.com', 'hashed_password', 'Admin', 'User', 'ADMIN', true, '2025-04-27 09:37:07.228727', 7, '1234567896', true, true, NULL, NULL, 'active'),
(8, 'adminTest', 'admin@test.com', '$2b$10$6/qlvlHrhRBf0uhwbN5MZuvshAoB8b5ZrJvyTW1V5j8DmJwzwiltC', 'Super', 'Admin', 'SUPER_ADMIN', true, '2025-04-27 09:37:07.228727', 8, '1234567897', true, true, NULL, NULL, 'active'),
(9, 'buyerTest', 'buyer@test.com', '$2b$10$6/qlvlHrhRBf0uhwbN5MZuvshAoB8b5ZrJvyTW1V5j8DmJwzwiltC', 'Muhammad Ahsan', 'Shakeel', 'BUYER', true, '2025-04-27 10:12:38.722141', 1, '123456789', true, true, 'buyer@test.com', NULL, 'active'),
(10, 'showroomTest', 'showroom@test.com', '$2b$10$EbNCHa8VAIed7cb7A16GuegspisfkrtVBAJQ8mANxJZl51yFarFpy', 'John', 'Doe', 'DEALER', true, '2025-04-29 21:46:20.564284', 3, '123456789', true, true, 'showroom@test.com', NULL, 'active'),
(11, 'sellerTest', 'seller@test.com', '$2b$10$f.PsOauHoglHgNU8Eo6nQuAtNDW7jxfjdAxZflBz07dgqu1a1GHRe', 'Jim', 'Khan', 'SELLER', true, '2025-04-29 22:59:53.951891', 2, '123456789', true, true, 'seller@test.com', NULL, 'active');

-- User Roles Switch
INSERT INTO user_roles_switch (id, user_id, role, is_active, created_at) VALUES
(1, 1, 'BUYER', TRUE, NOW()),
(2, 2, 'BUYER', TRUE, NOW()),
(3, 3, 'BUYER', TRUE, NOW()),
(4, 4, 'BUYER', TRUE, NOW()),
(5, 5, 'BUYER', TRUE, NOW()),
(6, 6, 'BUYER', TRUE, NOW()),
(7, 7, 'BUYER', TRUE, NOW()),
(8, 8, 'BUYER', TRUE, NOW()),
(9, 9, 'BUYER', TRUE, NOW()),
(10, 10, 'BUYER', TRUE, NOW());

-- Car Categories
INSERT INTO car_categories (id, name, name_ar, image, count) VALUES
(1, 'SUV', 'دفع رباعي', 'https://placehold.co/400x400', false),
(2, 'Sedan', 'سيدان', 'https://placehold.co/400x400', false),
(3, 'Truck', 'شاحنة', 'https://placehold.co/400x400', false),
(4, 'Convertible', 'قابل للتحويل', 'https://placehold.co/400x400', false),
(5, 'Hatchback', 'هاتشباك', 'https://placehold.co/400x400', false),
(6, 'Van', 'فان', 'https://placehold.co/400x400', false),
(7, 'Coupe', 'كوبيه', 'https://placehold.co/400x400', false),
(8, 'Electric', 'كهربائي', 'https://placehold.co/400x400', false),
(9, 'Hybrid', 'هجين', 'https://placehold.co/400x400', false),
(10, 'Luxury', 'فاخر', 'https://placehold.co/400x400', false);

-- Car MAkes
INSERT INTO car_makes (name, name_ar, image) VALUES
('Toyota', 'تويوتا', 'https://placehold.co/400x400'),
('Honda', 'هوندا', 'https://placehold.co/400x400'),
('Ford', 'فورد', 'https://placehold.co/400x400'),
('Chevrolet', 'شيفروليه', 'https://placehold.co/400x400'),
('Nissan', 'نيسان', 'https://placehold.co/400x400'),
('Hyundai', 'هيونداي', 'https://placehold.co/400x400'),
('BMW', 'بي إم دبليو', 'https://placehold.co/400x400'),
('Mercedes-Benz', 'مرسيدس بنز', 'https://placehold.co/400x400'),
('Kia', 'كيا', 'https://placehold.co/400x400'),
('Audi', 'أودي', 'https://placehold.co/400x400');

-- Car Models
INSERT INTO car_models (id, make_id, name, name_ar) VALUES
(1, 1, 'Camry', 'كامري'),
(2, 2, 'Civic', 'سيفيك'),
(3, 3, 'F-150', 'اف-150'),
(4, 4, '3 Series', 'السلسلة ٣'),
(5, 5, 'E-Class', 'الفئة E'),
(6, 6, 'Model S', 'موديل S'),
(7, 7, 'Elantra', 'النترا'),
(8, 8, 'Malibu', 'ماليبو'),
(9, 9, 'Sportage', 'سبورتاج'),
(10, 10, 'A4', 'A4');

-- Car Features
INSERT INTO car_features (name, name_ar) VALUES
('Air Conditioning', 'تكييف الهواء'),
('Leather Seats', 'مقاعد جلدية'),
('Sunroof', 'فتحة سقف'),
('Bluetooth', 'بلوتوث'),
('Backup Camera', 'كاميرا خلفية'),
('Navigation System', 'نظام ملاحة'),
('Parking Sensors', 'حساسات ركن'),
('Cruise Control', 'مثبت سرعة'),
('Keyless Entry', 'دخول بدون مفتاح'),
('Heated Seats', 'مقاعد مدفأة');

-- Car Services
INSERT INTO car_services (name, name_ar, image) VALUES
('Oil Change', 'تغيير الزيت', 'https://placehold.co/400x400'),
('Tire Replacement', 'تبديل الإطارات', 'https://placehold.co/400x400'),
('Car Wash', 'غسيل السيارة', 'https://placehold.co/400x400'),
('Interior Detailing', 'تنظيف داخلي', 'https://placehold.co/400x400'),
('Exterior Polishing', 'تلميع خارجي', 'https://placehold.co/400x400'),
('Battery Replacement', 'تبديل البطارية', 'https://placehold.co/400x400'),
('Brake Service', 'خدمة الفرامل', 'https://placehold.co/400x400'),
('AC Repair', 'تصليح المكيف', 'https://placehold.co/400x400'),
('Engine Diagnostics', 'تشخيص المحرك', 'https://placehold.co/400x400'),
('Paint Protection', 'حماية الطلاء', 'https://placehold.co/400x400');

-- Showrooms
INSERT INTO showrooms (user_id, name, name_ar, is_main_branch, parent_id, address, address_ar, location, phone, logo) VALUES
(10, 'Elite Motors', 'النخبة للسيارات', true, NULL, '123 King Fahd Rd, Riyadh', '123 طريق الملك فهد، الرياض', '24.7136, 46.6753', '+966501234567', 'https://placehold.co/400x400'),
(10, 'Auto World', 'عالم السيارات', false, 1, '456 Prince Sultan St, Jeddah', '456 شارع الأمير سلطان، جدة', '21.4858, 39.1925', '+966502345678', 'https://placehold.co/400x400'),
(10, 'SpeedZone Showroom', 'منطقة السرعة', false, 1, '789 Olaya St, Riyadh', '789 شارع العليا، الرياض', '24.6961, 46.6909', '+966503456789', 'https://placehold.co/400x400'),
(10, 'Luxury Auto Gallery', 'معرض السيارات الفاخرة', true, NULL, '321 Tahlia St, Jeddah', '321 شارع التحلية، جدة', '21.5526, 39.1895', '+966504567890', 'https://placehold.co/400x400'),
(10, 'City Cars', 'سيارات المدينة', false, 4, '111 King Abdullah Rd, Dammam', '111 طريق الملك عبدالله، الدمام', '26.4207, 50.0888', '+966505678901', 'https://placehold.co/400x400'),
(10, 'Desert Drive Showroom', 'معرض قيادة الصحراء', false, 4, '555 Madinah Rd, Medina', '555 طريق المدينة، المدينة المنورة', '24.5247, 39.5692', '+966506789012', 'https://placehold.co/400x400'),
(10, 'Prime Auto Hub', 'مركز السيارات المميز', true, NULL, '999 Airport Rd, Riyadh', '999 طريق المطار، الرياض', '24.7216, 46.7286', '+966507890123', 'https://placehold.co/400x400'),
(10, 'DriveSmart Motors', 'محركات القيادة الذكية', false, 7, '222 Palestine St, Jeddah', '222 شارع فلسطين، جدة', '21.5125, 39.2041', '+966508901234', 'https://placehold.co/400x400'),
(10, 'Metro Car Plaza', 'ساحة مترو للسيارات', false, 7, '333 Corniche Rd, Dammam', '333 كورنيش الدمام', '26.4366, 50.1033', '+966509012345', 'https://placehold.co/400x400'),
(10, 'AutoLux Center', 'مركز أوتو لوكس', false, 7, '777 King Khalid St, Taif', '777 شارع الملك خالد، الطائف', '21.2828, 40.3829', '+966500123456', 'https://placehold.co/400x400');

UPDATE public.showrooms SET
  description = CASE id
    WHEN 1 THEN 'Premium showroom offering a wide selection of luxury vehicles.'
    WHEN 2 THEN 'Comprehensive car dealership with diverse inventory.'
    WHEN 3 THEN 'High-performance vehicles for speed enthusiasts.'
    WHEN 4 THEN 'Exclusive gallery for luxury and exotic cars.'
    WHEN 5 THEN 'Trusted dealership for city-ready vehicles.'
    WHEN 6 THEN 'Desert-ready 4x4s and rugged performance vehicles.'
    WHEN 7 THEN 'Central hub for elite auto brands and services.'
    WHEN 8 THEN 'Smart vehicle dealership for modern drivers.'
    WHEN 9 THEN 'Conveniently located plaza for metro area car buyers.'
    WHEN 10 THEN 'Luxurious cars with a focus on comfort and elegance.'
  END,
  description_ar = CASE id
    WHEN 1 THEN 'معرض فاخر يقدم مجموعة واسعة من السيارات الفخمة.'
    WHEN 2 THEN 'وكالة سيارات شاملة بمخزون متنوع.'
    WHEN 3 THEN 'سيارات عالية الأداء لعشاق السرعة.'
    WHEN 4 THEN 'معرض حصري للسيارات الفاخرة والنادرة.'
    WHEN 5 THEN 'وكالة موثوقة للسيارات المناسبة للمدن.'
    WHEN 6 THEN 'سيارات دفع رباعي جاهزة للصحراء وأداء قوي.'
    WHEN 7 THEN 'مركز رئيسي لعلامات السيارات المميزة والخدمات.'
    WHEN 8 THEN 'وكالة سيارات ذكية للسائقين العصريين.'
    WHEN 9 THEN 'ساحة سيارات في موقع مناسب لعملاء المنطقة الحضرية.'
    WHEN 10 THEN 'سيارات فاخرة مع تركيز على الراحة والأناقة.'
  END
WHERE id IN (1,2,3,4,5,6,7,8,9,10);

-- Showroom Makes
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (1, 1), (1, 2), (1, 3);
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (2, 2), (2, 4), (2, 5);
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (3, 1), (3, 5), (3, 6);
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (4, 3), (4, 7), (4, 8);
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (5, 4), (5, 6), (5, 9);
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (6, 5), (6, 8), (6, 10);
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (7, 1), (7, 4), (7, 7);
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (8, 2), (8, 6), (8, 9);
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (9, 3), (9, 5), (9, 10);
INSERT INTO showroom_service_makes (showroom_id, make_id) VALUES (10, 2), (10, 7), (10, 8);

-- Car Listings
INSERT INTO car_listings (
  id, seller_id, title, title_ar, description, description_ar, price, year, make_id, model_id,
  category_id, mileage, fuel_type, transmission, color, condition, location, images, status,
  is_featured, views, created_at, updated_at
) VALUES
(1, 2, 'Clean Toyota Camry 2020', 'تويوتا كامري 2020 نظيفة', 'Very clean, single owner.', 'نظيفة جدا، مالك واحد.', 1, 2020, 1, 2, 75000, 40000, 'gasoline', 'automatic', 'green', 'used', 'Riyadh', ARRAY['https://placehold.co/400x400'], 'active', true, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168'),
(2, 2, 'Honda Civic 2019', 'هوندا سيفيك 2019', 'Good condition.', 'حالة جيدة.', 2, 2019, 2, 2, 60000, 50000, 'gasoline', 'manual', 'white', 'new', 'Jeddah', ARRAY['https://placehold.co/400x400'], 'draft', false, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168'),
(3, 6, 'Ford F-150 Truck', 'فورد اف-150 شاحنة', 'Powerful truck for sale.', 'شاحنة قوية للبيع.', 3, 2021, 3, 3, 95000, 30000, 'petrol', 'automatic', 'white', 'used', 'Dammam', ARRAY['https://placehold.co/400x400'], 'pending', true, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168'),
(4, 6, 'BMW 3 Series 2018', 'بي ام دبليو ٣ - 2018', 'Luxury car, low mileage.', 'سيارة فاخرة, ممشى قليل.', 4, 2018, 4, 10, 105000, 20000, 'gasoline', 'automatic', 'gray', 'used', 'Mecca', ARRAY['https://placehold.co/400x400'], 'active', false, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168'),
(5, 9, 'Mercedes E-Class', 'مرسيدس الفئة E', 'Top condition.', 'حالة ممتازة.', 5, 2022, 5, 10, 130000, 15000, 'gasoline', 'manual', 'silver', 'new', 'Medina', ARRAY['https://placehold.co/400x400'], 'sold', false, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168'),
(6, 9, 'Tesla Model S', 'تسلا موديل S', 'Electric car, very clean.', 'سيارة كهربائية، نظيفة.', 6, 2023, 6, 8, 210000, 5000, 'hybrid', 'automatic', 'white', 'used', 'Riyadh', ARRAY['https://placehold.co/400x400'], 'active', true, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168'),
(7, 2, 'Hyundai Elantra 2020', 'هيونداي النترا 2020', 'Reliable and economic.', 'موثوقة واقتصادية.', 7, 2020, 7, 2, 58000, 30000, 'gasoline', 'automatic', 'golden', 'used', 'Jeddah', ARRAY['https://placehold.co/400x400'], 'expired', true, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168'),
(8, 6, 'Chevrolet Malibu', 'شيفروليه ماليبو', 'Smooth drive.', 'قيادة سلسة.', 8, 2019, 8, 2, 64000, 45000, 'diesel', 'automatic', 'red', 'new', 'Dammam', ARRAY['https://placehold.co/400x400'], 'draft', false, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168'),
(9, 6, 'Kia Sportage', 'كيا سبورتاج', 'Well maintained.', 'محافظ عليها جيدا.', 9, 2021, 9, 1, 78000, 28000, 'gasoline', 'manual', 'black', 'used', 'Riyadh', ARRAY['https://placehold.co/400x400'], 'active', false, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168'),
(10, 2, 'Audi A4 2020', 'أودي A4 2020', 'Like new.', 'مثل الجديدة.', 10, 2020, 10, 10, 125000, 10000, 'electric', 'automatic', 'white', 'used', 'Jeddah', ARRAY['https://placehold.co/400x400'], 'active', true, 0, '2025-04-21 21:47:30.319168', '2025-04-21 21:47:30.319168');

-- Listing Features
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(1, 1), (1, 3), (1, 5), (1, 7);
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(2, 2), (2, 4), (2, 6), (2, 8);
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(3, 1), (3, 2), (3, 9), (3, 10);
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(4, 3), (4, 5), (4, 7), (4, 9);
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(5, 4), (5, 6), (5, 8), (5, 10);
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(6, 1), (6, 5), (6, 6), (6, 7);
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(7, 2), (7, 3), (7, 8), (7, 10);
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(8, 1), (8, 4), (8, 7), (8, 9);
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(9, 2), (9, 5), (9, 6), (9, 10);
INSERT INTO car_listing_features (listing_id, feature_id) VALUES
(10, 3), (10, 4), (10, 8), (10, 9);

-- Showroom Services
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(1, 1, 150, 'QAR', 'Quick oil change service', 'خدمة تغيير الزيت السريعة', true),
(1, 3, 120, 'QAR', 'Exterior and interior car wash', 'غسيل داخلي وخارجي للسيارة', false),
(1, 5, 250, 'QAR', 'High-quality exterior polishing', 'تلميع خارجي عالي الجودة', false),
(1, 7, 300, 'QAR', 'Complete brake inspection and service', 'فحص شامل للفرامل وصيانتها', false);
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(2, 2, 200, 'QAR', 'Tire replacement with alignment', 'تبديل الإطارات مع ضبط الزوايا', false),
(2, 4, 180, 'QAR', 'Professional interior detailing', 'تنظيف داخلي احترافي', true),
(2, 6, 280, 'QAR', 'New battery installation', 'تركيب بطارية جديدة', false),
(2, 9, 350, 'QAR', 'Engine diagnostics using modern tools', 'تشخيص المحرك بأحدث الأجهزة', false);
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(3, 3, 130, 'QAR', 'Full car wash including underbody', 'غسيل كامل للسيارة بما في ذلك الهيكل السفلي', false),
(3, 8, 400, 'QAR', 'AC repair and refrigerant refill', 'تصليح المكيف وتعبئة الفريون', false),
(3, 1, 140, 'QAR', 'Synthetic oil change', 'تغيير الزيت الصناعي', true),
(3, 10, 450, 'QAR', 'Paint protection film installation', 'تركيب حماية الطلاء', false);
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(4, 2, 190, 'QAR', 'Tire replacement (4 wheels)', 'تبديل الإطارات (٤ عجلات)', false),
(4, 6, 270, 'QAR', 'Battery test and replacement', 'اختبار البطارية وتبديلها', false),
(4, 5, 220, 'QAR', 'Exterior buffing and waxing', 'تلميع وشمع خارجي', true),
(4, 9, 300, 'QAR', 'Complete engine scan', 'فحص كامل للمحرك', false);
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(5, 4, 170, 'QAR', 'Luxury interior detailing', 'تنظيف داخلي فاخر', true),
(5, 7, 310, 'QAR', 'Brake pad replacement', 'تبديل فحمات الفرامل', false),
(5, 8, 360, 'QAR', 'Air conditioning diagnostics', 'تشخيص مكيف الهواء', false),
(5, 10, 490, 'QAR', 'Nano ceramic paint protection', 'حماية الطلاء بالنانو سيراميك', false);
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(6, 1, 160, 'QAR', 'Eco oil change package', 'باقة تغيير الزيت الاقتصادية', false),
(6, 3, 110, 'QAR', 'Standard car wash', 'غسيل سيارة عادي', false),
(6, 4, 200, 'QAR', 'Detailing for leather interiors', 'تنظيف داخلي للمقاعد الجلدية', false),
(6, 9, 320, 'QAR', 'Engine health report', 'تقرير حالة المحرك', true);
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(7, 5, 240, 'QAR', 'Hand polishing with wax', 'تلميع يدوي مع شمع', false),
(7, 6, 260, 'QAR', 'Battery health check', 'فحص حالة البطارية', false),
(7, 7, 280, 'QAR', 'Brake system cleaning', 'تنظيف نظام الفرامل', false),
(7, 8, 390, 'QAR', 'AC compressor repair', 'تصليح كمبروسر المكيف', true);
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(8, 2, 210, 'QAR', 'Premium tire set installation', 'تركيب مجموعة إطارات متميزة', false),
(8, 4, 150, 'QAR', 'Vacuum and seat shampoo', 'شفط وتلميع المقاعد', false),
(8, 6, 275, 'QAR', '12V battery installation', 'تركيب بطارية 12 فولت', false),
(8, 10, 480, 'QAR', 'Full-body paint protection', 'حماية الطلاء للجسم بالكامل', true);
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(9, 1, 155, 'QAR', 'Quick lube oil service', 'خدمة تغيير الزيت السريعة', false),
(9, 7, 305, 'QAR', 'Full brake fluid replacement', 'استبدال سائل الفرامل بالكامل', false),
(9, 8, 370, 'QAR', 'AC filter replacement', 'تبديل فلتر المكيف', false),
(9, 9, 340, 'QAR', 'Engine checkup with report', 'فحص المحرك مع تقرير', true);
INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured) VALUES
(10, 3, 125, 'QAR', 'Touchless car wash', 'غسيل بدون لمس', true),
(10, 5, 230, 'QAR', 'Polishing with ceramic coating', 'تلميع مع طبقة سيراميكية', false),
(10, 7, 295, 'QAR', 'ABS brake check', 'فحص فرامل ABS', false),
(10, 10, 470, 'QAR', 'Long-term paint protection', 'حماية الطلاء طويلة الأمد', false);

INSERT INTO service_promotion_packages (
  id,
  name,
  name_ar,
  description,
  description_ar,
  price,
  currency,
  duration_days,
  is_featured,
  priority,
  is_active,
  created_at
) VALUES
  (1, 'Basic Promo', 'عرض ترويجي أساسي', 'Highlight your service for 3 days in basic listings.', 'تمييز خدمتك لمدة 3 أيام في القوائم الأساسية.', 10, 'QAR', 3, FALSE, 1, TRUE, '2025-05-13 22:08:02.45357'),
  (2, 'Featured Spotlight', 'ترويج مميز', 'Get top placement and more visibility for a week.', 'احصل على مكانة عالية ورؤية أفضل لمدة أسبوع.', 25, 'QAR', 7, TRUE, 3, TRUE, '2025-05-13 22:08:02.45357'),
  (3, 'Weekend Boost', 'تعزيز عطلة نهاية الأسبوع', 'Boost your listing over the weekend to increase bookings.', 'عزز قائمتك في عطلة نهاية الأسبوع لزيادة الحجز.', 15, 'QAR', 2, TRUE, 2, TRUE, '2025-05-13 22:08:02.45357'),
  (4, 'Monthly Power Pack', 'باقة الطاقة الشهرية', 'Maximum exposure for 30 days, including homepage placement.', 'أقصى ظهور لمدة 30 يومًا، بما في ذلك الظهور في الصفحة الرئيسية.', 90, 'QAR', 30, TRUE, 5, TRUE, '2025-05-13 22:08:02.45357');


INSERT INTO service_bookings (user_id, service_id, scheduled_at, status, notes, created_at) VALUES
(1, 2, NOW() + INTERVAL '1 day', 'confirmed', 'Urgent battery replacement', NOW()),
(1, 9, NOW() + INTERVAL '3 days', 'pending', 'Wants full detailing', NOW()),
(1, 15, NOW() + INTERVAL '7 days', 'draft', NULL, NOW()),
(1, 20, NOW() + INTERVAL '6 days', 'confirmed', 'Add tire rotation if needed', NOW()),
(1, 26, NOW() + INTERVAL '2 days', 'complete', NULL, NOW()),
(1, 32, NOW() + INTERVAL '10 days', 'confirmed', 'Customer prefers afternoon', NOW()),
(1, 7, NOW() + INTERVAL '4 days', 'confirmed', 'Needs pre-sale inspection', NOW()),
(1, 19, NOW() + INTERVAL '8 days', 'pending', NULL, NOW()),
(1, 33, NOW() + INTERVAL '5 days', 'rejected', 'Service unavailable', NOW()),
(1, 38, NOW() + INTERVAL '9 days', 'confirmed', 'Customer bringing extra vehicle', NOW());
INSERT INTO service_bookings (user_id, service_id, scheduled_at, status, notes, created_at) VALUES
(9, 5, NOW() + INTERVAL '2 days', 'confirmed', 'Please check brakes thoroughly', NOW()),
(9, 12, NOW() + INTERVAL '5 days', 'pending', 'Request early morning appointment', NOW()),
(9, 18, NOW() + INTERVAL '7 days', 'draft', NULL, NOW()),
(9, 22, NOW() + INTERVAL '1 day', 'confirmed', 'Customer will bring own oil', NOW()),
(9, 27, NOW() + INTERVAL '10 days', 'complete', NULL, NOW()),
(9, 8, NOW() + INTERVAL '3 days', 'pending', 'Needs pickup and drop-off', NOW()),
(9, 14, NOW() + INTERVAL '6 days', 'confirmed', NULL, NOW()),
(9, 30, NOW() + INTERVAL '8 days', 'confirmed', 'Wants ceramic coat review', NOW()),
(9, 3, NOW() + INTERVAL '4 days', 'rejected', 'Cancelled due to conflict', NOW()),
(9, 36, NOW() + INTERVAL '9 days', 'confirmed', NULL, NOW());


-- Favourites
INSERT INTO favorites (user_id, listing_id, created_at) VALUES
(1, 1, NOW()),
(1, 2, NOW() - INTERVAL '1 day'),
(1, 3, NOW() - INTERVAL '2 days'),
(1, 4, NOW() - INTERVAL '3 days'),
(1, 5, NOW() - INTERVAL '4 days'),
(1, 6, NOW() - INTERVAL '5 days'),
(1, 7, NOW() - INTERVAL '6 days'),
(1, 8, NOW() - INTERVAL '7 days'),
(1, 9, NOW() - INTERVAL '8 days'),
(1, 10, NOW() - INTERVAL '9 days');
INSERT INTO favorites (user_id, listing_id, created_at) VALUES
(9, 10, NOW()),
(9, 9, NOW() - INTERVAL '1 day'),
(9, 8, NOW() - INTERVAL '2 days'),
(9, 7, NOW() - INTERVAL '3 days'),
(9, 6, NOW() - INTERVAL '4 days'),
(9, 5, NOW() - INTERVAL '5 days'),
(9, 4, NOW() - INTERVAL '6 days'),
(9, 3, NOW() - INTERVAL '7 days'),
(9, 2, NOW() - INTERVAL '8 days'),
(9, 1, NOW() - INTERVAL '9 days');

-- Messages
-- Messages between user_ids 1 to 11
INSERT INTO messages (sender_id, receiver_id, recipient_type, type, listing_id, title, content, status, sent_at)
VALUES
(1, 2, 'customer', 'email', 1, 'Interested in your listing', 'Can I schedule a viewing?', 'sent', NOW()),
(1, 3, 'customer', 'sms', 2, 'Price negotiable?', 'Is the listed price final?', 'read', NOW() - INTERVAL '1 day'),
(1, 4, 'customer', 'email', NULL, 'Available?', 'Is the vehicle still available?', 'unread', NOW() - INTERVAL '2 days'),
(1, 5, 'customer', 'sms', 1, 'Test Drive Request', 'Can I come test it this weekend?', 'sent', NOW() - INTERVAL '3 days'),
(2, 1, 'showroom', 'email', 2, 'Viewing Confirmed', 'Sure, lets schedule it at 4PM.', 'read', NOW()),
(2, 3, 'customer', 'sms', 3, 'Listing Expiry', 'Reminder: Your listing will expire soon.', 'sent', NOW()),
(2, 4, 'showroom', 'email', NULL, 'Welcome Aboard', 'Thanks for joining our platform.', 'unread', NOW()),
(2, 6, 'customer', 'sms', 2, 'Negotiation', 'Can you offer a better deal?', 'sent', NOW()),
(3, 2, 'customer', 'email', 4, 'Payment Options', 'Do you offer financing?', 'read', NOW()),
(3, 5, 'showroom', 'sms', NULL, 'Pickup Request', 'Pickup needed at 10AM tomorrow.', 'sent', NOW()),
(3, 1, 'customer', 'email', NULL, 'Inquiry', 'Can I list multiple cars?', 'sent', NOW()),
(3, 6, 'showroom', 'sms', 4, 'Car Images', 'Please upload interior photos.', 'unread', NOW()),
(4, 2, 'customer', 'email', 5, 'Service Time', 'How long does detailing take?', 'read', NOW()),
(4, 7, 'showroom', 'sms', NULL, 'Missed Call', 'Tried to reach you this morning.', 'sent', NOW()),
(4, 8, 'customer', 'email', NULL, 'Follow-Up', 'Any update on the inquiry?', 'unread', NOW()),
(4, 9, 'customer', 'email', 3, 'Listing Error', 'Image not displaying.', 'failed', NOW()),
(5, 3, 'showroom', 'email', 6, 'Service Request', 'Need maintenance for brakes.', 'sent', NOW()),
(5, 10, 'customer', 'sms', NULL, 'Late Response', 'Haven’t heard back yet.', 'unread', NOW()),
(5, 1, 'customer', 'email', NULL, 'Thanks', 'Appreciate the quick reply!', 'read', NOW()),
(6, 4, 'customer', 'email', 7, 'Trade-in Option', 'Do you accept trade-ins?', 'sent', NOW()),
(6, 5, 'customer', 'sms', NULL, 'Service Delay', 'Still waiting on update.', 'read', NOW()),
(6, 2, 'customer', 'email', NULL, 'Platform Help', 'How to change password?', 'sent', NOW()),
(7, 5, 'customer', 'email', 8, 'Interested Buyer', 'I have someone interested.', 'read', NOW()),
(7, 6, 'showroom', 'sms', NULL, 'Delivery Time?', 'When can I expect it?', 'sent', NOW()),
(7, 9, 'customer', 'email', NULL, 'Feedback', 'Great experience with your service.', 'read', NOW()),
(8, 10, 'customer', 'email', 9, 'Listing Edits', 'Can you update the year?', 'unread', NOW()),
(8, 2, 'showroom', 'sms', NULL, 'Contact Request', 'Please reach out ASAP.', 'sent', NOW()),
(8, 11, 'customer', 'email', NULL, 'Partnership', 'Interested in collaboration.', 'sent', NOW()),
(9, 3, 'showroom', 'email', 10, 'Inspection', 'Can we meet tomorrow?', 'sent', NOW()),
(9, 6, 'customer', 'sms', NULL, 'Urgent Help', 'Need to fix image upload issue.', 'read', NOW()),
(9, 7, 'customer', 'email', NULL, 'Callback Request', 'Please call after 5PM.', 'unread', NOW()),
(10, 4, 'customer', 'email', NULL, 'Ad Boost', 'How to feature my ad?', 'read', NOW()),
(10, 8, 'customer', 'sms', 6, 'Car Status', 'Is it still on the lot?', 'sent', NOW()),
(10, 1, 'showroom', 'email', NULL, 'Support Needed', 'Need help updating my profile.', 'sent', NOW()),
(11, 2, 'customer', 'email', NULL, 'Offer Sent', 'Sent an offer through the system.', 'sent', NOW()),
(11, 9, 'showroom', 'sms', NULL, 'Reminder', 'Service booking tomorrow.', 'read', NOW()),
(11, 7, 'customer', 'email', 5, 'Invoice Needed', 'Can you send an invoice?', 'sent', NOW()),
(11, 6, 'customer', 'email', NULL, 'Bug Report', 'Images not loading on mobile.', 'draft', NOW());

-- Subscription plans
INSERT INTO subscription_plans (
  name, name_ar, description, description_ar, price, currency, duration_days,
  listing_limit, featured_listing_limit, priority_listing,
  showroom_limit, service_limit, is_active, created_at
) VALUES
('Starter Plan', 'الخطة الأساسية', 
 'A simple plan for casual users.', 'خطة بسيطة للمستخدمين العاديين.', 
 99, 'QAR', 30, 
 10, 2, FALSE, 
 1, 2, TRUE, NOW()),
('Pro Seller', 'البائع المحترف', 
 'Designed for active sellers with more inventory.', 'مصممة للبائعين النشطين مع المزيد من السيارات.', 
 299, 'QAR', 90, 
 50, 10, TRUE, 
 2, 5, TRUE, NOW()),
('Showroom Premium', 'معرض بريميوم', 
 'Premium plan for showrooms with high visibility.', 'خطة بريميوم للمعارض مع رؤية عالية.', 
 799, 'QAR', 180, 
 200, 50, TRUE, 
 5, 20, TRUE, NOW());

-- Promotion Packages
 INSERT INTO promotion_packages (
  name, name_ar, description, description_ar, price, currency, duration_days,
  is_featured, priority, is_active, created_at
) VALUES
('Basic Boost', 'تعزيز أساسي',
 'A basic promotion to increase listing views.', 'ترقية أساسية لزيادة مشاهدات الإعلان.',
 20, 'QAR', 7,
 FALSE, 0, TRUE, NOW()),
('Featured Highlight', 'تمييز مميز',
 'Make your listing stand out on search results.', 'اجعل إعلانك يبرز في نتائج البحث.',
 50, 'QAR', 14,
 TRUE, 1, TRUE, NOW()),
('Premium Spotlight', 'تسليط الضوء المميز',
 'Top-tier visibility and placement on homepage.', 'رؤية عالية المستوى ووضع في الصفحة الرئيسية.',
 100, 'QAR', 30,
 TRUE, 3, TRUE, NOW()),
('Urgent Sale', 'بيع عاجل',
 'Short-term priority promotion for quick deals.', 'ترقية قصيرة المدى للبيع السريع.',
 35, 'QAR', 5,
 TRUE, 2, TRUE, NOW()),
('Off-season Saver', 'عرض خارج الموسم',
 'Affordable promo package during off-peak months.', 'باقة ترويجية بأسعار معقولة خارج موسم الذروة.',
 10, 'QAR', 10,
 FALSE, 0, FALSE, NOW());

-- Listing Promotions
INSERT INTO listing_promotions (
  listing_id, package_id, start_date, end_date, transaction_id, is_active, created_at
) VALUES
(1, 2, NOW(), NOW() + INTERVAL '14 days', NULL, TRUE, NOW()),
(3, 3, NOW(), NOW() + INTERVAL '30 days', NULL, TRUE, NOW()),
(6, 1, NOW(), NOW() + INTERVAL '7 days', NULL, TRUE, NOW()),
(7, 4, NOW(), NOW() + INTERVAL '5 days', NULL, TRUE, NOW()),
(10, 5, NOW(), NOW() + INTERVAL '10 days', NULL, TRUE, NOW());

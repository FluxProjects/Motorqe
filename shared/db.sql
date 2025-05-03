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
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role_id INTEGER REFERENCES roles(id),
  is_email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  password_reset_token TEXT,
  avatar TEXT,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT TRUE,
  notification_email TEXT,
  notification_phone TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'suspended', 'removed')),
  created_at TIMESTAMP DEFAULT NOW()
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
  is_main_branch BOOLEAN DEFAULT FALSE,
  parent_id INTEGER REFERENCES showrooms(id) ON DELETE SET NULL,
  address TEXT,
  address_ar TEXT,
  location TEXT,
  phone TEXT,
  logo TEXT
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
  seller_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT NOT NULL,
  description_ar TEXT,
  price INTEGER NOT NULL,
  year INTEGER NOT NULL,
  make_id INTEGER NOT NULL,
  model_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  color TEXT NOT NULL,
  condition TEXT NOT NULL,
  location TEXT NOT NULL,
  images TEXT[], -- PostgreSQL array type
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'sold', 'expired', 'rejected')),
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
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
CREATE TABLE static_content (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_ar TEXT,
  content TEXT
);

-- Subscription Plans
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  duration_days INTEGER NOT NULL,
  listing_limit INTEGER,
  featured_listing_limit INTEGER DEFAULT 0,
  priority_listing BOOLEAN DEFAULT FALSE,
  showroom_limit INTEGER DEFAULT 0,
  service_limit INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions Status
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  subscription_id INTEGER REFERENCES user_subscriptions(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
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
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Listing Promotions
CREATE TABLE listing_promotions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES car_listings(id),
  package_id INTEGER NOT NULL REFERENCES promotion_packages(id),
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP NOT NULL,
  transaction_id INTEGER REFERENCES transactions(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service Packages
CREATE TABLE service_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  duration_days INTEGER NOT NULL,
  service_limit INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Showroom Service Subscription
CREATE TABLE showroom_service_subscriptions (
  id SERIAL PRIMARY KEY,
  showroom_id INTEGER NOT NULL REFERENCES showrooms(id),
  package_id INTEGER NOT NULL REFERENCES service_packages(id),
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP NOT NULL,
  transaction_id INTEGER REFERENCES transactions(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
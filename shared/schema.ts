import { pgTable, text, serial, integer, boolean, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { roleSchema } from "./permissions";

// =============================================
// ROLES TABLE
// Stores user roles and permissions
// =============================================
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),          // Role name in English
  nameAr: text("name_ar").notNull(),             // Role name in Arabic
  description: text("description"),               // Role description
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  nameAr: true,
  description: true,
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// =============================================
// USERS TABLE
// Stores user account information
// =============================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),  // Unique username
  email: text("email").notNull().unique(),        // User email address
  phone: text("phone"),                           // User phone number
  password: text("password").notNull(),           // Hashed password
  firstName: text("first_name"),                  // First name
  lastName: text("last_name"),                    // Last name
  roleId: integer("role_id").references(() => roles.id), // Foreign key to roles
  isEmailVerified: boolean("is_email_verified").default(false), // Email verification status
  verificationToken: text("verification_token"),  // Email verification token
  passwordResetToken: text("password_reset_token"), // Password reset token
  avatar: text("avatar"),                         // Profile picture URL
  emailNotifications: boolean("email_notifications").default(true), // Email notifications preference
  smsNotifications: boolean("sms_notifications").default(true), // SMS notifications preference
  notificationEmail: text("notification_email"),  // Alternate notification email
  notificationPhone: text("notification_phone"),  // Alternate notification phone
  status: text("status").default("inactive").notNull().$type<"inactive" | "active" | "suspended" | "removed">(),      // Account status (active, suspended, etc.)
  createdAt: timestamp("created_at").defaultNow(), // Account creation timestamp
});

export const insertUserSchema = createInsertSchema(users, {
  roleId: roleSchema,
}).pick({
  firstName: true,
  lastName: true,
  username: true,
  email: true,
  phone: true,
  password: true,
  roleId: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, 'password'>;

// =============================================
// USER ROLES SWITCH TABLE
// Tracks user role switching (buyer/seller)
// =============================================
export const userRolesSwitch = pgTable("user_roles_switch", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // User ID
  role: text("role").notNull(),                   // Role being switched to
  isActive: boolean("is_active").default(false),   // Is this role currently active?
  createdAt: timestamp("created_at").defaultNow(), // Switch timestamp
});

export const insertUserRoleSwitchSchema = createInsertSchema(userRolesSwitch).pick({
  userId: true,
  role: true,
  isActive: true,
});

export type InsertUserRoleSwitch = z.infer<typeof insertUserRoleSwitchSchema>;
export type UserRoleSwitch = typeof userRolesSwitch.$inferSelect;

// =============================================
// SHOWROOMS TABLE
// Stores car dealership/showroom information
// =============================================
export const showrooms = pgTable("showrooms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // Owner user ID
  name: text("name").notNull(),                   // Showroom name in English
  nameAr: text("name_ar"),                        // Showroom name in Arabic
  isMainBranch: boolean("is_main_branch").default(false), // Is this the main branch?
  parentId: integer("parent_id"),
  // Parent showroom for branches
  address: text("address"),                       // Physical address
  addressAr: text("address_ar"),                  // Physical address in Arabic
  location: text("location"),                     // Geographic location
  phone: text("phone"),                            // Contact phone number
  logo: text("logo"),
  isFeatured: boolean('is_featured').default(false),
});

export const insertShowroomSchema = createInsertSchema(showrooms).pick({
  userId: true,
  name: true,
  nameAr: true,
  isMainBranch: true,
  parentId: true,
  address: true,
  addressAr: true,
  location: true,
  phone: true,
  logo: true,
  isFeatured: true,
});

export type InsertShowroom = z.infer<typeof insertShowroomSchema>;
export type Showroom = typeof showrooms.$inferSelect;

// =============================================
// SHOWROOM SERVICE MAKES TABLE
// Stores which car makes a showroom services
// =============================================
export const showroomMakes = pgTable("showroom_service_makes", {
  id: serial("id").primaryKey(),
  showroomId: integer("showroom_id").references(() => showrooms.id).notNull(), // Service ID
  makeId: integer("make_id").references(() => carMakes.id).notNull() // Car make ID
});

export const insertShowroomMakeSchema = createInsertSchema(showroomMakes).pick({
  showroomId: true,
  makeId: true,
});

export type InsertShowroomMake = z.infer<typeof insertShowroomMakeSchema>;
export type ShowroomMake = typeof showroomMakes.$inferSelect;

// =============================================
// CAR CATEGORIES TABLE
// Stores vehicle categories (SUV, Sedan, etc.)
// =============================================
export const carCategories = pgTable("car_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),                   // Category name in English
  nameAr: text("name_ar").notNull(),              // Category name in Arabic
  image: text("image").notNull(),                 // Category image URL
  count: integer("count").default(0),            // Number of cars in this category
});

export const insertCarCategorySchema = createInsertSchema(carCategories).pick({
  name: true,
  nameAr: true,
  image: true,
});

export type InsertCarCategory = z.infer<typeof insertCarCategorySchema>;
export type CarCategory = typeof carCategories.$inferSelect;

// =============================================
// CAR MAKES TABLE
// Stores vehicle manufacturers (Toyota, BMW, etc.)
// =============================================
export const carMakes = pgTable("car_makes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),                   // Make name in English
  nameAr: text("name_ar").notNull(),              // Make name in Arabic
  image: text("image").notNull(),                 // Make logo/image URL
});

export const insertCarMakeSchema = createInsertSchema(carMakes).pick({
  name: true,
  nameAr: true,
  image: true,
});

export type InsertCarMake = z.infer<typeof insertCarMakeSchema>;
export type CarMake = typeof carMakes.$inferSelect;

// =============================================
// CAR MODELS TABLE
// Stores vehicle models (Corolla, Camry, etc.)
// =============================================
export const carModels = pgTable("car_models", {
  id: serial("id").primaryKey(),
  makeId: integer('make_id').references(() => carMakes.id, { onDelete: 'cascade' }),          // Foreign key to car_makes
  name: text("name").notNull(),                   // Model name in English
  nameAr: text("name_ar").notNull(),              // Model name in Arabic
});

export const insertCarModelSchema = createInsertSchema(carModels).pick({
  makeId: true,
  name: true,
  nameAr: true,
});

export type InsertCarModel = z.infer<typeof insertCarModelSchema>;
export type CarModel = typeof carModels.$inferSelect;

// =============================================
// CAR FEATURES TABLE
// Stores available car features (Sunroof, GPS, etc.)
// =============================================
export const carFeatures = pgTable("car_features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),                   // Feature name in English
  nameAr: text("name_ar")                         // Feature name in Arabic
});

export const insertCarFeatureSchema = createInsertSchema(carFeatures).pick({
  name: true,
  nameAr: true,
});

export type InsertCarListingFeature = z.infer<typeof insertCarListingFeatureSchema>;
export type CarListingFeature = typeof carListingFeatures.$inferSelect;

// =============================================
// SERVICES TABLE
// Stores available services (Maintenance, Detailing, etc.)
// =============================================
export const carServices = pgTable("car_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),                   // Service name in English
  nameAr: text("name_ar"),                        // Service name in Arabic
  image: text("image")                            // Service Image
});

export const insertCarServiceSchema = createInsertSchema(carServices).pick({
  name: true,
  nameAr: true,
  image: true,
});

export type InsertCarService = z.infer<typeof insertCarServiceSchema>;
export type CarService = typeof carServices.$inferSelect;

// =============================================
// CAR LISTINGS TABLE
// Stores vehicle listings posted by users
// =============================================
export const carListings = pgTable("car_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),       // Foreign key to users table
  title: text("title").notNull(),                 // Listing title in English
  titleAr: text("title_ar"),                      // Listing title in Arabic
  description: text("description").notNull(),     // Detailed description in English
  descriptionAr: text("description_ar"),          // Detailed description in Arabic
  price: integer("price").notNull(),              // Vehicle price
  currency: text("currency"),
  year: integer("year").notNull(),                // Manufacturing year
  makeId: integer("make_id").notNull(),           // Foreign key to car_makes
  modelId: integer("model_id").notNull(),         // Foreign key to car_models
  categoryId: integer("category_id").notNull(),   // Foreign key to car_categories
  mileage: integer("mileage").notNull(),          // Vehicle mileage
  fuelType: text("fuel_type").notNull(),          // Fuel type (gasoline, diesel, etc.)
  transmission: text("transmission").notNull(),   // Transmission type (automatic, manual)
  color: text("color").notNull(),                 // Vehicle color
  condition: text("condition").notNull(),         // Vehicle condition (new, used, etc.)
  location: text("location").notNull(),           // Vehicle location
  images: text("images").array(),                 // Array of image URLs
  status: text("status").default("draft").notNull().$type<"draft" | "pending" | "active" | "sold" | "expired" | "rejected">(), // Listing status
  isFeatured: boolean("is_featured").default(false), // Featured listing flag
  views: integer("views").default(0),             // View count
  createdAt: timestamp("created_at").defaultNow(), // Creation timestamp
  updatedAt: timestamp("updated_at"),             // Last update timestamp
});

export const insertCarListingSchema = createInsertSchema(carListings).pick({
  sellerId: true,
  title: true,
  titleAr: true,
  description: true,
  descriptionAr: true,
  price: true,
  currency: true,
  year: true,
  makeId: true,
  modelId: true,
  categoryId: true,
  mileage: true,
  fuelType: true,
  transmission: true,
  color: true,
  condition: true,
  location: true,
  isFeatured: true,
  images: true,
  status: true,
});

export type InsertCarListing = z.infer<typeof insertCarListingSchema>;
export type CarListing = typeof carListings.$inferSelect;

// =============================================
// CAR LISTING FEATURES TABLE
// Junction table for car listings and their features
// =============================================
export const carListingFeatures = pgTable("car_listing_features", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => carListings.id).notNull(), // Foreign key to car_listings
  featureId: integer("feature_id").references(() => carFeatures.id).notNull(), // Foreign key to car_features
});

export const insertCarListingFeatureSchema = createInsertSchema(carListingFeatures).pick({
  listingId: true,
  featureId: true,
});

export type InsertCarFeature = z.infer<typeof insertCarFeatureSchema>;
export type CarFeature = typeof carFeatures.$inferSelect;

// =============================================
// SHOWROOM SERVICES TABLE
// Stores services offered by showrooms
// =============================================
export const showroomServices = pgTable("showroom_services", {
  id: serial("id").primaryKey(),
  showroomId: integer("showroom_id").references(() => showrooms.id).notNull(), // Showroom ID
  serviceId: integer("service_id").references(() => carServices.id).notNull(), // Service ID
  price: integer("price").notNull(),                  // Service price
  currency: text("currency").default("QAR"),          // Currency code
  description: text("description"),                   // Service description in English
  descriptionAr: text("description_ar"),              // Service description in Arabic
  isFeatured: boolean("is_featured").default(false),  // Featured listing flag
  isActive: boolean("is_active").default(true),
});

export const insertShowroomServiceSchema = createInsertSchema(showroomServices).pick({
  showroomId: true,
  serviceId: true,
  price: true,
  currency: true,
  description: true,
  descriptionAr: true,
  isFeatured: true,
  isActive: true,
});

export type InsertShowroomService = z.infer<typeof insertShowroomServiceSchema>;
export type ShowroomService = typeof showroomServices.$inferSelect;

// =============================================
// SERVICE BOOKINGS TABLE
// Stores user bookings for showroom services
// =============================================
export const serviceBookings = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // Booking user ID
  serviceId: integer("service_id").references(() => showroomServices.id).notNull(), // Service ID
  scheduledAt: timestamp("scheduled_at").notNull(), // Scheduled service time
  price: integer("price").notNull(),                  // Service price
  currency: text("currency").default("QAR"), 
  status: text("status").default("draft").notNull().$type<"draft" | "pending" | "confirmed" | "complete" | "expired" | "rejected">(),      // Booking status
  notes: text("notes"),                           // Additional notes
  createdAt: timestamp("created_at").defaultNow(), // Booking creation time
});

export const insertServiceBookingSchema = createInsertSchema(serviceBookings).pick({
  userId: true,
  serviceId: true,
  scheduledAt: true,
  price: true,
  currency: true,
  status: true,
  notes: true,
});

export type InsertServiceBooking = z.infer<typeof insertServiceBookingSchema>;
export type ServiceBooking = typeof serviceBookings.$inferSelect;

// =============================================
// FAVORITES TABLE
// Stores user favorite car listings
// =============================================
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),           // Foreign key to users
  carId: integer('listing_id').references(() => carListings.id, { onDelete: 'cascade' }),           // Foreign key to car_listings
  createdAt: timestamp("created_at").defaultNow(), // Timestamp when favorited
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  carId: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// =============================================
// MESSAGES TABLE
// Stores communication between users
// =============================================
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'set null' }),
  receiverId: integer('receiver_id').references(() => users.id, { onDelete: 'set null' }),   // Foreign key to receiver user
  recipientType: text("recipient_type"), // Type of recipient (customer, showroom)
  type: text("type").notNull(),                   // Message type (email, sms)
  listingId: integer('listing_id').references(() => carListings.id, { onDelete: 'set null' }), // Related car listing
  title: text("title"),
  content: text("content").notNull(),             // Message content
  status: text("status").default("draft").notNull().$type<"draft" | "sent" | "failed" | "read" | "unread">(),            // Delivery status
  sentAt: timestamp("sent_at"),                   // When message was sent
  error: text("error"),                           // Error message if delivery failed
  createdAt: timestamp("created_at").defaultNow(), // Creation timestamp
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  recipientType: true,
  listingId: true,
  type: true,
  status: true,
  title: true,
  content: true,
  sentAt: true,
  error: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// =============================================
// REPORTS TABLE
// Stores user reports about listings or other users
// =============================================
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),           // Foreign key to reporting user
  carId: uuid('car_id').references(() => carListings.id, { onDelete: 'cascade' }),           // Foreign key to reported car
  reason: text("reason").notNull(),               // Report reason
  details: text("details"),                       // Additional details
  status: text("status").default("pending").notNull().$type<"pending" | "resolved" | "under_investigation">(), // Report status
  createdAt: timestamp("created_at").defaultNow(), // Creation timestamp
});

export const insertReportSchema = createInsertSchema(reports).pick({
  userId: true,
  carId: true,
  reason: true,
  details: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// =============================================
// SEARCH HISTORY TABLE
// Stores user search queries
// =============================================
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),           // Foreign key to user
  query: text("query").notNull(),                 // Search query text
  createdAt: timestamp("created_at").defaultNow(), // Search timestamp
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).pick({
  userId: true,
  query: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// =============================================
// STATIC CONTENT TABLE
// Stores CMS content (About Us, Terms, etc.)
// =============================================
export const staticContent = pgTable("static_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),            // Content key/identifier
  title: text("title").notNull(),                 // Content title in English
  titleAr: text("title_ar"),                      // Content title in Arabic
  content: text("content").notNull(),             // Content body in English
  contentAr: text("content_ar"),                  // Content body in Arabic
  author: integer("user_id").references(() => users.id).notNull(), // Owner user ID
  status: text('status').default("draft").notNull().$type<"draft" | "published">(),
  fullWidth: boolean('full_width').default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(), // Last update timestamp
});

export const insertStaticContentSchema = createInsertSchema(staticContent).pick({
  key: true,
  title: true,
  titleAr: true,
  content: true,
  contentAr: true,
  author: true,
  status: true,
  fullWidth: true,
});

export type InsertStaticContent = z.infer<typeof insertStaticContentSchema>;
export type StaticContent = typeof staticContent.$inferSelect;

// =============================================
// SETTINGS TABLE
// Stores application configuration
// =============================================
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),

  // General Settings
  logo: text("logo"),                             // Application logo URL
  favicon: text("favicon"),                       // Favicon URL
  siteName: text("site_name").default("CarMarket"), // Site name in English
  siteNameAr: text("site_name_ar").default("سوق السيارات"), // Site name in Arabic
  siteDescription: text("site_description"),      // Site description in English
  siteDescriptionAr: text("site_description_ar"), // Site description in Arabic
  contactEmail: text("contact_email"),            // Contact email address
  phoneNumber: text("phone_number"),              // Contact phone number
  address: text("address"),                       // Physical address in English
  addressAr: text("address_ar"),                  // Physical address in Arabic
  primaryColor: text("primary_color").default("#3563E9"), // Primary brand color
  secondaryColor: text("secondary_color").default("#1A202C"), // Secondary brand color

  // Features & Limits
  enableRegistration: boolean("enable_registration").default(true), // Allow new user registration
  requireEmailVerification: boolean("require_email_verification").default(false), // Require email verification
  allowUserRating: boolean("allow_user_rating").default(true), // Allow user ratings
  maxListingsPerUser: integer("max_listings_per_user").default(5), // Max listings per user
  maxImagesPerListing: integer("max_images_per_listing").default(10), // Max images per listing

  // Email Settings
  emailConfig: jsonb("email_config").$type<{
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableEmailNotifications: boolean;
    newListingTemplate: string;
    newMessageTemplate: string;
  }>(), // SMTP email configuration

  // SMS and Google Maps Configurations
  smsConfig: jsonb("sms_config").$type<{
    provider: 'twilio' | 'nexmo';
    accountSid: string;
    authToken: string;
    fromNumber: string;
    enableSmsNotifications: boolean;
  }>(),

  googleMapsConfig: jsonb("google_maps_config").$type<{
    apiKey: string;
    defaultZoom: number;
    defaultLatitude: number;
    defaultLongitude: number;
  }>(),

  // Integration Settings
  integrations: jsonb("integrations").$type<{
    enableGoogleAnalytics: boolean;
    googleAnalyticsId: string;
    enableFacebookPixel: boolean;
    facebookPixelId: string;
    enableLocationMap: boolean;
    googleMapsApiKey: string;
    enablePayments: boolean;
    paymentGateway: 'stripe' | 'paypal';
    stripePublicKey: string;
    stripeSecretKey: string;
    paypalClientId: string;
    paypalSecret: string;
  }>(), // Third-party integrations

  // Localization
  allowedLanguages: text("allowed_languages").array().default(["en", "ar"]), // Supported languages
  defaultLanguage: text("default_language").default("en"), // Default language

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(), // Creation timestamp
  updatedAt: timestamp("updated_at").defaultNow(), // Last update timestamp
});

// Email config schema
const emailConfigSchema = z.object({
  smtpServer: z.string().min(1, "SMTP server is required"),
  smtpPort: z.number().int().positive(),
  smtpUsername: z.string().min(1, "Username is required"),
  smtpPassword: z.string().min(1, "Password is required"),
  fromEmail: z.string().email("Invalid email format"),
  fromName: z.string().min(1, "From name is required"),
  enableEmailNotifications: z.boolean().default(true),
  newListingTemplate: z.string().optional(),
  newMessageTemplate: z.string().optional(),
});

// SMS config schema
const smsConfigSchema = z.object({
  provider: z.enum(['twilio', 'nexmo']),
  accountSid: z.string().min(1, "Account SID is required"),
  authToken: z.string().min(1, "Auth token is required"),
  fromNumber: z.string().min(1, "From number is required"),
  enableSmsNotifications: z.boolean().default(false),
});

// Google Maps config schema
const googleMapsConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  defaultZoom: z.number().min(0).max(21).default(12),
  defaultLatitude: z.number().min(-90).max(90).default(25.276987),  // e.g., Dubai latitude
  defaultLongitude: z.number().min(-180).max(180).default(55.296249), // e.g., Dubai longitude
});

// Integrations schema
const integrationsSchema = z.object({
  enableGoogleAnalytics: z.boolean().default(false),
  googleAnalyticsId: z.string().optional(),
  enableFacebookPixel: z.boolean().default(false),
  facebookPixelId: z.string().optional(),
  enableLocationMap: z.boolean().default(false),
  googleMapsApiKey: z.string().optional(),
  enablePayments: z.boolean().default(false),
  paymentGateway: z.enum(['stripe', 'paypal']).optional(),
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  paypalClientId: z.string().optional(),
  paypalSecret: z.string().optional(),
});

export const insertSettingsSchema = createInsertSchema(settings).extend({
  emailConfig: emailConfigSchema,
  smsConfig: smsConfigSchema,
  googleMapsConfig: googleMapsConfigSchema,
  integrations: integrationsSchema,
}).pick({
  logo: true,
  favicon: true,
  siteName: true,
  siteNameAr: true,
  siteDescription: true,
  siteDescriptionAr: true,
  contactEmail: true,
  phoneNumber: true,
  address: true,
  addressAr: true,
  primaryColor: true,
  secondaryColor: true,
  enableRegistration: true,
  requireEmailVerification: true,
  allowUserRating: true,
  maxListingsPerUser: true,
  maxImagesPerListing: true,
  emailConfig: true,
  smsConfig: true,
  googleMapsConfig: true,
  integrations: true,
  allowedLanguages: true,
  defaultLanguage: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type EmailConfig = z.infer<typeof emailConfigSchema>;
export type SmsConfig = z.infer<typeof smsConfigSchema>;
export type GoogleMapsConfig = z.infer<typeof googleMapsConfigSchema>;
export type IntegrationSettings = z.infer<typeof integrationsSchema>;
export type Settings = typeof settings.$inferSelect;

// =============================================
// SUBSCRIPTION PLANS TABLE
// Stores available subscription plans for users
// =============================================
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),                   // Plan name
  nameAr: text("name_ar"),                        // Plan name in Arabic
  description: text("description"),               // Plan description
  descriptionAr: text("description_ar"),          // Plan description in Arabic
  price: integer("price").notNull(),              // Monthly price
  stripePriceId: text("stripe_price_id").notNull(),
  currency: text("currency").default("USD"),      // Currency code
  durationDays: integer("duration_days").notNull(), // Duration in days
  listingLimit: integer("listing_limit"),         // Max active listings (null for unlimited)
  featuredListingLimit: integer("featured_listing_limit").default(0), // Max featured listings
  priorityListing: boolean("priority_listing").default(false), // Gets priority in search
  showroomLimit: integer("showroom_limit").default(0), // Max showrooms allowed
  serviceLimit: integer("service_limit").default(0), // Max services allowed
  isActive: boolean("is_active").default(true),   // Whether plan is available
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  price: true,
  stripePriceId: true,
  currency: true,
  durationDays: true,
  listingLimit: true,
  featuredListingLimit: true,
  priorityListing: true,
  showroomLimit: true,
  serviceLimit: true,
  isActive: true,
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// =============================================
// USER SUBSCRIPTIONS TABLE
// Stores user subscriptions to plans
// =============================================
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  autoRenew: boolean("auto_renew").default(false),
  transactionId: integer("transaction_id").references(() => transactions.id),  // Payment processor ID
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).pick({
  userId: true,
  planId: true,
  startDate: true,
  endDate: true,
  isActive: true,
  autoRenew: true,
  transactionId: true,
});

export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

// =============================================
// TRANSACTIONS TABLE
// Stores payment transactions
// =============================================
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),            // Amount in smallest currency unit
  currency: text("currency").default("USD").notNull(),          // Currency code
  description: text("description").notNull(),     // Transaction description
  paymentMethod: text("payment_method").notNull(), // 'credit_card', 'paypal', etc.
  paymentId: text("payment_id").notNull(),        // Payment processor ID
  status: text("status").notNull().$type<'pending' | 'completed' | 'failed' | 'refunded'>(),
  metadata: jsonb("metadata"),                    // Additional payment data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  currency: true,
  description: true,
  paymentMethod: true,
  paymentId: true,
  status: true,
  metadata: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// =============================================
// STRIPE CUSTOMERS TABLE
// Links users to Stripe customer IDs
// =============================================
export const stripeCustomers = pgTable("stripe_customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStripeCustomerSchema = createInsertSchema(stripeCustomers).pick({
  userId: true,
  stripeCustomerId: true,
});

export type InsertStripeCustomer = z.infer<typeof insertStripeCustomerSchema>;
export type StripeCustomer = typeof stripeCustomers.$inferSelect;


// =============================================
// PROMOTION PACKAGES TABLE
// Stores promotion packages for listings
// =============================================
export const promotionPackages = pgTable("promotion_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: integer("price").notNull(),
  currency: text("currency").default("USD"),
  durationDays: integer("duration_days").notNull(),
  isFeatured: boolean("is_featured").default(false),
  priority: integer("priority").default(0),       // Higher = more prominent
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromotionPackageSchema = createInsertSchema(promotionPackages).pick({
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  price: true,
  currency: true,
  durationDays: true,
  isFeatured: true,
  priority: true,
  isActive: true,
});

export type InsertPromotionPackage = z.infer<typeof insertPromotionPackageSchema>;
export type PromotionPackage = typeof promotionPackages.$inferSelect;

export const servicePromotionPackages = pgTable("service_promotion_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: integer("price").notNull(),
  currency: text("currency").default("USD"),
  durationDays: integer("duration_days").notNull(),
  isFeatured: boolean("is_featured").default(false),
  priority: integer("priority").default(0),       // Higher = more prominent
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServicePromotionPackageSchema = createInsertSchema(servicePromotionPackages).pick({
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  price: true,
  currency: true,
  durationDays: true,
  isFeatured: true,
  priority: true,
  isActive: true,
});

export type InsertServicePromotionPackage = z.infer<typeof insertServicePromotionPackageSchema>;
export type ServicePromotionPackage = typeof servicePromotionPackages.$inferSelect;

// =============================================
// LISTING PROMOTIONS TABLE
// Stores active promotions for listings
// =============================================
export const listingPromotions = pgTable("listing_promotions", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => carListings.id).notNull(),
  packageId: integer("package_id").references(() => promotionPackages.id).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertListingPromotionSchema = createInsertSchema(listingPromotions).pick({
  listingId: true,
  packageId: true,
  startDate: true,
  endDate: true,
  transactionId: true,
  isActive: true,
});

export type InsertListingPromotion = z.infer<typeof insertListingPromotionSchema>;
export type ListingPromotion = typeof listingPromotions.$inferSelect;

export const servicePromotions = pgTable("service_promotions", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => carListings.id).notNull(),
  packageId: integer("package_id").references(() => promotionPackages.id).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServicePromotionSchema = createInsertSchema(servicePromotions).pick({
  listingId: true,
  packageId: true,
  startDate: true,
  endDate: true,
  transactionId: true,
  isActive: true,
});

export type InsertServicePromotion = z.infer<typeof insertServicePromotionSchema>;
export type ServicePromotion = typeof servicePromotions.$inferSelect;

export type CarListingWithFeatures = CarListing & {
  features: CarFeature[];
};

// Listing Form
export type ListingFormData = {
  basicInfo?: {
    title: string;
    description?: string;
    location?: string;
    price?: string;
    currency?: string;
  };
  specifications?: {
    categoryId?: string;
    makeId?: string;
    modelId?: string;
    year?: string;
    mileage?: string;
    fuelType?: string;
    transmission?: string;
    color?: string;
    condition?: string;
  };
  features?: string[];
  media?: File[] | string[]; // Files before upload or URLs after upload
  status: 'draft' | 'active' | 'pending' | 'reject' | 'sold';
  package?: {
    packageId?: string;
    packageName?: string;
    packagePrice?: string;
    durationDays?: number;
  };
};


// Listing Form Steps
export type StepProps = {
  listingId?: number;
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit?: (status: 'draft' | 'publish') => void;
};

export type ListingFormAction = 'draft' | 'publish';
export type ListingStatus = 'draft' | 'active' | 'pending' | 'reject' | 'sold';

// Filter Interface
export interface AdminCarListingFilters {
  make: string;
  model: string;
  category: string;
  location: string[];
  year?: number[];
  fuel_type: string[];
  transmission: string[];
  isFeatured: boolean | null;
  status: string;
  sort: string;
  page: number;
  limit: number;
  dateRange: { from: string; to: string };
  dateRangePreset?: string;
  yearRange?: { from: string; to: string };
  milesRange?: { from: string; to: string };
  priceRange?: { from: string; to: string };
  user_id?: number;
  hasPromotion?: boolean;
  packageType?: string;
  promotionStatus?: string;
}

export interface CarListingFilters {
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  category: string;
  location: string[];
  year: number[];
  fuel_type: string[];
  transmission: string[];
  isFeatured: boolean | null;
  status: string;
  sort: string;
  page: number;
  limit: number;
}

export interface AdminCarListing {
  id: number;
  title: string;
  titleAr?: string;
  price: number;
  currency: string;
  fuel_type: string;
  transmission: string;
  year: number;
  mileage: number;
  color: string;
  condition: string;
  description?: string;
  descriptionAr?: string;
  location: string;
  locationAr?: string;
  status: 'draft' | 'active' | 'pending' | 'reject' | 'sold';
  is_featured: boolean;
  is_active: boolean;
  views?: number;
  contact_number?: string;
  created_at: string;
  updated_at?: string;
  images?: string[];
  user_id: number;
  make_id: number;
  model_id: number;
  category_id?: number;
  seller?: {
    id: number;
    username: string;
    avatar?: string;
    created_at?: string;
  };
  make?: {
    id: number;
    name: string;
  };
  model?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  features?: string[];
  package_id?: number;
  package_name?: string;
  package_price?: string;
  durationDays?: number;
  start_date?: Date;
  end_date?: Date;
}

export type AdminCarListingAction = 'publish' | 'edit' | 'approve' | 'reject' | 'feature' | 'delete' | 'sold';

// Car Services Filter Interface
export interface CarServiceFilters {
  showroom: string;
  service: string;
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  isFeatured: boolean | null;
  sort: string;
  page: number;
  limit: number;
}

// Cars Data Interface
export interface CarsData {
  cars: CarListing[];
  total: number;
};

// User with Stats Interface
export type UserWithStats = User & {
  listingCount: number;
  responseRate: number;
  responseTime: number;
};

// Budget Range Interface
export interface BudgetRange {
  id: string;
  name: string;
  min: number;
  max: number;
};


export type ServiceBookingFormData = {
  serviceId: string;
  userId: string;
  showroomId?: string;
  scheduledAt: string;
  notes?: string;
  status: 'draft' | 'pending' | 'confirmed' | 'complete' | 'expired' | 'rejected';
  price: number;
  currency: string;
};

export type ServiceBookingFormAction = 'draft' | 'submit';
export type ServiceBookingStatus = 'draft' | 'pending' | 'confirmed' | 'complete' | 'expired' | 'rejected';

export interface AdminServiceBookingFilters {
  status: string;
  dateRange: { from: string; to: string };
  dateRangePreset?: string;
  priceRange?: { from: string; to: string };
  user_id?: number;
  showroom_id?: number;
  service_id?: number;
}

export interface AdminServiceBooking {
  id: number;
  serviceId: number;
  userId: number;
  showroomId?: number;
  scheduledAt: string;
  status: ServiceBookingStatus;
  notes?: string;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt?: string;
  
  // Relations
  service?: {
    id: number;
    name: string;
    description?: string;
    price: number;
    currency: string;
    duration?: number; // in minutes
  };
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  showroom?: {
    id: number;
    name: string;
    address?: string;
    contactNumber?: string;
    logo?: string;
  };
}

export type ServiceBookingAction = 'confirm' | 'reschedule' | 'complete' | 'cancel' | 'reject';

export type ServiceListingFormData = {
  showroomId: string;
  serviceId: string;
  price: number;
  currency: string;
  description?: string;
  descriptionAr?: string;
  isFeatured?: boolean;
  isActive?: boolean;
};

export interface AdminServiceListingFilters {
  isActive: boolean | null;
  isFeatured: boolean | null;
  priceRange?: { from: string; to: string };
  showroomId?: number;
  serviceId?: number;
  searchQuery?: string;
  dateRangePreset?: string; // Add this
  dateRange?: { from: string; to: string }; // Add this
}

export interface AdminServiceListing {
  id: number;
  showroomId: number;
  serviceId: number;
  price: number;
  currency: string;
  description?: string;
  descriptionAr?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  
  // Relations
  service?: {
    id: number;
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    image?: string;
    category?: string;
  };
  showroom?: {
    id: number;
    name: string;
    nameAr?: string;
    address?: string;
    addressAr?: string;
    contactNumber?: string;
    logo?: string;
  };
}

export type ServiceListingAction = 'feature' | 'activate' | 'deactivate' | 'delete';

// Extended types for service management
export interface ServiceCategory {
  id: number;
  name: string;
  nameAr?: string;
  description?: string;
  image?: string;
}

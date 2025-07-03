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

  // Core identity
  username: text("username").notNull().unique(),  // Unique username
  email: text("email").notNull().unique(),        // User email address
  phone: text("phone"),                           // Primary phone number
  password: text("password").notNull(),           // Hashed password

  // Personal info
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),                         // Profile picture URL

  // Role and permissions
  roleId: integer("role_id").references(() => roles.id),

  // Status and verification
  status: text("status").default("inactive").notNull().$type<
    "inactive" | "active" | "suspended" | "removed"
  >(),     
  suspensionReason: text("suspension_reason"),                                       // Account status
  isEmailVerified: boolean("is_email_verified").default(false),
  verificationToken: text("verification_token"),
  passwordResetToken: text("password_reset_token"),

  // Notification preferences
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(true),
  notificationEmail: text("notification_email"),
  notificationPhone: text("notification_phone"),

  // Audit logging
  lastLoginAt: timestamp("last_login_at"),
  loginIp: text("login_ip"),
  loginCount: integer("login_count").default(0),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});


export const insertUserSchema = createInsertSchema(users, {
  roleId: roleSchema,
}).pick({
  // Core identity
  username: true,
  email: true,
  phone: true,
  password: true,

  // Personal info
  firstName: true,
  lastName: true,
  avatar: true,

  // Role and status
  roleId: true,
  status: true,
  suspensionReason: true,

  // Notification preferences
  emailNotifications: true,
  smsNotifications: true,
  notificationEmail: true,
  notificationPhone: true,

  // Audit Logging
  lastLoginAt: true,
  loginIp: true,
  loginCount: true,

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
  description: text("description"),
  descriptionAr: text("description_ar"),
  isMainBranch: boolean("is_main_branch").default(false), // Is this the main branch?
  parentId: integer("parent_id"),
  // Parent showroom for branches
  address: text("address"),                       // Physical address
  addressAr: text("address_ar"),                  // Physical address in Arabic
  location: text("location"),                     // Geographic location
  timing: text("timing"),
  phone: text("phone"),                            // Contact phone number
  logo: text("logo"),
  images: text("images").array(),
  isFeatured: boolean('is_featured').default(false),
  isGarage: boolean('is_garage').default(false),
  isMobileService: boolean('is_mobile_service').default(false),
  rating: integer('rating'),
  tLicense: text("t_license"),
});

export const insertShowroomSchema = createInsertSchema(showrooms).pick({
  userId: true,
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  isMainBranch: true,
  parentId: true,
  address: true,
  addressAr: true,
  location: true,
  timing: true,
  phone: true,
  logo: true,
  images: true,
  isFeatured: true,
  isGarage: true,
  isMobileService: true,
  rating: true,
  tLicense: true,
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

export const carEngineCapacities = pgTable("car_engine_capacities", {
  id: serial("id").primaryKey(),                        // Unique engine size ID
  sizeLiters: integer("size_liters").notNull(), // e.g., 1.6, 2.0
  label: text("label").notNull(),                       // Human-friendly label, e.g., "2.0L"
  description:  text("description"),
});

export const insertCarEngineCapacitySchema = createInsertSchema(carEngineCapacities).pick({
  sizeLiters: true,
  label: true,
  description: true,
});

export type InsertCarEngineCapacity = z.infer<typeof insertCarEngineCapacitySchema>;
export type CarEngineCapacity = typeof carEngineCapacities.$inferSelect;


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

  // Seller and basic info
  sellerId: integer("seller_id").notNull(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),

  // Price and year
  price: integer("price").notNull(),
  currency: text("currency"),
  year: integer("year").notNull(),

  // Vehicle make/model/category
  makeId: integer("make_id").notNull(),
  modelId: integer("model_id").notNull(),
  categoryId: integer("category_id").notNull(),

  // Vehicle specs
  mileage: integer("mileage").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission").notNull(),
  engineCapacityId: integer("engine_capacity_id"),
  cylinerCount: integer("cylinder_count").default(0),

  // Appearance
  color: text("color").notNull(),
  interiorColor: text("interior_color"),
  tinted: boolean("tinted").default(false),

  // Condition and location
  condition: text("condition").notNull(),
  location: text("location").notNull(),

  // Media and status
  images: text("images").array(),
  image360: text("image360"),
  status: text("status").default("draft").notNull().$type<"draft" | "pending" | "active" | "sold" | "expired" | "rejected">(),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isImported: boolean("is_imported").default(false),

  // Ownership and insurance
  ownerType: text("owner_type").$type<"first" | "second" | "third" | "fourth" | "fifth">(),
  hasWarranty: boolean("has_warranty").default(false),
  warrantyExpirty: timestamp("warranty_expiry"),
  hasInsurance: boolean("has_insurance").default(false),
  insuranceType: text("insurance_type").$type<"comprehensive" | "third-party" | "none">(),
  insuranceExpiry: timestamp("insurance_expiry"),
  isInspected: boolean("is_inspected").default(false),
  inspectionReport: text("inspection_report"),

  isBusiness: boolean("is_business").default(false),
  showroomId: integer("showroom_id"),
  listingType: text("listing_type").$type<"sale" | "exchange" | "both">(),
  refreshLeft: text("refresh_left"),

  // System info
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),

});

export const insertCarListingSchema = createInsertSchema(carListings).pick({
  // Seller and basic info
  sellerId: true,
  title: true,
  titleAr: true,
  description: true,
  descriptionAr: true,

  // Price and year
  price: true,
  currency: true,
  year: true,

  // Vehicle make/model/category
  makeId: true,
  modelId: true,
  categoryId: true,

  // Vehicle specs
  mileage: true,
  fuelType: true,
  transmission: true,
  engineCapacityId: true,
  cylinerCount: true,

  // Appearance
  color: true,
  interiorColor: true,
  tinted: true,

  // Condition and location
  condition: true,
  location: true,

  // Media and status
  images: true,
  image360: true,
  status: true,
  isActive: true,
  isFeatured: true,
  isImported: true,

  // Ownership and insurance
  ownerType: true,
  hasWarranty: true,
  warrantyExpirty: true,
  hasInsurance: true,
  insuranceType: true,
  insuranceExpiry: true,
  listingType: true,
  isInspected:true,
  inspectionReport: true,

  refreshLeft: true,

  isBusiness: true,
  showroomId: true,
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
  status: text("status").default("draft").notNull().$type<"draft" | "pending" | "active" | "sold" | "expired" | "rejected">(),
  availability: text("availability"),
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
  status: true,
  availability: true,
});

export type InsertShowroomService = z.infer<typeof insertShowroomServiceSchema>;
export type ShowroomService = typeof showroomServices.$inferSelect;

// =============================================
// SHOWROOM SERVICE INTERACTION TABLE
// =============================================

export const showroomServiceInteractions = pgTable("showroom_service_interactions", {
  id: serial("id").primaryKey(),

  showroomServiceId: integer("showroom_service_id")
    .references(() => showroomServices.id)
    .notNull(),

  interactionType: text("interaction_type").notNull(), // 'visits', 'calls', 'messages', etc.

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const insertShowroomServiceInteractionSchema = createInsertSchema(showroomServiceInteractions).pick({
  showroomServiceId: true,
  interactionType: true
});

export type InsertShowroomServiceInteraction = z.infer<typeof insertShowroomServiceInteractionSchema>;
export type ShowroomServiceInteraction = typeof showroomServiceInteractions.$inferSelect

// =============================================
// SERVICE BOOKINGS TABLE
// Stores user bookings for showroom services
// =============================================
export const serviceBookings = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // Booking user ID
  serviceId: integer("service_id").references(() => showroomServices.id).notNull(), // Service ID
  showroomId: integer("showroom_id").notNull(),
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
  showroomId: true,
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
  listingId: integer('listing_id').references(() => carListings.id, { onDelete: 'cascade' }),           // Foreign key to car_listings
  createdAt: timestamp("created_at").defaultNow(), // Timestamp when favorited
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  listingId: true,
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
  listingId: integer('listing_id'), // Related car listing
  title: text("title"),
  content: text("content").notNull(),             // Message content
  status: text("status").default("draft").notNull().$type<"draft" | "sent" | "failed" | "read" | "unread">(),            // Delivery status
  sentAt: timestamp("sent_at"),                   // When message was sent
  error: text("error"),                           // Error message if delivery failed
  createdAt: timestamp("created_at").defaultNow(), // Creation timestamp
  parentMessageId: integer('parent_message_id'),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  recipientType: true,
  type: true,
  listingId: true,
  title: true,
  content: true,
  status: true,
  sentAt: true,
  error: true,
  parentMessageId: true,
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
  placement: text('placement').notNull().$type<"header" | "footer" | "both">(),
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
  placement: true,
  fullWidth: true,
});

export type InsertStaticContent = z.infer<typeof insertStaticContentSchema>;
export type StaticContent = typeof staticContent.$inferSelect;

// =============================================
// HERO SLIDERS TABLE
// Stores hero sliders for home and garage pages
// =============================================
export const heroSliders = pgTable("hero_sliders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),                 // Slider title in English
  titleAr: text("title_ar"),                      // Slider title in Arabic
  subtitle: text("subtitle"),                     // Slider subtitle in English
  subtitleAr: text("subtitle_ar"),                // Slider subtitle in Arabic
  buttonText: text("button_text"),                // Button text in English
  buttonTextAr: text("button_text_ar"),           // Button text in Arabic
  buttonUrl: text("button_url"),                  // Button link URL
  imageUrl: text("image_url").notNull(),          // Slider image URL
  type: text("slide_type").notNull().$type<"home" | "garage">(), // Slider type
  isActive: boolean("is_active").default(true),   // Active status
  order: integer("slide_order").default(0),             // Display order
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(), // Last update timestamp
});

export const insertHeroSliderSchema = createInsertSchema(heroSliders).pick({
  title: true,
  titleAr: true,
  subtitle: true,
  subtitleAr: true,
  buttonText: true,
  buttonTextAr: true,
  buttonUrl: true,
  imageUrl: true,
  type: true,
  isActive: true,
  order: true,
});

export type InsertHeroSlider = z.infer<typeof insertHeroSliderSchema>;
export type HeroSlider = typeof heroSliders.$inferSelect;

// =============================================
// BLOG POSTS TABLE
// Stores blog articles and news
// =============================================
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),                 // Post title in English
  titleAr: text("title_ar"),                      // Post title in Arabic
  slug: text("slug").notNull().unique(),          // URL-friendly slug
  excerpt: text("excerpt"),                       // Short description in English
  excerptAr: text("excerpt_ar"),                  // Short description in Arabic
  content: text("content").notNull(),             // Main content in English
  contentAr: text("content_ar"),                  // Main content in Arabic
  featuredImage: text("featured_image"),          // Featured image URL
  authorId: integer("author_id").references(() => users.id).notNull(), // Author user ID
  authorName: text("author_name").notNull(),      // Author display name
  status: text("status").default("draft").notNull().$type<"draft" | "published">(),
  publishedAt: timestamp("published_at").defaultNow(), // Publication date
  metaTitle: text("meta_title"),                  // SEO meta title
  metaDescription: text("meta_description"),      // SEO meta description
  tags: text("tags").array(),                     // Post tags/categories
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(), // Last update timestamp
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  titleAr: true,
  slug: true,
  excerpt: true,
  excerptAr: true,
  content: true,
  contentAr: true,
  featuredImage: true,
  authorId: true,
  authorName: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  tags: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// =============================================
// BANNER ADS TABLE
// Stores website banner advertisements
// =============================================
export const bannerAds = pgTable("banner_ads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),                 // Banner title in English
  titleAr: text("title_ar"),                      // Banner title in Arabic
  imageUrl: text("image_url").notNull(),          // Path to banner image
  link: text("link"),                             // URL the banner links to
  position: text("position").notNull().$type<"top" | "middle" | "bottom" | "sidebar">(),
  isActive: boolean("is_active").default(true),   // Whether banner is active
  startDate: timestamp("start_date").notNull(),   // When banner should start showing
  endDate: timestamp("end_date").notNull(),       // When banner should stop showing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(), // Last update timestamp
});

export const insertBannerAdSchema = createInsertSchema(bannerAds).pick({
  title: true,
  titleAr: true,
  imageUrl: true,
  link: true,
  position: true,
  isActive: true,
  startDate: true,
  endDate: true,
});

export type InsertBannerAd = z.infer<typeof insertBannerAdSchema>;
export type BannerAd = typeof bannerAds.$inferSelect;

// =============================================
// SETTINGS TABLE
// Stores application configuration
// =============================================
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),

  // General Settings
  logo: text("logo"),                             // Application logo URL
  footerLogo: text("footer_logo"),                // Application Footer Logo URL
  bankLogo: text("bank_logo"),
  bankUrl: text("bank_url"),
  favicon: text("favicon"),                         // Favicon URL
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
  integrationsConfig: jsonb("integrations").$type<{
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
const integrationsConfigSchema = z.object({
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
  integrationsConfig: integrationsConfigSchema,
}).pick({
  logo: true,
  footerLogo: true,
  favicon: true,
  bankLogo: true,
  bankUrl: true,
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
  integrationsConfig: true,
  allowedLanguages: true,
  defaultLanguage: true,
});

export type InsertSetting = z.infer<typeof insertSettingsSchema>;
export type EmailConfig = z.infer<typeof emailConfigSchema>;
export type SmsConfig = z.infer<typeof smsConfigSchema>;
export type GoogleMapsConfig = z.infer<typeof googleMapsConfigSchema>;
export type IntegrationConfig = z.infer<typeof integrationsConfigSchema>;
export type Setting = typeof settings.$inferSelect;
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
  plan: text("plan").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").default("QAR"),
  durationDays: integer("duration_days").notNull(),
  isFeatured: boolean("is_featured").default(false),
  priority: integer("priority").default(0),       // Higher = more prominent
  noOfRefresh: integer("no_of_refresh"),
  featureDuration: integer("feature_duration"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromotionPackageSchema = createInsertSchema(promotionPackages).pick({
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  plan: true,
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
  plan: text("plan"),
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
  plan: true,
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
  serviceId: integer("service_id").references(() => carServices.id).notNull(),
  packageId: integer("package_id").references(() => servicePromotionPackages.id).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServicePromotionSchema = createInsertSchema(servicePromotions).pick({
  serviceId: true,
  packageId: true,
  startDate: true,
  endDate: true,
  transactionId: true,
  isActive: true,
});

export type InsertServicePromotion = z.infer<typeof insertServicePromotionSchema>;
export type ServicePromotion = typeof servicePromotions.$inferSelect;

// =============================================
// REVIEWS TABLE
// =============================================

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  showroomId: integer("showroom_id").notNull().references(() => showrooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // You can enforce 1-5 rating in Zod
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertReviewSchema = createInsertSchema(reviews).extend({
  rating: z.number().min(1).max(5),
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// =============================================
// CAR_INSPECTIONS TABLE
// Stores user-submitted requests for car inspections
// =============================================
export const carInspections = pgTable("car_inspections", {
  id: serial("id").primaryKey(),                           // Unique inspection ID
  userId: integer("user_id").notNull(),                    // Foreign key to user
  fullName: text("full_name").notNull(),                   // User's full name
  email: text("email").notNull(),                          // Contact email
  phone: text("phone").notNull(),                          // Contact phone number
  carMake: text("car_make").notNull(),                     // Make of the car (e.g., Toyota)
  carModel: text("car_model").notNull(),                   // Model of the car (e.g., Corolla)
  carYear: integer("car_year").notNull(),                  // Year of manufacture
  price: integer("price").notNull(), // Inspection price
  status: text("status").default("pending").notNull().$type<'pending' | 'approved' | 'rejected'>(), // Inspection status
  additionalNotes: text("additional_notes"),               // Optional additional notes
  createdAt: timestamp("created_at").defaultNow(),         // Timestamp of inspection request
});

export const insertCarInspectionSchema = createInsertSchema(carInspections).pick({
  userId: true,
  fullName: true,
  email: true,
  phone: true,
  carMake: true,
  carModel: true,
  carYear: true,
  price: true,
  status: true,
  additionalNotes: true,
});

export type InsertCarInspection = z.infer<typeof insertCarInspectionSchema>;
export type CarInspection = typeof carInspections.$inferSelect;


export type CarListingWithFeatures = CarListing & {
  features: CarFeature[];
};

// Listing Form
export type ListingFormData = {
  basicInfo?: {
    listingType?: string;
    title: string;
    titleAr: string;
    description?: string;
    descriptionAr?: string;
    price?: string;
    currency?: string;
    location?: string;
    
  };
  specifications?: {
    year?: string;

    makeId?: string;
    modelId?: string;
    categoryId?: string;
    
    mileage?: string;
    fuelType?: string;
    transmission?: string;
    engineCapacityId?: string;
    cylinderCount?: string;

    color?: string;
    interiorColor?: string;
    tinted?: string;

    condition?: string;

    ownerType?: string;
    isImported?: string;
    isInspected?: string;
    inspectionReport?: string | undefined;
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
  // Price and year
  priceRange?: { from: string; to: string };
  yearRange?: { from: string; to: string };
  year?: number[];
  // Vehicle make/model/category
  make: string;
  model: string;
  category: string;
  // Vehicle specs
  milesRange?: { from: string; to: string };
  fuelType?: string[];
  transmission?: string[];
  engineCapacity?: string[];
  cylinderCount?: string;
  // Appearance
  color?: string;
  interiorColor?: string;
  tinted?: boolean | null;
  // Condition and location
  condition?: string;
  location?: string[];
  // Status 
  status: string;
  isActive?: string;
  isFeatured?: string;
  isImported?: string;
  isInspected?: string;
  // Ownership and insurance
  user_id?: number;
  ownerType?: string;
  hasWarranty?: string;
  hasInsurance?: string;
  // Promotion
  hasPromotion?: boolean;
  packageType?: string;
  promotionStatus?: string;
  // Sorting and Pagination
  sort: string;
  page: number;
  limit: number;
  dateRange: { from: string; to: string };
  dateRangePreset?: string;
  
}

export interface CarListingFilters {
  search?: string;
  // Price and year
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  // Vehicle make/model/category
  make: string;
  model: string;
  category: string;
  // Vehicle specs
  milesRange?: { from: string | undefined; to: string | undefined };
  fuelType?: string[];
  transmission?: string[];
  engineCapacity?: string[];
  cylinderCount?: string[];
  // Appearance
  color?: string[];
  interiorColor?: string[];
  tinted?: string;
  // Condition and location
  condition?: string;
  location?: string[];
  // Status 
  status: string;
  isActive?: boolean;
  isImported?: string;
  isFeatured?: string;
  isInspected?: string;
  // Ownership and insurance
  ownerType?: string[];
  hasWarranty?: string;
  hasInsurance?: string;
  isBusiness?: boolean | string;
  userId?: string;
  // Sorting and Pagination
  sort: string;
  page: number;
  limit: number;
}

export interface AdminCarListing {
  id: number;
  listing_type?: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;

  price: number;
  currency?: string;
  year?: number;

  make_id: number;
  model_id: number;
  category_id?: number;

  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  engine_capacity_id?: number;
  cylinder_count?: number;
  
  color?: string;
  interior_color?: string;
  tinted?: boolean;

  condition?: string;
  location?: string;
  locationAr?: string;

  images?: string[];
  image360?: string;

  status: 'draft' | 'active' | 'pending' | 'reject' | 'sold';
  is_active?: string;
  is_featured?: string;
  is_imported?: string;
  is_inspected?: string;
  
  owner_type?: 'first' | 'second' |'third' | 'fourth' | 'fifth';
  has_warranty?: string;
  warranty_expirty?: string;
  has_insurance?: string;
  insurance_type?: 'comprehensive' | 'third-party' | 'none';
  insurance_expirty?: string;
  is_business?: string;
  inspection_report?: string;

  views?: number;
  created_at: string;
  updated_at?: string;
  
  user_id: number;
  contact_number?: string;
  seller?: {
    id: number;
    username: string;
    avatar?: string;
    created_at?: string;
  };
  showroom?: {
    id?: number;
    name?: string;                   // Showroom name in English
    nameAr?: string;                        // Showroom name in Arabic
    isMainBranch?: boolean; // Is this the main branch?
    address?: string;                       // Physical address
    addressAr?: string;                  // Physical address in Arabic
    location?: string;                     // Geographic location
    phone?: string;                            // Contact phone number
    logo?: string;
    isFeatured?: boolean;
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
  duration_days?: number;
  start_date?: Date;
  end_date?: Date;
}

export type AdminCarListingAction = 'publish' | 'edit' | 'approve' | 'reject' | 'feature' | 'unfeature' | 'delete' | 'sold';

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
  scheduledAt: Date;
  status: ServiceBookingStatus;
  notes?: string;
  price: number;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  
  // Relations
  service?: {
    id: number;
    name?: string;
    description?: string;
    descriptionAr?: string;
    price?: number;
    currency?: string;
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
    id?: number;
    name?: string;                   // Showroom name in English
    nameAr?: string;                        // Showroom name in Arabic
    isMainBranch?: boolean; // Is this the main branch?
    address?: string;                       // Physical address
    addressAr?: string;                  // Physical address in Arabic
    location?: string;                     // Geographic location
    phone?: string;                            // Contact phone number
    logo?: string;
    isFeatured?: boolean;
  };
  
}

export type ServiceBookingAction = 'confirm' | 'reschedule' | 'complete' | 'cancel' | 'reject';

export type ServiceListingFormData = {
   basicInfo: {
    serviceId: string;
    showroomId: string;
    description?: string;
    descriptionAr?: string;
    price: string;
    currency?: string;
  };
  availability?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  status: 'draft' | 'active' | 'pending' | 'reject';
  package?: {
    packageId?: string;
    packageName?: string;
    packagePrice?: string;
    durationDays?: number;
  };
};

export type ServiceStepProps = {
  serviceId?: number;
  data: ServiceListingFormData;
  updateData: (data: Partial<ServiceListingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit?: (status: 'draft' | 'publish') => void;
};

export type ServiceListingFormAction = 'draft' | 'publish';
export type ServiceListingStatus = 'draft' | 'active' | 'pending' | 'reject' | 'sold';

export interface AdminServiceListingFilters {
  isActive: boolean | undefined;
  isFeatured: boolean | undefined;
  priceRange?: { from: string; to: string };
  showroomId?: number;
  serviceId?: number;
  user_id?: number;
  searchQuery?: string;
  dateRangePreset?: string; // Add this
  dateRange?: { from: string; to: string }; // Add this
  status?: string;
}

export interface AdminServiceListing {
  availability: string;
  id: number;
  showroomId: number;
  serviceId: number;
  price: number;
  currency: string;
  description?: string;
  descriptionAr?: string;
  isFeatured: boolean;
  isActive: boolean;
  status: 'draft' | 'active' | 'pending' | 'reject';
  createdAt?: string;
  updatedAt?: string;
  
  // Relations
  serviceData?: {
    id: number;
    name?: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    image?: string;
    category?: string;
  };
  showroom?: {
    id?: number;
    name?: string;                   // Showroom name in English
    nameAr?: string;                        // Showroom name in Arabic
    isMainBranch?: boolean; // Is this the main branch?
    address?: string;                       // Physical address
    addressAr?: string;                  // Physical address in Arabic
    location?: string;                     // Geographic location
    phone?: string;                            // Contact phone number
    logo?: string;
    isFeatured?: boolean;
  };
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  package_id?: number;
  package_name?: string;
  package_price?: string;
  duration_days?: number;
  start_date?: Date;
  end_date?: Date;
}

export type ServiceListingAction = 'publish' | 'edit' | 'approve' | 'reject' | 'feature' |'unfeature' | 'delete';

// Extended types for service management
export interface ServiceCategory {
  id: number;
  name: string;
  nameAr?: string;
  description?: string;
  image?: string;
}

export type StatDashboard = {
totalUsers: number;
totalListings: number;
pendingReports: number;
pendingListings: number;
recentUsers: any[];
recentListings: any[];
recentReports: any[];
cmsOverview: any[];
};

export type ServiceBookingFormProps = {
  service?: ShowroomService;
  services?: ShowroomService[]; // new prop for multiple services
  showroomId?: number;
  userId?: number;
  onSuccess?: () => void;
  isOpen?: boolean;
}

export interface ServiceProvider {
  name: string;
  location: string;
  bookingDate: string;
  bookingTime: string;
}

export interface ReviewData {
  rating: number;
  feedback: string;
  serviceProvider: string;
  location: string;
  bookingDate: string;
  bookingTime: string;
  showroomId?: number;
  bookingId?: number;
}

export type AvailabilityEntry = {
  day: string;          // e.g., "mon", "tue"
  isOpen: boolean;      // whether the day is active
  startTime: string;    // in "HH:mm" format like "09:00"
  endTime: string;      // in "HH:mm" format like "17:00"
};

export type CarStatistic = {
  publishedCars: number;
  pendingListings: number;
  featuredCars: number;
  expiredCarAds: number;
};

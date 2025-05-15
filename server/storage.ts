import {
  type User, type InsertUser, type Role, type InsertRole,
  type CarCategory, type InsertCarCategory, type CarMake, type InsertCarMake,
  type CarModel, type InsertCarModel, type CarListing, type InsertCarListing,
  type Favorite, type InsertFavorite, type Message, type InsertMessage,
  type Report, type InsertReport, type Settings, type InsertSettings,
  type SearchHistory, type InsertSearchHistory, type StaticContent, type InsertStaticContent,
  type CarFeature, type InsertCarFeature, type CarListingFeature, type InsertCarListingFeature,
  type Showroom, type InsertShowroom, type UserRoleSwitch, type InsertUserRoleSwitch,
  type CarService, type InsertCarService, type ShowroomService, type InsertShowroomService,
  type ServiceBooking,
  InsertServiceBooking,
  ShowroomMake,
  InsertShowroomMake,
  SubscriptionPlan,
  InsertSubscriptionPlan,
  Transaction,
  UserSubscription,
  InsertUserSubscription,
  InsertTransaction,
  InsertPromotionPackage,
  PromotionPackage,
  ListingPromotion,
  InsertListingPromotion,
  SmsConfig,
  EmailConfig,
  GoogleMapsConfig,
  IntegrationSettings,
  StripeCustomer,
  InsertStripeCustomer,
  CarListingWithFeatures,
} from "@shared/schema";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { Description } from "@radix-ui/react-toast";

export interface IStorage {
  // User operations
  getUserByEmail(email: string): Promise<User | undefined>;
  hashPassword(password: string): Promise<string>;
  getUser(id: number): Promise<User | undefined>;
  getUsersByIds(ids: number[]): Promise<User[]>;
  getFilteredUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
  }): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserWithPassword(id: number): Promise<{ password: string } | undefined>;
  updateUserPassword(id: number, newPassword: string): Promise<boolean>;
  updateUserPasswordByEmail(email: string, newPassword: string): Promise<boolean>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  createPasswordResetToken(
  email: string, 
  otp: string, 
  token: string
): Promise<void>;

verifyPasswordResetToken(
  email: string,
  otp: string,
  token: string
): Promise<boolean>;

invalidateResetToken(token: string): Promise<void>;

  // Role operations
  getAllRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, updates: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<void>;
  getRoleIdByName(roleName: string): Promise<number>;

  // Car Category operations
  getAllCarCategories(): Promise<CarCategory[]>;
  getCarCategory(id: number): Promise<CarCategory | undefined>;
  createCarCategory(category: InsertCarCategory): Promise<CarCategory>;
  updateCarCategory(id: number, updates: Partial<InsertCarCategory>): Promise<CarCategory | undefined>;
  deleteCarCategory(id: number): Promise<void>;

  // Car Make operations
  getAllCarMakes(): Promise<CarMake[]>;
  getCarMake(id: number): Promise<CarMake | undefined>;
  createCarMake(make: InsertCarMake): Promise<CarMake>;
  updateCarMake(id: number, updates: Partial<InsertCarMake>): Promise<CarMake | undefined>;
  deleteCarMake(id: number): Promise<void>;
  getMakesByIds(ids: number[]): Promise<CarMake[]>;

  // Car Model operations
  getCarModelsByMake(makeId: number): Promise<CarModel[]>;
  getCarModel(id: number): Promise<CarModel | undefined>;
  createCarModel(model: InsertCarModel): Promise<CarModel>;
  updateCarModel(id: number, updates: Partial<InsertCarModel>): Promise<CarModel | undefined>;
  deleteCarModel(id: number): Promise<void>;
  getModelsByIds(ids: number[]): Promise<CarModel[]>;

  // Car Feature operations
  getAllCarFeatures(): Promise<CarFeature[]>;
  getCarFeature(id: number): Promise<CarFeature | undefined>;
  createCarFeature(feature: InsertCarFeature): Promise<CarFeature>;
  updateCarFeature(id: number, updates: Partial<InsertCarFeature>): Promise<CarFeature | undefined>;
  deleteCarFeature(id: number): Promise<void>;

  // Car Listing operations
  getAllCarListings(filter?: Partial<CarListing>, sortBy?: keyof CarListing, sortOrder?: 'asc' | 'desc'): Promise<CarListing[]>;
  getCarListingById(id: number): Promise<CarListingWithFeatures | undefined>;
  createCarListing(listing: InsertCarListing): Promise<CarListing>;
  updateCarListing(id: number, updates: Partial<InsertCarListing>): Promise<CarListing | undefined>;
  deleteCarListing(id: number): Promise<void>;
  getListingsBySeller(sellerId: number): Promise<CarListing[]>;
  incrementListingViews(id: number): Promise<void>;
  updateListingStatus(id: number, status: 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'reject'): Promise<void>;

  // Car Listing Features operations
  getCarFeaturedListings(filter?: Partial<CarListing>, sortBy?: keyof CarListing, sortOrder?: 'asc' | 'desc'): Promise<CarListing[]>;
  getFeaturesForListing(listingId: number): Promise<CarListingFeature[]>;
  addFeatureToListing(listingId: number, featureId: number): Promise<CarListingFeature>;
  removeFeatureFromListing(listingId: number, featureId: number): Promise<void>;
  clearFeaturesForListing(listingId: number): Promise<void>;
  bulkAddFeaturesToListing(listingId: number, featureIds: number[]): Promise<void>;

  // Favorite operations
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, listingId: number): Promise<void>;
  isFavorite(userId: number, listingId: number): Promise<boolean>;

  // Message operations
  getMessagesByUser(userId: number): Promise<Message[]>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  getMessage(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<void>;

  // Notification operations
  createNotification(notification: InsertMessage): Promise<Message>;
  getNotifications(listingId: number): Promise<Message[]>;
  getUserNotifications(userId: number): Promise<Message[]>;
  getPendingNotifications(): Promise<Message[]>;
  markNotificationSent(id: number, error?: string): Promise<void>;
  deleteNotification(id: number): Promise<void>;

  // Report operations
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  addReport(report: InsertReport): Promise<Report>;
  updateReportStatus(id: number, status: 'pending' | 'reviewed' | 'resolved'): Promise<void>;
  deleteReport(id: number): Promise<void>;

  // Search History operations
  getSearchHistoryByUser(userId: number): Promise<SearchHistory[]>;
  addSearchHistory(entry: InsertSearchHistory): Promise<SearchHistory>;
  clearUserSearchHistory(userId: number): Promise<void>;

  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<InsertSettings>): Promise<Settings>;

  // Email Config operations
  getEmailConfig(): Promise<Settings['emailConfig']>;
  updateEmailConfig(config: Partial<Settings['emailConfig']>): Promise<void>;

  // SMS Config operations
  getSmsConfig(): Promise<Settings['smsConfig']>;
  updateSmsConfig(config: Partial<Settings['smsConfig']>): Promise<void>;

  // Google Maps Config operations
  getGoogleMapsConfig(): Promise<Settings['googleMapsConfig']>;
  updateGoogleMapsConfig(config: Partial<Settings['googleMapsConfig']>): Promise<void>;

  // Integrations Config operations
  getIntegrationConfig(): Promise<Settings['integrations']>;
  updateIntegrationConfig(integrations: Partial<Settings['integrations']>): Promise<void>;

  // Static Content operations
  getAllStaticContents(): Promise<StaticContent[]>;
  getStaticContentByKey(key: string): Promise<StaticContent | undefined>;
  createStaticContent(content: InsertStaticContent): Promise<StaticContent>;
  updateStaticContent(id: number, updates: Partial<InsertStaticContent>): Promise<StaticContent | undefined>;
  deleteStaticContent(id: number): Promise<void>;

  // Showroom operations
  getAllShowrooms(): Promise<Showroom[]>;
  getShowroom(id: number): Promise<Showroom | undefined>;
  createShowroom(showroom: InsertShowroom): Promise<Showroom>;
  updateShowroom(id: number, updates: Partial<InsertShowroom>): Promise<Showroom | undefined>;
  deleteShowroom(id: number): Promise<void>;
  getShowroomsByUser(userId: number): Promise<Showroom[]>;
  getMainShowroomByUser(userId: number): Promise<Showroom | undefined>;

  // User Role Switch operations
  getUserRoleSwitches(userId: number): Promise<UserRoleSwitch[]>;
  createUserRoleSwitch(switchData: InsertUserRoleSwitch): Promise<UserRoleSwitch>;
  activateUserRole(userId: number, role: string): Promise<void>;
  deactivateUserRole(userId: number, role: string): Promise<void>;
  getActiveUserRole(userId: number): Promise<string | undefined>;

  // Service operations
  getAllServices(): Promise<CarService[]>;
  getAllFeaturedServices(): Promise<CarService[]>
  getShowroomServiceByServiceId(id: number): Promise<any>;
  getService(id: number): Promise<any>
  getServicesByMake(makeId: number): Promise<ShowroomService[]>
  createService(service: InsertCarService): Promise<CarService>;
  updateService(id: number, updates: Partial<InsertCarService>): Promise<CarService | undefined>;
  deleteService(id: number): Promise<void>;

  // Showroom Service operations
  getAllShowroomServices(filter?: Partial<ShowroomService>, sortBy?: keyof ShowroomService, sortOrder?: 'asc' | 'desc'  // No default value here
  ): Promise<ShowroomService[]>;
  getShowroomServices(showroomId: number): Promise<ShowroomService[]>;
  getShowroomService(id: number): Promise<ShowroomService | undefined>;
  getShowroomServicesByShowroomId(
    showroomId: number,
    filter?: Partial<ShowroomService>,
    sortBy?: keyof ShowroomService,
    sortOrder?: 'asc' | 'desc'  // No default value here
  ): Promise<ShowroomService[]>;
  createShowroomService(service: InsertShowroomService): Promise<ShowroomService>;
  updateShowroomService(id: number, updates: Partial<InsertShowroomService>): Promise<ShowroomService | undefined>;
  deleteShowroomService(id: number): Promise<void>;

  // Service Booking operations
  getServiceBookingsByUser(userId: number): Promise<ServiceBooking[]>;
  getServiceBookingsByShowroom(showroomId: number): Promise<ServiceBooking[]>;
  getServiceBooking(id: number): Promise<ServiceBooking | undefined>;
  createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking>;
  updateServiceBooking(id: number, updates: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined>;
  cancelServiceBooking(id: number): Promise<void>;
  completeServiceBooking(id: number): Promise<void>;

  // Showroom Service Make operations
  getShowroomMakes(serviceId: number): Promise<(ShowroomMake & { make?: CarMake })[]>;
  getAllShowroomsMakes(): Promise<any>;
  addShowroomMake(serviceId: number, makeId: number): Promise<ShowroomMake>;
  removeShowroomMake(serviceId: number, makeId: number): Promise<void>;
  bulkAddShowroomMakes(serviceId: number, makeIds: number[]): Promise<void>;

  // Subscription Plan operations
  getAllSubscriptionPlans(activeOnly?: boolean): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, updates: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<void>;

  // User Subscription operations
  getUserSubscriptions(userId: number, activeOnly?: boolean): Promise<UserSubscription[]>;
  getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: number, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  cancelUserSubscription(id: number): Promise<void>;
  renewUserSubscription(id: number): Promise<UserSubscription>;

  // Transaction operations
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(
    id: number,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    options?: { error?: string }
  ): Promise<void>;

  // Promotion Package operations
  getAllPromotionPackages(activeOnly?: boolean): Promise<PromotionPackage[]>;
  getPromotionPackage(id: number): Promise<PromotionPackage | undefined>;
  createPromotionPackage(pkg: InsertPromotionPackage): Promise<PromotionPackage>;
  updatePromotionPackage(id: number, updates: Partial<InsertPromotionPackage>): Promise<PromotionPackage | undefined>;
  deletePromotionPackage(id: number): Promise<void>;

  // Listing Promotion operations
  getActiveListingPromotions(listingId: number): Promise<ListingPromotion[]>;
  getListingPromotionsByListingId(listingId: number): Promise<ListingPromotion[]>;
  getCurrentListingPromotion(listingId: number): Promise<ListingPromotion | null>;
  createListingPromotion(promotion: InsertListingPromotion): Promise<ListingPromotion>;
  deactivateListingPromotion(id: number): Promise<void>;
  getFeaturedListings(): Promise<CarListing[]>;

  // Stripe Customers
  getStripeCustomerId(userId: number): Promise<string | null>;
  saveStripeCustomerId(userId: number, stripeCustomerId: string): Promise<void>;

}

export class DatabaseStorage implements IStorage {
  // =============================================
  // USER OPERATIONS
  // =============================================

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    return result[0];
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async getUsersByIds(ids: number[]): Promise<User[]> {
    if (!ids.length) return [];
    const result = await db.query('SELECT * FROM users WHERE id = ANY($1)', [ids]);
    return result;
  }

  async getFilteredUsers({
    search,
    role,
    status,
    sortBy,
  }: {
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
  }): Promise<User[]> {
    const values: any[] = [];
    const conditions: string[] = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(first_name ILIKE $${values.length} OR last_name ILIKE $${values.length} OR email ILIKE $${values.length})`);
    }

    if (role) {
      values.push(role);
      conditions.push(`role_id = $${values.length}`);
    }

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    let query = "SELECT * FROM users";
    if (conditions.length) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (sortBy) {
      const allowedSorts = ["username", "email", "first_name", "created_at"];
      if (allowedSorts.includes(sortBy)) {
        query += ` ORDER BY ${sortBy}`;
      }
    }

    const result = await db.query(query, values);
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
    return result[0];
  }

  async getUserWithPassword(id: number): Promise<{ password: string } | undefined> {
  const query = 'SELECT password FROM users WHERE id = $1';
  const result = await db.query(query, [id]);
  return result[0];
}

async updateUserPassword(id: number, newPassword: string): Promise<boolean> {
  const result = await db.query(
    `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
    [newPassword, id]
  );
  return result.length > 0;
}

async updateUserPasswordByEmail(email: string, newPassword: string): Promise<boolean> {
  const result = await db.query(
    `UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2 RETURNING id`,
    [newPassword, email]
  );
  return result.length > 0;
}

  async createUser(user: InsertUser): Promise<User> {
    const fields = Object.keys(user);
    const values = Object.values(user);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await db.query(query, [...values, id]);
    return result[0];
  }

  async deleteUser(id: number): Promise<void> {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async createPasswordResetToken(
  email: string, 
  otp: string, 
  token: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  
  await db.query(
    `INSERT INTO password_reset_tokens 
     (email, token, otp, expires_at) 
     VALUES ($1, $2, $3, $4) 
     ON CONFLICT (email) 
     DO UPDATE SET token = $2, otp = $3, expires_at = $4, used = false`,
    [email, token, otp, expiresAt]
  );
}

async verifyPasswordResetToken(
  email: string,
  otp: string,
  token: string
): Promise<boolean> {
  const result = await db.query(
    `SELECT 1 FROM password_reset_tokens 
     WHERE email = $1 AND token = $2 AND otp = $3 
     AND expires_at > NOW() AND used = false`,
    [email, token, otp]
  );
  return result.length > 0;
}

async invalidateResetToken(token: string): Promise<void> {
  await db.query(
    `UPDATE password_reset_tokens SET used = true WHERE token = $1`,
    [token]
  );
}
  // =============================================
  // ROLE OPERATIONS
  // =============================================

  async getAllRoles(): Promise<Role[]> {
    return await db.query('SELECT * FROM roles ORDER BY name');
  }

  async getRole(id: number): Promise<Role | undefined> {
    const result = await db.query('SELECT * FROM roles WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async createRole(role: InsertRole): Promise<Role> {
    const result = await db.query(
      'INSERT INTO roles (name, name_ar, description) VALUES ($1, $2, $3) RETURNING *',
      [role.name, role.nameAr, role.description]
    );
    return result[0];
  }

  async updateRole(id: number, updates: Partial<InsertRole>): Promise<Role | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.nameAr !== undefined) {
      fields.push(`name_ar = $${paramIndex}`);
      values.push(updates.nameAr);
      paramIndex++;
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getRole(id);
    }

    values.push(id);
    const query = `UPDATE roles SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteRole(id: number): Promise<void> {
    await db.query('DELETE FROM roles WHERE id = $1', [id]);
  }

  async getRoleIdByName(roleName: string): Promise<number> {
    const result = await db.query('SELECT id FROM roles WHERE name = $1 LIMIT 1', [roleName]);
    if (!result[0]) throw new Error('Role not found');
    return result[0].id;
  }

  // =============================================
  // CAR CATEGORY OPERATIONS
  // =============================================

  async getAllCarCategories(): Promise<CarCategory[]> {
    return await db.query('SELECT * FROM car_categories ORDER BY name');
  }

  async getCarCategory(id: number): Promise<CarCategory | undefined> {
    const result = await db.query('SELECT * FROM car_categories WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async createCarCategory(category: InsertCarCategory): Promise<CarCategory> {
    const result = await db.query(
      'INSERT INTO car_categories (name, name_ar, image) VALUES ($1, $2, $3) RETURNING *',
      [category.name, category.nameAr, category.image]
    );
    return result[0];
  }

  async updateCarCategory(id: number, updates: Partial<InsertCarCategory>): Promise<CarCategory | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.nameAr !== undefined) {
      fields.push(`name_ar = $${paramIndex}`);
      values.push(updates.nameAr);
      paramIndex++;
    }
    if (updates.image !== undefined) {
      fields.push(`image = $${paramIndex}`);
      values.push(updates.image);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getCarCategory(id);
    }

    values.push(id);
    const query = `UPDATE car_categories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteCarCategory(id: number): Promise<void> {
    await db.query('DELETE FROM car_categories WHERE id = $1', [id]);
  }

  // =============================================
  // CAR MAKE OPERATIONS
  // =============================================

  async getAllCarMakes(): Promise<CarMake[]> {
    return await db.query('SELECT * FROM car_makes ORDER BY name');
  }

  async getCarMake(id: number): Promise<CarMake | undefined> {
    const result = await db.query('SELECT * FROM car_makes WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async createCarMake(make: InsertCarMake): Promise<CarMake> {
    const result = await db.query(
      'INSERT INTO car_makes (name, name_ar, image) VALUES ($1, $2, $3) RETURNING *',
      [make.name, make.nameAr, make.image]
    );
    return result[0];
  }

  async updateCarMake(id: number, updates: Partial<InsertCarMake>): Promise<CarMake | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.nameAr !== undefined) {
      fields.push(`name_ar = $${paramIndex}`);
      values.push(updates.nameAr);
      paramIndex++;
    }
    if (updates.image !== undefined) {
      fields.push(`image = $${paramIndex}`);
      values.push(updates.image);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getCarMake(id);
    }

    values.push(id);
    const query = `UPDATE car_makes SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteCarMake(id: number): Promise<void> {
    await db.query('DELETE FROM car_makes WHERE id = $1', [id]);
  }

  async getMakesByIds(ids: number[]): Promise<CarMake[]> {
    if (!ids.length) return [];
    const result = await db.query('SELECT * FROM car_makes WHERE id = ANY($1)', [ids]);
    return result;
  }

  // =============================================
  // CAR MODEL OPERATIONS
  // =============================================

  async getCarModelsByMake(makeId: number): Promise<CarModel[]> {
    return await db.query('SELECT * FROM car_models WHERE make_id = $1 ORDER BY name', [makeId]);
  }

  async getCarModel(id: number): Promise<CarModel | undefined> {
    const result = await db.query('SELECT * FROM car_models WHERE id = $1', [id]);
    return result[0];
  }

  async createCarModel(model: InsertCarModel): Promise<CarModel> {
    const result = await db.query(
      'INSERT INTO car_models (make_id, name, name_ar) VALUES ($1, $2, $3) RETURNING *',
      [model.makeId, model.name, model.nameAr]
    );
    return result[0];
  }

  async updateCarModel(id: number, updates: Partial<InsertCarModel>): Promise<CarModel | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.makeId !== undefined) {
      fields.push(`make_id = $${paramIndex}`);
      values.push(updates.makeId);
      paramIndex++;
    }
    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.nameAr !== undefined) {
      fields.push(`name_ar = $${paramIndex}`);
      values.push(updates.nameAr);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getCarModel(id);
    }

    values.push(id);
    const query = `UPDATE car_models SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteCarModel(id: number): Promise<void> {
    await db.query('DELETE FROM car_models WHERE id = $1', [id]);
  }

  async getModelsByIds(ids: number[]): Promise<CarModel[]> {
    if (!ids.length) return [];
    const result = await db.query('SELECT * FROM car_models WHERE id = ANY($1)', [ids]);
    return result;
  }

  // =============================================
  // CAR FEATURE OPERATIONS
  // =============================================

  async getAllCarFeatures(): Promise<CarFeature[]> {
    return await db.query('SELECT * FROM car_features ORDER BY name');
  }

  async getCarFeature(id: number): Promise<CarFeature | undefined> {
    const result = await db.query('SELECT * FROM car_features WHERE id = $1', [id]);
    return result[0];
  }

  async createCarFeature(feature: InsertCarFeature): Promise<CarFeature> {
    const result = await db.query(
      'INSERT INTO car_features (name, name_ar) VALUES ($1, $2) RETURNING *',
      [feature.name, feature.nameAr]
    );
    return result[0];
  }

  async updateCarFeature(id: number, updates: Partial<InsertCarFeature>): Promise<CarFeature | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.nameAr !== undefined) {
      fields.push(`name_ar = $${paramIndex}`);
      values.push(updates.nameAr);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getCarFeature(id);
    }

    values.push(id);
    const query = `UPDATE car_features SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteCarFeature(id: number): Promise<void> {
    await db.query('DELETE FROM car_features WHERE id = $1', [id]);
  }

  // =============================================
  // CAR LISTING OPERATIONS
  // =============================================

  async getAllCarListings(
    filter: Partial<CarListing> & {
      updated_from?: string;
      updated_to?: string;
      year_from?: number;
      year_to?: number;
      isFeatured?: boolean;
      miles_from?: number | string;
      miles_to?: number | string;
      price_from?: number | string;
      price_to?: number | string;
      user_id?: number;
    } = {},
    sortBy?: keyof CarListing,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<(CarListing & {
    package_id?: number;
    start_date?: Date;
    end_date?: Date;
    package_name?: string;
    package_description?: string;
    package_price?: number;
  })[]> {
    console.log('--- START: getAllCarListings ---');
    console.log('Incoming filter parameters:', JSON.stringify(filter, null, 2));
    console.log('Incoming sort parameters:', { sortBy, sortOrder });

    let baseQuery = `
SELECT 
  cl.*, 
  lp.id AS promotion_id,
  lp.package_id, 
  lp.start_date, 
  lp.end_date, 
  lp.is_active,
  lp.transaction_id,
  p.name AS package_name,
  p.description AS package_description,
  p.price AS package_price,
  p.currency AS package_currency,
  p.duration_days AS package_duration_days,
  p.is_featured AS package_is_featured
FROM car_listings cl
INNER JOIN listing_promotions lp ON cl.id = lp.listing_id
  AND lp.end_date > NOW()
LEFT JOIN promotion_packages p ON lp.package_id = p.id
`;

    const whereClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Process filters
    for (const key in filter) {
      if (Object.prototype.hasOwnProperty.call(filter, key)) {
        const value = filter[key as keyof typeof filter];

        console.log(`Processing filter: ${key} =`, value);

        if (value !== undefined && value !== null) {
          switch (key) {
            case 'updated_from': {
              if (typeof value === 'string' || value instanceof Date) {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  whereClauses.push(`updated_at >= $${paramIndex}`);
                  values.push(date.toISOString());
                  console.log(`Added date filter: updated_at >= ${date.toISOString()}`);
                  paramIndex++;
                }
              }
              break;
            }
            case 'updated_to': {
              if (typeof value === 'string' || value instanceof Date) {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  date.setUTCHours(23, 59, 59, 999);
                  whereClauses.push(`updated_at <= $${paramIndex}`);
                  values.push(date.toISOString());
                  console.log(`Added date filter: updated_at <= ${date.toISOString()}`);
                  paramIndex++;
                }
              }
              break;
            }
            case 'year_from':
              whereClauses.push(`year >= $${paramIndex}`);
              values.push(Number(value));
              console.log(`Added year filter: year >= ${Number(value)}`);
              paramIndex++;
              break;
            case 'year_to':
              whereClauses.push(`year <= $${paramIndex}`);
              values.push(Number(value));
              console.log(`Added year filter: year <= ${Number(value)}`);
              paramIndex++;
              break;
            case 'isFeatured':
              whereClauses.push(`is_featured = $${paramIndex}`);
              values.push(value);
              console.log(`Added featured filter: is_featured = ${value}`);
              paramIndex++;
              break;
            case 'user_id':
              whereClauses.push(`user_id = $${paramIndex}`);
              values.push(value);
              console.log(`Added featured filter: user_id = ${value}`);
              paramIndex++;
              break;
            case 'miles_from':
              whereClauses.push(`mileage >= $${paramIndex}`);
              values.push(Number(value));
              console.log(`Added mileage filter: mileage >= ${Number(value)}`);
              paramIndex++;
              break;
            case 'miles_to':
              whereClauses.push(`mileage <= $${paramIndex}`);
              values.push(Number(value));
              console.log(`Added mileage filter: mileage <= ${Number(value)}`);
              paramIndex++;
              break;
            case 'price_from':
              whereClauses.push(`price >= $${paramIndex}`);
              values.push(Number(value));
              console.log(`Added price filter: price >= ${Number(value)}`);
              paramIndex++;
              break;
            case 'price_to':
              whereClauses.push(`price <= $${paramIndex}`);
              values.push(Number(value));
              console.log(`Added price filter: price <= ${Number(value)}`);
              paramIndex++;
              break;
            default:
              whereClauses.push(`${key} = $${paramIndex}`);
              values.push(value);
              console.log(`Added generic filter: ${key} = ${value}`);
              paramIndex++;
              break;
          }
        } else {
          console.log(`Skipping filter ${key} - value is undefined or null`);
        }
      }
    }

    // Build WHERE clause
    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
      console.log('Final WHERE clause:', whereClauses.join(' AND '));
      console.log('Query parameters:', values);
    } else {
      console.log('No filters applied - using base query');
    }

    // Handle sorting
    const validSortFields: (keyof CarListing)[] = [
      'id', 'title', 'price', 'year', 'mileage', 'status', 'updated_at', 'created_at'
    ];

    if (sortBy && validSortFields.includes(sortBy)) {
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      console.log(`Applying sort: ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`);
    } else if (sortBy) {
      console.log(`Invalid sort field: ${sortBy} - skipping sort`);
    }

    console.log('Final SQL query:', baseQuery);

    try {
      const result = await db.query(baseQuery, values);
      console.log('Query successful. Retrieved rows:', result.length);
      console.log('First row (sample):', result.slice(0, 1));

      console.log('--- END: getAllCarListings ---');
      return result;
    } catch (error) {
      console.error('Database query failed:', error);
      console.log('--- END: getAllCarListings (with error) ---');
      throw error;
    }
  }


  async getCarFeaturedListings(filter: Partial<CarListing> = {}, sortBy?: keyof CarListing, sortOrder: 'asc' | 'desc' = 'asc'): Promise<CarListing[]> {
    let baseQuery = 'SELECT * FROM car_listings WHERE is_featured = true';
    const values: any[] = [];
    let paramIndex = 1;

    for (const key in filter) {
      if (Object.prototype.hasOwnProperty.call(filter, key)) {
        const typedKey = key as keyof typeof filter;
        const value = filter[typedKey];

        if (value !== undefined) {
          baseQuery += ` AND ${key} = $${paramIndex}`;
          values.push(value);
          paramIndex++;
        }
      }
    }

    if (sortBy) {
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    return await db.query(baseQuery, values);
  }

  async getCarListingById(id: number): Promise<(CarListingWithFeatures & { currentPackage?: ListingPromotion }) | undefined> {
    const listingResult = await db.query(`SELECT * FROM car_listings WHERE id = $1`, [id]);
    const listing = listingResult[0];
    if (!listing) return undefined;

    const features = await db.query(
      `
    SELECT f.* FROM car_features f
    JOIN car_listing_features clf ON clf.feature_id = f.id
    WHERE clf.listing_id = $1
    `,
      [id]
    );

    const promotionResult = await db.query(
      `
    SELECT 
      lp.*, 
      p.name AS package_name, 
      p.description AS package_description, 
      p.price AS package_price
    FROM listing_promotions lp
    JOIN promotion_packages p ON lp.package_id = p.id
    WHERE lp.listing_id = $1 
      AND lp.is_active = true 
      AND lp.start_date <= NOW() 
      AND lp.end_date > NOW()
    ORDER BY lp.start_date DESC
    LIMIT 1
    `,
      [id]
    );

    const currentPackage = promotionResult[0];

    return {
      ...listing,
      features,
      currentPackage
    };
  }


  async createCarListing(listing: InsertCarListing): Promise<CarListing> {
    const fields = Object.keys(listing);
    const values = Object.values(listing);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO car_listings (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async updateCarListing(id: number, updates: Partial<InsertCarListing>): Promise<CarListing | undefined> {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    console.warn("[updateCarListing] No fields to update");
    return undefined;
  }

  const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const query = `UPDATE car_listings SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
  const result = await db.query(query, [...values, id]);

  return result[0];
}


  async deleteCarListing(id: number): Promise<void> {
  try {
    // Delete dependent rows first
    await db.query('DELETE FROM car_listing_features WHERE listing_id = $1', [id]);
    await db.query('DELETE FROM listing_promotions WHERE listing_id = $1', [id]);

    // Then delete main listing
    await db.query('DELETE FROM car_listings WHERE id = $1', [id]);
  } catch (err) {
    console.error('Failed to delete listing:', err);
    throw new Error('Failed to delete listing and its dependencies');
  }
}



  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    return await db.query('SELECT * FROM car_listings WHERE seller_id = $1 ORDER BY created_at DESC', [sellerId]);
  }

  async incrementListingViews(id: number): Promise<void> {
    await db.query('UPDATE car_listings SET views = views + 1 WHERE id = $1', [id]);
  }

  async updateListingStatus(id: number, status: 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'reject'): Promise<void> {
    await db.query('UPDATE car_listings SET status = $1 WHERE id = $2', [status, id]);
  }

  // =============================================
  // CAR LISTING FEATURES OPERATIONS
  // =============================================

  async getFeaturesForListing(listing_id: number): Promise<CarListingFeature[]> {
    return await db.query('SELECT * FROM car_listing_features WHERE listing_id = $1', [listing_id]);
  }

  async addFeatureToListing(listingId: number, featureId: number): Promise<CarListingFeature> {
    const result = await db.query(
      'INSERT INTO car_listing_features (listing_id, feature_id) VALUES ($1, $2) RETURNING *',
      [listingId, featureId]
    );
    return result[0];
  }

  async removeFeatureFromListing(listingId: number, featureId: number): Promise<void> {
    await db.query(
      'DELETE FROM car_listing_features WHERE listing_id = $1 AND feature_id = $2',
      [listingId, featureId]
    );
  }

  async clearFeaturesForListing(listingId: number): Promise<void> {
    await db.query(`DELETE FROM car_listing_features WHERE listing_id = $1`, [listingId]);
  }


  async bulkAddFeaturesToListing(listingId: number, featureIds: number[]): Promise<void> {
    if (!featureIds.length) return;

    const validFeatures = featureIds
      .filter((id) => typeof id === 'number' && !isNaN(id));

    if (validFeatures.length === 0) return;

    const values = validFeatures
      .map((featureId, i) => `($1, $${i + 2})`)
      .join(", ");

    const params = [listingId, ...validFeatures];

    await db.query(
      `INSERT INTO car_listing_features (listing_id, feature_id) VALUES ${values}`,
      params
    );
  }

  // =============================================
  // FAVORITE OPERATIONS
  // =============================================

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await db.query('SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const result = await db.query(
      'INSERT INTO favorites (user_id, car_id) VALUES ($1, $2) RETURNING *',
      [favorite.userId, favorite.carId]
    );
    return result[0];
  }

  async removeFavorite(userId: number, listingId: number): Promise<void> {
    await db.query('DELETE FROM favorites WHERE user_id = $1 AND car_id = $2', [userId, listingId]);
  }

  async isFavorite(userId: number, listingId: number): Promise<boolean> {
    const result = await db.query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND car_id = $2 LIMIT 1',
      [userId, listingId]
    );
    return result.length > 0;
  }

  // =============================================
  // MESSAGE OPERATIONS
  // =============================================

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return await db.query(
      'SELECT * FROM messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db.query(`
      SELECT * FROM messages 
      WHERE (sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
    `, [user1Id, user2Id]);
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const fields = Object.keys(message);
    const values = Object.values(message);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO messages (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const result = await db.query('SELECT * FROM messages WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async deleteMessage(id: number): Promise<void> {
    await db.query('DELETE FROM messages WHERE id = $1', [id]);
  }

  // =============================================
  // NOTIFICATION OPERATIONS
  // =============================================

  async createNotification(notification: InsertMessage): Promise<Message> {
    const result = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, recipient_type, type, listing_id, content, status) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        notification.senderId,
        notification.receiverId,
        notification.recipientType,
        notification.type,
        notification.listingId,
        notification.content,
        'draft'
      ]
    );
    return result[0];
  }

  async getNotifications(listingId: number): Promise<Message[]> {
    return await db.query(
      'SELECT * FROM messages WHERE listing_id = $1 ORDER BY created_at DESC',
      [listingId]
    );
  }

  async getUserNotifications(userId: number): Promise<Message[]> {
    return await db.query(
      'SELECT * FROM messages WHERE receiver_id = $1 AND type = \'notification\' ORDER BY created_at DESC',
      [userId]
    );
  }

  async getPendingNotifications(): Promise<Message[]> {
    return await db.query(
      'SELECT * FROM messages WHERE status = \'pending\' AND type = \'notification\' ORDER BY created_at ASC'
    );
  }

  async markNotificationSent(id: number, error?: string): Promise<void> {
    if (error) {
      await db.query(
        'UPDATE messages SET status = \'failed\', sent_at = NOW(), error = $1 WHERE id = $2',
        [error, id]
      );
    } else {
      await db.query(
        'UPDATE messages SET status = \'sent\', sent_at = NOW() WHERE id = $1',
        [id]
      );
    }
  }

  async deleteNotification(id: number): Promise<void> {
    await db.query('DELETE FROM messages WHERE id = $1', [id]);
  }

  // =============================================
  // REPORT OPERATIONS
  // =============================================

  async getReports(): Promise<Report[]> {
    return await db.query('SELECT * FROM reports ORDER BY created_at DESC');
  }

  async getReport(id: number): Promise<Report | undefined> {
    const result = await db.query('SELECT * FROM reports WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async addReport(report: InsertReport): Promise<Report> {
    const result = await db.query(
      'INSERT INTO reports (user_id, car_id, reason, details) VALUES ($1, $2, $3, $4) RETURNING *',
      [report.userId, report.carId, report.reason, report.details]
    );
    return result[0];
  }

  async updateReportStatus(id: number, status: 'pending' | 'reviewed' | 'resolved'): Promise<void> {
    await db.query('UPDATE reports SET status = $1 WHERE id = $2', [status, id]);
  }

  async deleteReport(id: number): Promise<void> {
    await db.query('DELETE FROM reports WHERE id = $1', [id]);
  }

  // =============================================
  // SEARCH HISTORY OPERATIONS
  // =============================================

  async getSearchHistoryByUser(userId: number): Promise<SearchHistory[]> {
    return await db.query(
      'SELECT * FROM search_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
  }

  async addSearchHistory(entry: InsertSearchHistory): Promise<SearchHistory> {
    const result = await db.query(
      'INSERT INTO search_history (user_id, query) VALUES ($1, $2) RETURNING *',
      [entry.userId, entry.query]
    );
    return result[0];
  }

  async clearUserSearchHistory(userId: number): Promise<void> {
    await db.query('DELETE FROM search_history WHERE user_id = $1', [userId]);
  }

  // =============================================
  // SETTINGS OPERATIONS
  // =============================================

  async getSettings(): Promise<Settings> {
    const result = await db.query('SELECT * FROM settings LIMIT 1');
    return result[0];
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const query = `UPDATE settings SET ${setClause} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async getEmailConfig(): Promise<Settings['emailConfig']> {
    const result = await db.query('SELECT email_config FROM settings LIMIT 1');
    return result[0]?.email_config;
  }

  async updateEmailConfig(config: Partial<Settings['emailConfig']>): Promise<void> {
    const currentConfig = await this.getEmailConfig();
    const mergedConfig = { ...currentConfig, ...config };
    await db.query('UPDATE settings SET email_config = $1', [mergedConfig]);
  }

  async getSmsConfig(): Promise<Settings['smsConfig']> {
    const result = await db.query('SELECT sms_config FROM settings LIMIT 1');
    return result[0]?.sms_config;
  }

  async updateSmsConfig(config: Partial<Settings['smsConfig']>): Promise<void> {
    const currentConfig = await this.getSmsConfig();
    const mergedConfig = { ...currentConfig, ...config };
    await db.query('UPDATE settings SET sms_config = $1', [mergedConfig]);
  }

  async getGoogleMapsConfig(): Promise<Settings['googleMapsConfig']> {
    const result = await db.query('SELECT sms_config FROM settings LIMIT 1');
    return result[0]?.sms_config;
  }

  async updateGoogleMapsConfig(config: Partial<Settings['googleMapsConfig']>): Promise<void> {
    const currentConfig = await this.getGoogleMapsConfig();
    const mergedConfig = { ...currentConfig, ...config };
    await db.query('UPDATE settings SET oogle_maps_config = $1', [mergedConfig]);
  }

  async getIntegrationConfig(): Promise<Settings['integrations']> {
    const result = await db.query('SELECT integrations FROM settings LIMIT 1');
    return result[0]?.integrations;
  }

  async updateIntegrationConfig(integrations: Partial<Settings['integrations']>): Promise<void> {
    const currentIntegrations = await this.getIntegrationConfig();
    const mergedIntegrations = { ...currentIntegrations, ...integrations };
    await db.query('UPDATE settings SET integrations = $1', [mergedIntegrations]);
  }

  // =============================================
  // STATIC CONTENT OPERATIONS
  // =============================================

  async getAllStaticContents(): Promise<StaticContent[]> {
    return await db.query('SELECT * FROM static_content ORDER BY key');
  }

  async getStaticContentByKey(key: string): Promise<StaticContent | undefined> {
    const result = await db.query('SELECT * FROM static_content WHERE key = $1 LIMIT 1', [key]);
    return result[0];
  }

  async createStaticContent(content: InsertStaticContent): Promise<StaticContent> {
    const result = await db.query(
      'INSERT INTO static_content (key, title, title_ar, content, content_ar) ' +
      'VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [content.key, content.title, content.titleAr, content.content, content.contentAr]
    );
    return result[0];
  }

  async updateStaticContent(id: number, updates: Partial<InsertStaticContent>): Promise<StaticContent | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.key !== undefined) {
      fields.push(`key = $${paramIndex}`);
      values.push(updates.key);
      paramIndex++;
    }
    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex}`);
      values.push(updates.title);
      paramIndex++;
    }
    if (updates.titleAr !== undefined) {
      fields.push(`title_ar = $${paramIndex}`);
      values.push(updates.titleAr);
      paramIndex++;
    }
    if (updates.content !== undefined) {
      fields.push(`content = $${paramIndex}`);
      values.push(updates.content);
      paramIndex++;
    }
    if (updates.contentAr !== undefined) {
      fields.push(`content_ar = $${paramIndex}`);
      values.push(updates.contentAr);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getStaticContentByKey(updates.key || '');
    }

    values.push(id);
    const query = `UPDATE static_content SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteStaticContent(id: number): Promise<void> {
    await db.query('DELETE FROM static_content WHERE id = $1', [id]);
  }

  // =============================================
  // SHOWROOM OPERATIONS
  // =============================================

  async getAllShowrooms(): Promise<Showroom[]> {
    return await db.query('SELECT * FROM showrooms ORDER BY name');
  }

  async getShowroom(id: number): Promise<Showroom | undefined> {
    const result = await db.query('SELECT * FROM showrooms WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async createShowroom(showroom: InsertShowroom): Promise<Showroom> {
    const result = await db.query(
      'INSERT INTO showrooms (user_id, name, name_ar, is_main_branch, parent_id, address, address_ar, location, phone, logo, is_featured) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [
        showroom.userId,
        showroom.name,
        showroom.nameAr,
        showroom.isMainBranch,
        showroom.parentId,
        showroom.address,
        showroom.addressAr,
        showroom.location,
        showroom.phone,
        showroom.logo,
        showroom.isFeatured,
      ]
    );
    return result[0];
  }

  async updateShowroom(id: number, updates: Partial<InsertShowroom>): Promise<Showroom | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.userId !== undefined) {
      fields.push(`user_id = $${paramIndex}`);
      values.push(updates.userId);
      paramIndex++;
    }
    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.nameAr !== undefined) {
      fields.push(`name_ar = $${paramIndex}`);
      values.push(updates.nameAr);
      paramIndex++;
    }
    if (updates.isMainBranch !== undefined) {
      fields.push(`is_main_branch = $${paramIndex}`);
      values.push(updates.isMainBranch);
      paramIndex++;
    }
    if (updates.parentId !== undefined) {
      fields.push(`parent_id = $${paramIndex}`);
      values.push(updates.parentId);
      paramIndex++;
    }
    if (updates.address !== undefined) {
      fields.push(`address = $${paramIndex}`);
      values.push(updates.address);
      paramIndex++;
    }
    if (updates.addressAr !== undefined) {
      fields.push(`address_ar = $${paramIndex}`);
      values.push(updates.addressAr);
      paramIndex++;
    }
    if (updates.location !== undefined) {
      fields.push(`location = $${paramIndex}`);
      values.push(updates.location);
      paramIndex++;
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramIndex}`);
      values.push(updates.phone);
      paramIndex++;
    }

    if (updates.isFeatured !== undefined) {
      fields.push(`is_featured = $${paramIndex}`);
      values.push(updates.isFeatured);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getShowroom(id);
    }

    values.push(id);
    const query = `UPDATE showrooms SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteShowroom(id: number): Promise<void> {
    await db.query('DELETE FROM showrooms WHERE id = $1', [id]);
  }

  async getShowroomsByUser(userId: number): Promise<Showroom[]> {
    return await db.query(
      'SELECT * FROM showrooms WHERE user_id = $1 ORDER BY is_main_branch DESC, name',
      [userId]
    );
  }

  async getMainShowroomByUser(userId: number): Promise<Showroom | undefined> {
    const result = await db.query(
      'SELECT * FROM showrooms WHERE user_id = $1 AND is_main_branch = true LIMIT 1',
      [userId]
    );
    return result[0];
  }

  // =============================================
  // USER ROLE SWITCH OPERATIONS
  // =============================================

  async getUserRoleSwitches(userId: number): Promise<UserRoleSwitch[]> {
    return await db.query(
      'SELECT * FROM user_roles_switch WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  }

  async createUserRoleSwitch(switchData: InsertUserRoleSwitch): Promise<UserRoleSwitch> {
    const result = await db.query(
      'INSERT INTO user_roles_switch (user_id, role, is_active) VALUES ($1, $2, $3) RETURNING *',
      [switchData.userId, switchData.role, switchData.isActive]
    );
    return result[0];
  }

  async activateUserRole(userId: number, role: string): Promise<void> {
    await db.query('BEGIN');
    try {
      // Deactivate all other roles for this user
      await db.query(
        'UPDATE user_roles_switch SET is_active = false WHERE user_id = $1',
        [userId]
      );

      // Activate the specified role
      await db.query(
        'UPDATE user_roles_switch SET is_active = true WHERE user_id = $1 AND role = $2',
        [userId, role]
      );

      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  async deactivateUserRole(userId: number, role: string): Promise<void> {
    await db.query(
      'UPDATE user_roles_switch SET is_active = false WHERE user_id = $1 AND role = $2',
      [userId, role]
    );
  }

  async getActiveUserRole(userId: number): Promise<string | undefined> {
    const result = await db.query(
      'SELECT role FROM user_roles_switch WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );
    return result[0]?.role;
  }

  // =============================================
  // SERVICE OPERATIONS
  // =============================================

  async getAllServices(): Promise<CarService[]> {
    return await db.query('SELECT * FROM car_services ORDER BY name');
  }

  async getAllFeaturedServices(): Promise<any[]> {
    return await db.query(`SELECT
  ss.id AS showroom_service_id,
  ss.is_featured,
  ss.price,
  ss.currency,
  ss.description,
  ss.description_ar,
  cs.id AS service_id,
  cs.name AS service_name,
  cs.name_ar AS service_nameAr,
  s.id AS showroom_id,
  s.name AS showroom_name,
  s.location AS showroom_location
FROM showroom_services ss
JOIN car_services cs ON ss.service_id = cs.id
JOIN showrooms s ON ss.showroom_id = s.id
WHERE ss.is_featured = true
`);
  }


  async getServicesByMake(makeId: number): Promise<ShowroomService[]> {
    const query = `
      SELECT ss.*, cs.*, s.* 
FROM showroom_services ss
JOIN car_services cs ON ss.service_id = cs.id
JOIN showrooms s ON ss.showroom_id = s.id
JOIN showroom_service_makes ssm ON ss.showroom_id = ssm.showroom_id
WHERE ssm.make_id = :makeId
    `;

    return await db.query(query, [makeId]);
  }

  async getShowroomServiceByServiceId(id: number): Promise<any | undefined> {
    const query = `
      SELECT 
        cs.id AS service_id,
        cs.name AS service_name,
        cs.name_ar AS service_name_ar,
        cs.image AS service_image,
        ss.description AS service_description,
        ss.description_ar AS service_description_ar,
        ss.price,
        ss.currency,
        ss.is_featured,
  
        sr.id AS showroom_id,
        sr.name AS showroom_name,
        sr.name_ar AS showroom_name_ar,
        sr.logo,
        sr.is_featured,
        sr.description AS showroom_description,
        sr.description_ar AS showroom_description_ar,
        sr.address,
        sr.address_ar,
        sr.location,
        sr.phone,
        sr.is_main_branch,
  
        cm.id AS make_id,
        cm.name AS make_name,
        cm.name_ar AS make_name_ar,
        cm.image AS make_image
  
      FROM showroom_services ss
      JOIN car_services cs ON ss.service_id = cs.id
      JOIN showrooms sr ON ss.showroom_id = sr.id
      LEFT JOIN showroom_service_makes ssm ON ssm.showroom_id = sr.id
      LEFT JOIN car_makes cm ON ssm.make_id = cm.id
      WHERE cs.id = $1;
    `;

    try {
      const result = await db.query(query, [id]);

      if (result.length === 0) return undefined;

      const firstRow = result[0];

      const makes = result
        .filter(row => row.make_id) // ignore null joins
        .map(row => ({
          id: row.make_id,
          name: row.make_name,
          nameAr: row.make_name_ar,
          image: row.make_image
        }));

      return {
        service: {
          id: firstRow.service_id,
          name: firstRow.service_name,
          nameAr: firstRow.service_name_ar,
          image: firstRow.service_image,
          description: firstRow.service_description,
          descriptionAr: firstRow.service_description_ar
        },
        showroom: {
          id: firstRow.showroom_id,
          name: firstRow.showroom_name,
          nameAr: firstRow.showroom_name_ar,
          logo: firstRow.logo,
          description: firstRow.showroom_description,
          descriptionAr: firstRow.showroom_description_ar,
          isMainBranch: firstRow.is_main_branch,
          address: firstRow.address,
          addressAr: firstRow.address_ar,
          location: firstRow.location,
          phone: firstRow.phone
        },
        makes,
        price: firstRow.price,
        currency: firstRow.currency,
        description: firstRow.description,
        descriptionAr: firstRow.description_ar,
        isFeatured: firstRow.is_featured
      };
    } catch (error) {
      console.error('Error fetching service:', error);
      throw new Error('Failed to fetch service');
    }
  }

  async getService(id: number): Promise<any | undefined> {
    const query = `
      SELECT 
        cs.id AS service_id,
        cs.name AS service_name,
        cs.name_ar AS service_name_ar,
        cs.image AS service_image,
  
        ss.description AS service_description,
        ss.description_ar AS service_description_ar,
        ss.price,
        ss.currency,
        ss.is_featured,
  
        sr.id AS showroom_id,
        sr.name AS showroom_name,
        sr.name_ar AS showroom_name_ar,
        sr.logo,
        sr.description AS showroom_description,
        sr.description_ar AS showroom_description_ar,
        sr.address,
        sr.address_ar,
        sr.location,
        sr.phone,
        sr.is_main_branch,
  
        cm.id AS make_id,
        cm.name AS make_name,
        cm.name_ar AS make_name_ar,
        cm.image AS make_image
  
      FROM showroom_services ss
      JOIN car_services cs ON ss.service_id = cs.id
      JOIN showrooms sr ON ss.showroom_id = sr.id
      LEFT JOIN showroom_service_makes ssm ON ssm.showroom_id = sr.id
      LEFT JOIN car_makes cm ON ssm.make_id = cm.id
      WHERE cs.id = $1;
    `;

    try {
      const result = await db.query(query, [id]);

      if (result.length === 0) return undefined;

      const firstRow = result[0];

      const showroomMap = new Map<number, any>();

      for (const row of result) {
        const showroomId = row.showroom_id;
        if (!showroomMap.has(showroomId)) {
          showroomMap.set(showroomId, {
            id: showroomId,
            name: row.showroom_name,
            nameAr: row.showroom_name_ar,
            logo: row.logo,
            description: row.showroom_description,
            descriptionAr: row.showroom_description_ar,
            isMainBranch: row.is_main_branch,
            address: row.address,
            addressAr: row.address_ar,
            location: row.location,
            phone: row.phone,
            price: row.price,
            currency: row.currency,
            isFeatured: row.is_featured,
            description: row.service_description,
            descriptionAr: row.service_description_ar,
            makes: []
          });
        }

        if (row.make_id) {
          showroomMap.get(showroomId).makes.push({
            id: row.make_id,
            name: row.make_name,
            nameAr: row.make_name_ar,
            image: row.make_image
          });
        }
      }

      return {
        service: {
          id: firstRow.service_id,
          name: firstRow.service_name,
          nameAr: firstRow.service_name_ar,
          image: firstRow.service_image,
          description: firstRow.service_description,
          descriptionAr: firstRow.service_description_ar
        },
        showrooms: Array.from(showroomMap.values())
      };
    } catch (error) {
      console.error('Error fetching service:', error);
      throw new Error('Failed to fetch service');
    }
  }



  async createService(service: InsertCarService): Promise<CarService> {
    const result = await db.query(
      'INSERT INTO car_services (name, name_ar) VALUES ($1, $2) RETURNING *',
      [service.name, service.nameAr]
    );
    return result[0];
  }

  async updateService(id: number, updates: Partial<InsertCarService>): Promise<CarService | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.nameAr !== undefined) {
      fields.push(`name_ar = $${paramIndex}`);
      values.push(updates.nameAr);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getService(id);
    }

    values.push(id);
    const query = `UPDATE car_services SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteService(id: number): Promise<void> {
    await db.query('DELETE FROM car_services WHERE id = $1', [id]);
  }

  // =============================================
  // SHOWROOM SERVICE OPERATIONS
  // =============================================

  async getAllShowroomServices(
    filter?: Partial<ShowroomService>,
    sortBy?: keyof ShowroomService,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<ShowroomService[]> {
    let baseQuery = 'SELECT * FROM showroom_services';
    const whereClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const key in filter) {
      if (Object.prototype.hasOwnProperty.call(filter, key)) {
        const typedKey = key as keyof typeof filter;
        const value = filter[typedKey];

        if (value !== undefined) {
          whereClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }
    }

    if (whereClauses.length) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    if (sortBy) {
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    return await db.query(baseQuery, values);
  }

  async getShowroomServices(showroomId: number): Promise<ShowroomService[]> {
    return await db.query(
      'SELECT * FROM showroom_services WHERE showroom_id = $1 ORDER BY service_id',
      [showroomId]
    );
  }

  async getShowroomService(id: number): Promise<ShowroomService | undefined> {
    const result = await db.query('SELECT * FROM showroom_services WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async getShowroomServicesByShowroomId(
    showroomId: number,
    filter?: Partial<ShowroomService>,
    sortBy?: keyof ShowroomService,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<(ShowroomService & { service?: CarService })[]> {
    // Start with base query and include service data in a single join
    let baseQuery = `
      SELECT ss.*, cs.* 
      FROM showroom_services ss
      LEFT JOIN car_services cs ON ss.service_id = cs.id
      WHERE ss.showroom_id = $1
    `;

    const values: any[] = [showroomId];
    let paramIndex = 2;

    // Apply filters
    if (filter) {
      for (const key in filter) {
        if (Object.prototype.hasOwnProperty.call(filter, key)) {
          const typedKey = key as keyof typeof filter;
          const value = filter[typedKey];

          if (value !== undefined) {
            baseQuery += ` AND ss.${key} = $${paramIndex}`;
            values.push(value);
            paramIndex++;
          }
        }
      }
    }

    // Apply sorting
    if (sortBy) {
      baseQuery += ` ORDER BY ss.${sortBy} ${sortOrder.toUpperCase()}`;
    }

    // Execute single query
    const results = await db.query(baseQuery, values);

    // Map results to combine showroom service and car service data
    return results.map((record) => {
      const { id, created_at, updated_at, ...serviceData } = record;
      const service = serviceData.id ? {
        id: serviceData.id,
        created_at: serviceData.created_at,
        updated_at: serviceData.updated_at,
        ...serviceData
      } : undefined;

      return {
        ...record,
        service
      };
    });
  }


  async createShowroomService(service: InsertShowroomService): Promise<ShowroomService> {
    const result = await db.query(
      'INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar) ' +
      'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        service.showroomId,
        service.serviceId,
        service.price,
        service.currency,
        service.description,
        service.descriptionAr
      ]
    );
    return result[0];
  }

  async updateShowroomService(id: number, updates: Partial<InsertShowroomService>): Promise<ShowroomService | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.showroomId !== undefined) {
      fields.push(`showroom_id = $${paramIndex}`);
      values.push(updates.showroomId);
      paramIndex++;
    }
    if (updates.serviceId !== undefined) {
      fields.push(`service_id = $${paramIndex}`);
      values.push(updates.serviceId);
      paramIndex++;
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramIndex}`);
      values.push(updates.price);
      paramIndex++;
    }
    if (updates.currency !== undefined) {
      fields.push(`currency = $${paramIndex}`);
      values.push(updates.currency);
      paramIndex++;
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }
    if (updates.descriptionAr !== undefined) {
      fields.push(`description_ar = $${paramIndex}`);
      values.push(updates.descriptionAr);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getShowroomService(id);
    }

    values.push(id);
    const query = `UPDATE showroom_services SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteShowroomService(id: number): Promise<void> {
    await db.query('DELETE FROM showroom_services WHERE id = $1', [id]);
  }

  // =============================================
  // SERVICE BOOKING OPERATIONS
  // =============================================

  async getServiceBookingsByUser(userId: number): Promise<ServiceBooking[]> {
    return await db.query(
      'SELECT * FROM service_bookings WHERE user_id = $1 ORDER BY scheduled_at DESC',
      [userId]
    );
  }

  async getServiceBookingsByShowroom(showroomId: number): Promise<ServiceBooking[]> {
    return await db.query(
      `SELECT sb.* FROM service_bookings sb
       JOIN showroom_services ss ON sb.showroom_service_id = ss.id
       WHERE ss.showroom_id = $1
       ORDER BY sb.scheduled_at DESC`,
      [showroomId]
    );
  }

  async getServiceBooking(id: number): Promise<ServiceBooking | undefined> {
    const result = await db.query('SELECT * FROM service_bookings WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking> {
    const result = await db.query(
      'INSERT INTO service_bookings (user_id, service_id, scheduled_at, status, notes) ' +
      'VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        booking.userId,
        booking.serviceId,
        booking.scheduledAt,
        booking.status || 'pending',
        booking.notes
      ]
    );
    return result[0];
  }

  async updateServiceBooking(id: number, updates: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.userId !== undefined) {
      fields.push(`user_id = $${paramIndex}`);
      values.push(updates.userId);
      paramIndex++;
    }
    if (updates.serviceId !== undefined) {
      fields.push(`service_id = $${paramIndex}`);
      values.push(updates.serviceId);
      paramIndex++;
    }
    if (updates.scheduledAt !== undefined) {
      fields.push(`scheduled_at = $${paramIndex}`);
      values.push(updates.scheduledAt);
      paramIndex++;
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      values.push(updates.status);
      paramIndex++;
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      values.push(updates.notes);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getServiceBooking(id);
    }

    values.push(id);
    const query = `UPDATE service_bookings SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async cancelServiceBooking(id: number): Promise<void> {
    await db.query(
      'UPDATE service_bookings SET status = \'cancelled\' WHERE id = $1',
      [id]
    );
  }

  async completeServiceBooking(id: number): Promise<void> {
    await db.query(
      'UPDATE service_bookings SET status = \'completed\' WHERE id = $1',
      [id]
    );
  }

  // =============================================
  // SHOWROOM SERVICE MAKE OPERATIONS
  // =============================================

  async getAllShowroomsMakes(): Promise<any[]> {
    return await db.query('SELECT * FROM showroom_service_makes');
  }

  async getShowroomMakes(
    showroomId: number
  ): Promise<(ShowroomMake & { make?: CarMake })[]> {
    const showroomMakes = await db.query(
      'SELECT * FROM showroom_service_makes WHERE showroom_id = $1',
      [showroomId]
    );

    const enrichedMakes = await Promise.all(
      showroomMakes.map(async (item) => {
        const make = await this.getCarMake(item.make_id); // Assuming `make_id` refers to `car_makes.id`
        return { ...item, make };
      })
    );

    return enrichedMakes;
  }

  async addShowroomMake(serviceId: number, makeId: number): Promise<ShowroomMake> {
    const result = await db.query(
      'INSERT INTO showroom_makes (service_id, make_id) VALUES ($1, $2) RETURNING *',
      [serviceId, makeId]
    );
    return result[0];
  }

  async removeShowroomMake(serviceId: number, makeId: number): Promise<void> {
    await db.query(
      'DELETE FROM showroom_makes WHERE showroom_service_id = $1 AND make_id = $2',
      [serviceId, makeId]
    );
  }

  async bulkAddShowroomMakes(serviceId: number, makeIds: number[]): Promise<void> {
    if (!makeIds.length) return;

    const values = makeIds.map((id, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
      .join(', ');
    const params = makeIds.flatMap(id => [serviceId, id]);

    await db.query(
      `INSERT INTO showroom_makes (showroom_service_id, make_id) VALUES ${values}`,
      params
    );
  }

  // =============================================
  // SUBSCRIPTION PLAN OPERATIONS
  // =============================================

  async getAllSubscriptionPlans(activeOnly: boolean = true): Promise<SubscriptionPlan[]> {
    let query = 'SELECT * FROM subscription_plans';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY price ASC';
    return await db.query(query);
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const result = await db.query('SELECT * FROM subscription_plans WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const result = await db.query(
      'INSERT INTO subscription_plans (name, name_ar, description, description_ar, price, currency, duration_days, ' +
      'listing_limit, featured_listing_limit, priority_listing, showroom_limit, service_limit, is_active) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [
        plan.name,
        plan.nameAr,
        plan.description,
        plan.descriptionAr,
        plan.price,
        plan.currency,
        plan.durationDays,
        plan.listingLimit,
        plan.featuredListingLimit,
        plan.priorityListing,
        plan.showroomLimit,
        plan.serviceLimit,
        plan.isActive
      ]
    );
    return result[0];
  }

  async updateSubscriptionPlan(id: number, updates: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.nameAr !== undefined) {
      fields.push(`name_ar = $${paramIndex}`);
      values.push(updates.nameAr);
      paramIndex++;
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }
    if (updates.descriptionAr !== undefined) {
      fields.push(`description_ar = $${paramIndex}`);
      values.push(updates.descriptionAr);
      paramIndex++;
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramIndex}`);
      values.push(updates.price);
      paramIndex++;
    }
    if (updates.currency !== undefined) {
      fields.push(`currency = $${paramIndex}`);
      values.push(updates.currency);
      paramIndex++;
    }
    if (updates.durationDays !== undefined) {
      fields.push(`duration_days = $${paramIndex}`);
      values.push(updates.durationDays);
      paramIndex++;
    }
    if (updates.listingLimit !== undefined) {
      fields.push(`listing_limit = $${paramIndex}`);
      values.push(updates.listingLimit);
      paramIndex++;
    }
    if (updates.featuredListingLimit !== undefined) {
      fields.push(`featured_listing_limit = $${paramIndex}`);
      values.push(updates.featuredListingLimit);
      paramIndex++;
    }
    if (updates.priorityListing !== undefined) {
      fields.push(`priority_listing = $${paramIndex}`);
      values.push(updates.priorityListing);
      paramIndex++;
    }
    if (updates.showroomLimit !== undefined) {
      fields.push(`showroom_limit = $${paramIndex}`);
      values.push(updates.showroomLimit);
      paramIndex++;
    }
    if (updates.serviceLimit !== undefined) {
      fields.push(`service_limit = $${paramIndex}`);
      values.push(updates.serviceLimit);
      paramIndex++;
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      values.push(updates.isActive);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getSubscriptionPlan(id);
    }

    values.push(id);
    const query = `UPDATE subscription_plans SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deleteSubscriptionPlan(id: number): Promise<void> {
    await db.query('DELETE FROM subscription_plans WHERE id = $1', [id]);
  }

  // =============================================
  // USER SUBSCRIPTION OPERATIONS
  // =============================================

  async getUserSubscriptions(userId: number, activeOnly: boolean = true): Promise<UserSubscription[]> {
    let query = 'SELECT * FROM user_subscriptions WHERE user_id = $1';
    if (activeOnly) {
      query += ' AND is_active = true';
    }
    query += ' ORDER BY start_date DESC';
    return await db.query(query, [userId]);
  }

  async getUserSubscription(subscriptionId: number, activeOnly: boolean = true): Promise<UserSubscription | null> {
    let query = 'SELECT * FROM user_subscriptions WHERE id = $1';
    const values: any[] = [subscriptionId];

    if (activeOnly) {
      query += ' AND is_active = true';
    }

    query += ' ORDER BY start_date DESC LIMIT 1';

    const result = await db.query(query, values);
    return result[0] || null;
  }


  async getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined> {
    const result = await db.query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );
    return result[0];
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const result = await db.query(
      'INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active, auto_renew, transaction_id) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        subscription.userId,
        subscription.planId,
        subscription.startDate,
        subscription.endDate,
        subscription.isActive,
        subscription.autoRenew,
        subscription.transactionId,
      ]
    );
    return result[0];
  }

  async updateUserSubscription(id: number, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.userId !== undefined) {
      fields.push(`user_id = $${paramIndex++}`);
      values.push(updates.userId);
    }
    if (updates.planId !== undefined) {
      fields.push(`plan_id = $${paramIndex++}`);
      values.push(updates.planId);
    }
    if (updates.startDate !== undefined) {
      fields.push(`start_date = $${paramIndex++}`);
      values.push(updates.startDate);
    }
    if (updates.endDate !== undefined) {
      fields.push(`end_date = $${paramIndex++}`);
      values.push(updates.endDate);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.autoRenew !== undefined) {
      fields.push(`auto_renew = $${paramIndex++}`);
      values.push(updates.autoRenew);
    }
    if (updates.transactionId !== undefined) {
      fields.push(`payment_id = $${paramIndex++}`);
      values.push(updates.transactionId);
    }

    if (fields.length === 0) {
      const subscriptions = await this.getUserSubscriptions(id);
      return subscriptions[0]; // ✅ Matches the expected return type
    }


    values.push(id);
    const query = `UPDATE user_subscriptions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result: UserSubscription[] = await db.query(query, values);
    return result[0];
  }



  async cancelUserSubscription(id: number): Promise<void> {
    await db.query(
      'UPDATE user_subscriptions SET is_active = false, auto_renew = false WHERE id = $1',
      [id]
    );
  }

  async renewUserSubscription(id: number): Promise<UserSubscription> {
    const subscriptionList = await this.getUserSubscriptions(id);
    const subscription = subscriptionList[0];
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const plan = await this.getSubscriptionPlan(subscription.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const result: UserSubscription[] = await db.query(
      'UPDATE user_subscriptions SET start_date = $1, end_date = $2, is_active = true WHERE id = $3 RETURNING *',
      [startDate, endDate, id]
    );

    return result[0];
  }


  // =============================================
  // TRANSACTION OPERATIONS
  // =============================================

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await db.query('SELECT * FROM transactions WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const metadata =
      typeof transaction.metadata === 'object' && transaction.metadata !== null
        ? {
          stripePaymentIntentId: transaction.paymentId,
          ...transaction.metadata,
        }
        : { stripePaymentIntentId: transaction.paymentId };

    const result: Transaction[] = await db.query(
      `INSERT INTO transactions (
        user_id, amount, currency, description,
        payment_method, payment_id, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        transaction.userId,
        transaction.amount,
        transaction.currency || 'usd',
        transaction.description || 'One-time payment',
        transaction.paymentMethod || 'stripe',
        transaction.paymentId,
        transaction.status || 'pending',
        metadata
      ]
    );

    return result[0];
  }

  async updateTransactionStatus(id: number, status: 'pending' | 'completed' | 'failed' | 'refunded', options?: { error?: string }): Promise<void> {
    await db.query('UPDATE transactions SET status = $1 WHERE id = $2', [status, id]);
  }

  // =============================================
  // PROMOTION PACKAGE OPERATIONS
  // =============================================

  async getAllPromotionPackages(activeOnly: boolean = true): Promise<PromotionPackage[]> {
    let query = 'SELECT * FROM promotion_packages';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY price ASC';
    return await db.query(query);
  }

  async getPromotionPackage(id: number): Promise<PromotionPackage | undefined> {
    const result = await db.query('SELECT * FROM promotion_packages WHERE id = $1 LIMIT 1', [id]);
    return result[0];
  }

  async createPromotionPackage(pkg: InsertPromotionPackage): Promise<PromotionPackage> {
    const result = await db.query(
      'INSERT INTO promotion_packages (name, name_ar, description, description_ar, price, currency, duration_days, is_featured, priority, is_active) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [
        pkg.name,
        pkg.nameAr,
        pkg.description,
        pkg.descriptionAr,
        pkg.price,
        pkg.currency,
        pkg.durationDays,
        pkg.isFeatured,
        pkg.priority,
        pkg.isActive
      ]
    );
    return result[0];
  }

  async updatePromotionPackage(id: number, updates: Partial<InsertPromotionPackage>): Promise<PromotionPackage | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.nameAr !== undefined) {
      fields.push(`name_ar = $${paramIndex}`);
      values.push(updates.nameAr);
      paramIndex++;
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }
    if (updates.descriptionAr !== undefined) {
      fields.push(`description_ar = $${paramIndex}`);
      values.push(updates.descriptionAr);
      paramIndex++;
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramIndex}`);
      values.push(updates.price);
      paramIndex++;
    }
    if (updates.currency !== undefined) {
      fields.push(`currency = $${paramIndex}`);
      values.push(updates.currency);
      paramIndex++;
    }
    if (updates.durationDays !== undefined) {
      fields.push(`duration_days = $${paramIndex}`);
      values.push(updates.durationDays);
      paramIndex++;
    }
    if (updates.isFeatured !== undefined) {
      fields.push(`is_featured = $${paramIndex}`);
      values.push(updates.isFeatured);
      paramIndex++;
    }
    if (updates.priority !== undefined) {
      fields.push(`priority = $${paramIndex}`);
      values.push(updates.priority);
      paramIndex++;
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      values.push(updates.isActive);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getPromotionPackage(id);
    }

    values.push(id);
    const query = `UPDATE promotion_packages SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  }

  async deletePromotionPackage(id: number): Promise<void> {
    await db.query('DELETE FROM promotion_packages WHERE id = $1', [id]);
  }

  // =============================================
  // LISTING PROMOTION OPERATIONS
  // =============================================

  async getActiveListingPromotions(listingId: number): Promise<ListingPromotion[]> {
    return await db.query(
      'SELECT * FROM listing_promotions WHERE listing_id = $1 AND is_active = true AND end_date > NOW()',
      [listingId]
    );
  }

  async createListingPromotion(promotion: InsertListingPromotion): Promise<ListingPromotion> {
    const result = await db.query(
      'INSERT INTO listing_promotions (listing_id, package_id, start_date, end_date, transaction_id, is_active) ' +
      'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        promotion.listingId,
        promotion.packageId,
        promotion.startDate,
        promotion.endDate,
        promotion.transactionId,
        promotion.isActive !== undefined ? promotion.isActive : true
      ]
    );
    return result[0];
  }

 async updateListingPromotion(
  promotionId: number,
  updates: Partial<{
    packageId: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }>
): Promise<ListingPromotion> {
  // First validate that the promotion exists and is eligible for update
  const existingPromo = await db.query(
    `SELECT * FROM listing_promotions 
     WHERE id = $1 AND is_active = true AND end_date > NOW()`,
    [promotionId]
  );

  if (!existingPromo[0]) {
    throw new Error('Promotion not found, not active, or already expired');
  }

  // Prevent changing start date to be in the past
  if (updates.startDate && updates.startDate < new Date()) {
    throw new Error('Cannot set start date in the past');
  }

  // Ensure end date is after start date (either new or existing)
  if (updates.endDate) {
    const effectiveStartDate = updates.startDate || existingPromo[0].start_date;
    if (updates.endDate <= effectiveStartDate) {
      throw new Error('End date must be after start date');
    }
  }

  // Map from camelCase to snake_case for SQL
  const fieldMap: Record<string, string> = {
    packageId: 'package_id',
    startDate: 'start_date',
    endDate: 'end_date',
    isActive: 'is_active',
  };

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && fieldMap[key]) {
      setClauses.push(`${fieldMap[key]} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(promotionId); // Add the promotion ID as the last parameter

  const query = `
    UPDATE listing_promotions
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result[0];
}


  async getListingPromotionsByListingId(listingId: number): Promise<ListingPromotion[]> {
    return await db.query(
      'SELECT * FROM listing_promotions WHERE listing_id = $1 ORDER BY start_date DESC',
      [listingId]
    );
  }

  async getCurrentListingPromotion(listingId: number): Promise<ListingPromotion | null> {
    const result = await db.query(
      `SELECT * FROM listing_promotions 
     WHERE listing_id = $1 AND is_active = true AND start_date <= NOW() AND end_date > NOW()
     ORDER BY start_date DESC 
     LIMIT 1`,
      [listingId]
    );
    return result.length > 0 ? result[0] : null;
  }

  async deactivateListingPromotion(id: number): Promise<void> {
    await db.query(
      'UPDATE listing_promotions SET is_active = false WHERE id = $1',
      [id]
    );
  }

  async clearPromotionsForListing(listingId: number): Promise<void> {
    await db.query('DELETE FROM listing_promotions WHERE listing_id = $1', [listingId]);
  }

  async getFeaturedListings(): Promise<CarListing[]> {
    return await db.query(`
      SELECT cl.* FROM car_listings cl
      JOIN listing_promotions lp ON cl.id = lp.listing_id
      JOIN promotion_packages pp ON lp.package_id = pp.id
      WHERE lp.is_active = true 
        AND lp.end_date > NOW()
        AND pp.is_featured = true
      ORDER BY pp.priority DESC, lp.start_date DESC
    `);
  }

  async getStripeCustomerId(userId: number): Promise<string | null> {
    const record = await db.query(`SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1`, [userId]);
    return record[0]?.stripe_customer_id || null;
  }

  async saveStripeCustomerId(userId: number, stripeCustomerId: string): Promise<void> {
    await db.query(`
      INSERT INTO stripe_customers (user_id, stripe_customer_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = EXCLUDED.stripe_customer_id
    `, [userId, stripeCustomerId]);
  }
}

export const storage = new DatabaseStorage();
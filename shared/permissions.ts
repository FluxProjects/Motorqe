import { z } from "zod";

// Define all possible permissions
export const Permission = {
  // Buyer Permissions
  BROWSE_LISTINGS: "browse_listings",
  SAVE_SEARCHES: "save_searches",
  SAVE_FAVORITES: "save_favorites",
  CONTACT_SELLERS: "contact_sellers",
  VIEW_SELLER_PROFILES: "view_seller_profiles",
  LEAVE_REVIEWS: "leave_reviews",
  MANAGE_ALERTS: "manage_alerts",

  // Seller Permissions (Private Sellers)
  CREATE_LISTINGS: "create_listings",
  MANAGE_OWN_LISTINGS: "manage_own_listings",
  VIEW_LISTING_ANALYTICS: "view_listing_analytics",
  RESPOND_TO_INQUIRIES: "respond_to_inquiries",
  MANAGE_SELLER_PROFILE: "manage_seller_profile",
  MARK_AS_SOLD: "mark_as_sold",

  // Showroom/Dealer Permissions
  CREATE_SHOWROOM_PROFILE: "create_showroom_profile",
  MANAGE_SHOWROOM_LISTINGS: "manage_showroom_listings",
  MANAGE_SHOWROOM_SERVICES: "manage_showroom_services",
  MANAGE_SHOWROOM_PROFILE: "manage_showroom_profile",
  USE_BULK_UPLOAD: "use_bulk_upload",
  ACCESS_SHOWROOM_ANALYTICS: "access_showroom_analytics",
  MANAGE_SHOWROOM_STAFF: "manage_showroom_staff",
  
  VERIFIED_SELLER_BADGE: "verified_seller_badge",

  // Services
  CREATE_SERVICES: "create_services",
  MANAGE_SERVICES: "manage_services",
  MANAGE_OWN_SERVICES: "manage_own_services",
  MANAGE_SERVICE_PROMOTIONS: "manage_service_promotions",
  MANAGE_ALL_SERVICES: "manage_all_services",

  // Service Bookings
  CREATE_BOOKINGS: "create_bookings",
  MANAGE_BOOKINGS: "manage_bookings",
  MANAGE_SERVICE_BOOKINGS: "manage_service_bookings",
  MANAGE_OWN_BOOKINGS: "manage_own_bookings",

  // Moderator Permissions
  APPROVE_LISTINGS: "approve_listings",
  FLAG_INAPPROPRIATE: "flag_inappropriate",
  TEMP_SUSPEND_USERS: "temp_suspend_users",
  MANAGE_REPORTS: "manage_reports",
  VIEW_MODERATION_LOGS: "view_moderation_logs",

  // Admin Permissions
  MANAGE_ALL_LISTINGS: "manage_all_listings",
  MANAGE_ALL_USERS: "manage_all_users",
  MANAGE_SHOWROOMS: "manage_showrooms",
  MANAGE_PLATFORM_FINANCES: "manage_platform_finances",
  MANAGE_PLATFORM_SETTINGS: "manage_platform_settings",
  VIEW_PLATFORM_ANALYTICS: "view_platform_analytics",
  MANAGE_CONTENT: "manage_content",
  MANAGE_SUPPORT_TICKETS: "manage_support_tickets",
  MANAGE_PAYMENTS: "manage_payments",
  CREATE_PROMOTIONS: "create_promotions",
  MANAGE_PROMOTIONS: "manage_promotions",
  MANAGE_VERIFICATIONS: "manage_verifications",
} as const;

// -------------------------------
// STEP 1: Move basic roles outside
// -------------------------------


const MODERATOR_BASIC = [
  Permission.APPROVE_LISTINGS,
  Permission.FLAG_INAPPROPRIATE,
  Permission.TEMP_SUSPEND_USERS,
  Permission.MANAGE_REPORTS,
  Permission.VIEW_MODERATION_LOGS,
  Permission.BROWSE_LISTINGS,
  Permission.MANAGE_SERVICE_BOOKINGS
];

// -------------------------------
// STEP 2: Now define Roles
// -------------------------------

export const Roles: Record<Role, readonly PermissionType[]> = {
  // Buyer Roles
  BUYER: [
    Permission.BROWSE_LISTINGS,
    Permission.SAVE_SEARCHES,
    Permission.SAVE_FAVORITES,
    Permission.CONTACT_SELLERS,
    Permission.VIEW_SELLER_PROFILES,
    Permission.LEAVE_REVIEWS,
    Permission.MANAGE_ALERTS,
  ],

  // Seller Roles
  SELLER: [
    Permission.BROWSE_LISTINGS,
    Permission.CREATE_LISTINGS,
    Permission.MANAGE_OWN_LISTINGS,
    Permission.VIEW_LISTING_ANALYTICS,
    Permission.RESPOND_TO_INQUIRIES,
    Permission.MANAGE_SELLER_PROFILE,
    Permission.SAVE_FAVORITES,
  ],

  // Showroom Roles
  DEALER: [
    Permission.CREATE_SHOWROOM_PROFILE,
    Permission.MANAGE_SHOWROOM_LISTINGS,
    Permission.ACCESS_SHOWROOM_ANALYTICS,
    Permission.MANAGE_SHOWROOM_PROFILE,
    Permission.RESPOND_TO_INQUIRIES,
    Permission.BROWSE_LISTINGS,
    Permission.CREATE_LISTINGS,
    Permission.MANAGE_OWN_LISTINGS,
    Permission.VIEW_LISTING_ANALYTICS,
    Permission.MANAGE_SELLER_PROFILE,
    Permission.SAVE_FAVORITES,
    
  ],

  GARAGE: [
    Permission.CREATE_SHOWROOM_PROFILE,
    Permission.ACCESS_SHOWROOM_ANALYTICS,
    Permission.MANAGE_SHOWROOM_PROFILE,
    Permission.RESPOND_TO_INQUIRIES,
    Permission.USE_BULK_UPLOAD,
    Permission.CREATE_PROMOTIONS,
    Permission.VERIFIED_SELLER_BADGE,
    Permission.MANAGE_SHOWROOM_STAFF,
    Permission.MANAGE_SHOWROOM_SERVICES,
    Permission.CREATE_SERVICES,
    Permission.MANAGE_OWN_SERVICES,
    Permission.CREATE_BOOKINGS,
    Permission.MANAGE_SERVICE_BOOKINGS,
    Permission.MANAGE_OWN_BOOKINGS,
    Permission.SAVE_FAVORITES,
  ],

  // Moderator Roles
  MODERATOR: MODERATOR_BASIC,

  SENIOR_MODERATOR: [
    ...MODERATOR_BASIC,
    Permission.MANAGE_CONTENT,
    Permission.MANAGE_VERIFICATIONS,
  ],

  // Admin Roles
  ADMIN: [
    Permission.APPROVE_LISTINGS,
    Permission.MANAGE_ALL_LISTINGS,
    Permission.MANAGE_ALL_USERS,
    Permission.MANAGE_SHOWROOMS,
    Permission.MANAGE_PLATFORM_SETTINGS,
    Permission.VIEW_PLATFORM_ANALYTICS,
    Permission.MANAGE_CONTENT,
    Permission.MANAGE_SUPPORT_TICKETS,
    Permission.BROWSE_LISTINGS,
    Permission.CREATE_LISTINGS,
    Permission.CREATE_PROMOTIONS,
    Permission.CREATE_SERVICES,
    Permission.MANAGE_SERVICES,
    Permission.CREATE_BOOKINGS,
    Permission.MANAGE_BOOKINGS,
    Permission.MANAGE_SERVICE_BOOKINGS,
    Permission.MANAGE_ALL_SERVICES,
    Permission.MANAGE_SERVICE_PROMOTIONS
  ],

  SUPER_ADMIN: Object.values(Permission),
};

// Zod schema for role validation
export const roleSchema = z.enum([
  "BUYER",
  "SELLER",
  "DEALER",
  "GARAGE",
  "MODERATOR",
  "SENIOR_MODERATOR",
  "ADMIN",
  "SUPER_ADMIN",
]);

export type Role = z.infer<typeof roleSchema>;
export type PermissionType = typeof Permission[keyof typeof Permission];

// Define the mapping from roleId to the actual role value in the enum
export const roleMapping: Record<number, Role> = {
  1: "BUYER", // roleId 1 maps to 'BUYER'
  2: "SELLER", // roleId 2 maps to 'SELLER'
  3: "DEALER", // roleId 3 maps to 'DEALER'
  4: "GARAGE", // roleId 4 maps to 'GARAGE'
  5: "MODERATOR", // roleId 5 maps to 'MODERATOR'
  6: "SENIOR_MODERATOR", // roleId 6 maps to 'SENIOR_MODERATOR'
  7: "ADMIN", // roleId 7 maps to 'ADMIN'
  8: "SUPER_ADMIN", // roleId 8 maps to 'SUPER_ADMIN'
};

export const roleIdMapping: Record<Role, number> = Object.fromEntries(
  Object.entries(roleMapping).map(([id, name]) => [name, Number(id)])
) as Record<Role, number>;
// Helper function to check if a role has a specific permission
// export const hasPermission = (role: Role, permission: PermissionType): boolean => {
//   return Roles[role].includes(permission as any);
// };

export const hasPermission = (role: Role | undefined, permission: PermissionType): boolean => {
  if (!role || !(role in Roles)) {
    console.warn(`Invalid or missing role: "${role}"`);
    return false;
  }

  const permissions = Roles[role];
  if (!Array.isArray(permissions)) {
    console.warn(`Permissions for role "${role}" are not an array`);
    return false;
  }

  return permissions.includes(permission);
};

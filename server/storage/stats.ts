import { StatDashboard } from "@shared/schema";
import { db } from "../db";

export interface IStatStorage {
  getAllStats(): Promise<StatDashboard>;
}

interface CountResult {
  count: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

interface RecentListing {
  id: string;
  title: string;
  created_at: Date;
}

interface RecentReport {
  id: string;
  reason: string;
  status: string;
  created_at: Date;
}

interface CmsContent {
  id: string;
  title: string;
  content: string;
  updated_at: Date;
}

export const StatStorage = {
  async getAllStats(): Promise<StatDashboard> {
    // Execute all queries in parallel
    const results = await Promise.all([
      db.query('SELECT COUNT(*)::int as count FROM users'),
      db.query('SELECT COUNT(*)::int as count FROM car_listings'),
      db.query("SELECT COUNT(*)::int as count FROM reports WHERE status = 'pending'"),
      db.query("SELECT COUNT(*)::int as count FROM car_listings WHERE status = 'pending'"),
      db.query('SELECT id, first_name, last_name, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'),
      db.query(`
  SELECT 
    car_listings.id,
    car_listings.title,
    car_listings.price,
    car_listings.created_at,
    car_listings.status,
    users.id AS seller_id,
    users.first_name AS seller_name,
    users.username AS seller_username,
    users.email AS seller_email,
    users.phone AS seller_phone,
    users.created_at AS seller_joined_at
  FROM car_listings
  JOIN users ON car_listings.user_id = users.id
  ORDER BY car_listings.created_at DESC
  LIMIT 5
`),
      // db.query('SELECT id, reason, status, created_at FROM reports ORDER BY created_at DESC LIMIT 5'),
      db.query(`
  SELECT 
    reports.id,
    reports.reason,
    reports.status,
    reports.created_at,
    users.id AS user_id,
    users.first_name AS user_first_name,
    users.last_name AS user_last_name,
    users.email AS user_email,
    users.phone AS user_phone,
    users.created_at AS user_created_at,
    car_listings.id AS listing_id,
    car_listings.title AS listing_title,
    car_listings.price AS listing_price,
    car_listings.status AS listing_status,
    car_listings.created_at AS listing_created_at

  FROM reports
  JOIN users ON reports.user_id = users.id
  JOIN car_listings ON reports.listing_id = car_listings.id
  ORDER BY reports.created_at DESC
  LIMIT 5
`),
      db.query(`
  SELECT 
    sc.id,
    sc.title,
    sc.updated_at,
    stats.content_ar_null_count,
    stats.content_ar_filled_count
  FROM static_content sc,
    (
      SELECT 
        COUNT(*) FILTER (WHERE content_ar IS NULL OR content_ar = '') AS content_ar_null_count,
        COUNT(*) FILTER (WHERE content_ar IS NOT NULL AND content_ar <> '') AS content_ar_filled_count
      FROM static_content
    ) AS stats
  ORDER BY sc.updated_at DESC
  LIMIT 5
`),
    ]);

    // Type assertions for each result
    const totalUsersResult = results[0] as CountResult[];
    const totalListingsResult = results[1] as CountResult[];
    const pendingReportsResult = results[2] as CountResult[];
    const pendingListingsResult = results[3] as CountResult[];
    const recentUsers = results[4] as RecentUser[];
    const recentListings = results[5] as RecentListing[];
    const recentReports = results[6] as RecentReport[];
    const cmsOverview = results[7] as CmsContent[];

    // Debug logs
    console.log("👤 Total Users:", totalUsersResult);
    console.log("🚘 Total Listings:", totalListingsResult);
    console.log("📄 Pending Reports:", pendingReportsResult);
    console.log("⏳ Pending Listings:", pendingListingsResult);
    console.log("🆕 Recent Users:", recentUsers);
    console.log("🆕 Recent Listings:", recentListings);
    console.log("🆕 Recent Reports:", recentReports);
    console.log("📚 CMS Overview:", cmsOverview);

    return {
      totalUsers: totalUsersResult[0]?.count ?? 0,
      totalListings: totalListingsResult[0]?.count ?? 0,
      pendingReports: pendingReportsResult[0]?.count ?? 0,
      pendingListings: pendingListingsResult[0]?.count ?? 0,
      recentUsers: recentUsers,
      recentListings: recentListings,
      recentReports: recentReports,
      cmsOverview: cmsOverview,
    };
  },
};
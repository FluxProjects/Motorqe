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
      db.query("SELECT COUNT(*)::int as count FROM reports WHERE status = 'PENDING'"),
      db.query("SELECT COUNT(*)::int as count FROM car_listings WHERE status = 'PENDING'"),
      db.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'),
      db.query('SELECT id, title, created_at FROM car_listings ORDER BY created_at DESC LIMIT 5'),
      db.query('SELECT id, reason, status, created_at FROM reports ORDER BY created_at DESC LIMIT 5'),
      db.query('SELECT id, title, content, updated_at FROM static_content ORDER BY updated_at DESC LIMIT 5'),
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
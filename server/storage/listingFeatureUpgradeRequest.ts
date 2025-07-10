import { db } from "../db";
import {
  ListingFeatureUpgradeRequest,
  InsertListingFeatureUpgradeRequest
} from "@shared/schema";

export interface IListingFeatureUpgradeRequestStorage {

  getAllListingFeatureUpgradeRequests(): Promise<ListingFeatureUpgradeRequest[]>;
  getListingFeatureUpgradeRequest(id: number): Promise<ListingFeatureUpgradeRequest | undefined>;
  getListingFeatureUpgradeRequests(status?: string): Promise<any[]>;
  createListingFeatureUpgradeRequest(data: InsertListingFeatureUpgradeRequest): Promise<ListingFeatureUpgradeRequest>;
  processListingFeatureUpgradeRequest(
    requestId: number,
    status: 'approved' | 'rejected',
    adminId: number,
    remarks?: string
  ): Promise<{ success: boolean }>;
  updateListingFeatureUpgradeRequest(id: number, updates: Partial<InsertListingFeatureUpgradeRequest>): Promise<ListingFeatureUpgradeRequest | undefined>;
  deleteListingFeatureUpgradeRequest(id: number): Promise<void>;

}

export const ListingFeatureUpgradeRequestStorage: IListingFeatureUpgradeRequestStorage = {

  async getAllListingFeatureUpgradeRequests(): Promise<ListingFeatureUpgradeRequest[]> {
    return await db.query(`SELECT * FROM listing_feature_upgrade_requests ORDER BY created_at DESC`);
  },

  async getListingFeatureUpgradeRequest(id: number): Promise<ListingFeatureUpgradeRequest | undefined> {
    const result = await db.query(`SELECT * FROM listing_feature_upgrade_requests WHERE id = $1 LIMIT 1`, [id]);
    return result[0];
  },

  async getListingFeatureUpgradeRequests(status?: string): Promise<any[]> {
      let query = `SELECT * FROM listing_feature_upgrade_requests`;
      const params = [];
  
      if (status) {
        query += ` WHERE status = $1`;
        params.push(status);
      }
  
      const result = await db.query(query, params);
      return result;
    },

  async createListingFeatureUpgradeRequest(data: InsertListingFeatureUpgradeRequest): Promise<ListingFeatureUpgradeRequest> {
    const result = await db.query(
      `INSERT INTO listing_feature_upgrade_requests 
        (listing_id, requested_by, requested_days, status, admin_id, remarks)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.listingId,
        data.requestedBy,
        data.requestedDays,
        data.status ?? "pending",
        data.adminId ?? null,
        data.remarks ?? null
      ]
    );
    return result[0];
  },

  async updateListingFeatureUpgradeRequest(id: number, updates: Partial<InsertListingFeatureUpgradeRequest>): Promise<ListingFeatureUpgradeRequest | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.listingId !== undefined) {
      fields.push(`listing_id = $${paramIndex}`);
      values.push(updates.listingId);
      paramIndex++;
    }
    if (updates.requestedBy !== undefined) {
      fields.push(`requested_by = $${paramIndex}`);
      values.push(updates.requestedBy);
      paramIndex++;
    }
    if (updates.requestedDays !== undefined) {
      fields.push(`requested_days = $${paramIndex}`);
      values.push(updates.requestedDays);
      paramIndex++;
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      values.push(updates.status);
      paramIndex++;
    }
    if (updates.adminId !== undefined) {
      fields.push(`admin_id = $${paramIndex}`);
      values.push(updates.adminId);
      paramIndex++;
    }
    if (updates.remarks !== undefined) {
      fields.push(`remarks = $${paramIndex}`);
      values.push(updates.remarks);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getListingFeatureUpgradeRequest(id);
    }

    // Update updated_at timestamp
    fields.push(`updated_at = NOW()`);

    values.push(id);
    const query = `UPDATE listing_feature_upgrade_requests SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  },

  async processListingFeatureUpgradeRequest(
    requestId: number,
    status: 'approved' | 'rejected',
    adminId: number,
    remarks?: string
  ): Promise<{ success: boolean }> {
    await db.query('BEGIN');

    try {
      // Get the request first
      const resultRequest = await db.query(
        `SELECT * FROM listing_feature_upgrade_requests WHERE id = $1`,
        [requestId]
      );
      const request = resultRequest[0];

      if (!request) {
        throw new Error("Request not found");
      }

      // Update the request status
      await db.query(
        `UPDATE listing_feature_upgrade_requests 
        SET status = $1, admin_id = $2, remarks = $3, updated_at = NOW()
        WHERE id = $4`,
        [status, adminId, remarks, requestId]
      );

      if (status === "approved") {
        await db.query(
          `UPDATE car_listings 
          SET is_featured = true,
              featured_until = NOW() + ($1 || ' days')::INTERVAL
          WHERE id = $2`,
          [request.requested_days, request.listing_id]
        );
      }

      await db.query('COMMIT');
      return { success: true };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  },

  async deleteListingFeatureUpgradeRequest(id: number): Promise<void> {
    await db.query(`DELETE FROM listing_feature_upgrade_requests WHERE id = $1`, [id]);
  }

};

import { db } from "../db";
import {
  ListingPackageUpgradeRequest,
  InsertListingPackageUpgradeRequest,
  AdminCarListing,
  PromotionPackage
} from "@shared/schema";

export interface IListingPackageUpgradeRequestStorage {
  getAllListingPackageUpgradeRequest(): Promise<ListingPackageUpgradeRequest[]>;
  getListingPackageUpgradeRequest(id: number): Promise<ListingPackageUpgradeRequest | undefined>;
  getListingPackageUpgradeRequests(status?: string): Promise<any[]>;
  createListingPackageUpgradeRequest(data: InsertListingPackageUpgradeRequest): Promise<ListingPackageUpgradeRequest>;
  updateListingPackageUpgradeRequest(id: number, updates: Partial<InsertListingPackageUpgradeRequest>): Promise<ListingPackageUpgradeRequest | undefined>;
 processListingPackageUpgradeRequest(
    requestId: number,
    status: 'approved' | 'rejected',
    adminId: number,
    remarks?: string
): Promise<{
    success: boolean,
    data: {
        request: any[],
        listing: AdminCarListing,
        promotion: PromotionPackage
    }
}>;

  deleteListingPackageUpgradeRequest(id: number): Promise<void>;
}

export const ListingPackageUpgradeRequestStorage: IListingPackageUpgradeRequestStorage = {

  async getAllListingPackageUpgradeRequest() {
    return await db.query(`SELECT * FROM listing_package_upgrade_requests ORDER BY created_at DESC`);
  },

  async getListingPackageUpgradeRequest(id) {
    const result = await db.query(
      `
    SELECT 
      lpur.*, 
      pp.*
    FROM 
      listing_package_upgrade_requests lpur
    LEFT JOIN 
      promotion_packages pp 
    ON 
      lpur.requested_package_id = pp.id
    WHERE 
      lpur.id = $1
    LIMIT 1
    `,
      [id]
    );
    return result[0];
  },

  async getListingPackageUpgradeRequests(status?: string): Promise<any[]> {
    let query = `SELECT * FROM listing_package_upgrade_requests`;
    const params = [];

    if (status) {
      query += ` WHERE status = $1`;
      params.push(status);
    }

    const result = await db.query(query, params);
    return result;
  },

  async createListingPackageUpgradeRequest(data) {
    const result = await db.query(
      `INSERT INTO listing_package_upgrade_requests 
        (listing_id, requested_by, requested_package_id, status, admin_id, remarks)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.listingId,
        data.requestedBy,
        data.requestedPackageId,
        data.status ?? "pending",
        data.adminId ?? null,
        data.remarks ?? null
      ]
    );
    return result[0];
  },

  async updateListingPackageUpgradeRequest(id, updates) {
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
    if (updates.requestedPackageId !== undefined) {
      fields.push(`requested_package_id = $${paramIndex}`);
      values.push(updates.requestedPackageId);
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

    if (fields.length === 0) return this.getListingPackageUpgradeRequest(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);
    const result = await db.query(
      `UPDATE listing_package_upgrade_requests SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result[0];
  },

 async processListingPackageUpgradeRequest(
    requestId: number,
    status: 'approved' | 'rejected',
    adminId: number,
    remarks?: string
): Promise<{
    success: boolean,
    data: {
        request: any[],
        listing: AdminCarListing,
        promotion: PromotionPackage
    }
}> {
  await db.query('BEGIN');

  try {
    console.log(`➡️ Starting processListingPackageUpgradeRequest for requestId=${requestId}, status=${status}, adminId=${adminId}`);

    // 1️⃣ Get the upgrade request
    const resultRequest = await db.query(
      `SELECT * FROM listing_package_upgrade_requests WHERE id = $1`,
      [requestId]
    );
    const request = resultRequest[0];
    if (!request) throw new Error(`Request with id ${requestId} not found`);

    // 2️⃣ Update the upgrade request status
    const [updatedRequest] = await db.query(
      `UPDATE listing_package_upgrade_requests 
       SET status = $1, admin_id = $2, remarks = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, adminId, remarks ?? null, requestId]
    );
    if (!updatedRequest) throw new Error(`Failed to update listing_package_upgrade_request with id ${requestId}`);

    let updatedListing = null;
    let promotionRecord = null;

    if (status === "approved") {
      // 3️⃣ Fetch the package details
      const [packageDetails] = await db.query(
        `SELECT * FROM promotion_packages WHERE id = $1`,
        [request.requested_package_id]
      );
      if (!packageDetails) throw new Error(`Promotion package with id ${request.requested_package_id} not found`);

      // 4️⃣ Check if listing exists
      const [listingExists] = await db.query(
        `SELECT id FROM car_listings WHERE id = $1`,
        [request.listing_id]
      );
      if (!listingExists) throw new Error(`Listing with id ${request.listing_id} does not exist.`);

      // 5️⃣ Update the listing with package details
      [updatedListing] = await db.query(
        `UPDATE car_listings
         SET is_featured = $1,
             featured_until = NOW() + ($2 || ' days')::INTERVAL,
             refresh_left = COALESCE(refresh_left, 0) + $3,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [
          packageDetails.is_featured,
          packageDetails.feature_duration ?? 0,
          packageDetails.no_of_refresh ?? 0,
          request.listing_id
        ]
      );
      if (!updatedListing) throw new Error(`Failed to update car_listings for listing_id ${request.listing_id}`);

      // 6️⃣ Handle listing_promotions record
      const existingPromotion = await db.query(
        `SELECT * FROM listing_promotions 
         WHERE listing_id = $1 AND is_active = true AND end_date > NOW()
         LIMIT 1`,
        [request.listing_id]
      );

      if (existingPromotion[0]) {
        [promotionRecord] = await db.query(
          `UPDATE listing_promotions
           SET package_id = $1,
               end_date = end_date + ($2 || ' days')::INTERVAL,
               updated_at = NOW()
           WHERE id = $3
           RETURNING *`,
          [
            packageDetails.id,
            packageDetails.duration_days ?? 0,
            existingPromotion[0].id
          ]
        );
      } else {
        [promotionRecord] = await db.query(
          `INSERT INTO listing_promotions (
            listing_id, package_id, start_date, end_date, is_active, created_at, updated_at
          ) VALUES (
            $1, $2, NOW(), NOW() + ($3 || ' days')::INTERVAL, true, NOW(), NOW()
          ) RETURNING *`,
          [
            request.listing_id,
            packageDetails.id,
            packageDetails.duration_days ?? 0
          ]
        );
      }
    }

    await db.query('COMMIT');

    return {
      success: true,
      data: {
        request: updatedRequest,
        listing: updatedListing,
        promotion: promotionRecord
      }
    };

  } catch (error) {
    await db.query('ROLLBACK');
    console.error(`❌ Failed to process package upgrade for requestId=${requestId}:`, error);
    throw error;
  }
}
,

  async deleteListingPackageUpgradeRequest(id) {
    await db.query(`DELETE FROM listing_package_upgrade_requests WHERE id = $1`, [id]);
  },

};

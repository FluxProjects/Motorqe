import { db } from "../db";
import { ListingPromotion, InsertListingPromotion } from "@shared/schema";

export interface IListingPromotionStorage {

    getActiveListingPromotions(listingId: number): Promise<ListingPromotion[]>;
    getListingPromotionsByListingId(listingId: number): Promise<ListingPromotion[]>;
    getCurrentListingPromotion(listingId: number): Promise<ListingPromotion | null>;
    createListingPromotion(promotion: InsertListingPromotion): Promise<ListingPromotion>;
    updateListingPromotion(
        promotionId: number,
        updates: Partial<{
            packageId: number;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
        }>
    ): Promise<ListingPromotion>;
    deactivateListingPromotion(id: number): Promise<void>;

}

export const ListingPromotionStorage = {

    async getActiveListingPromotions(listingId: number): Promise<ListingPromotion[]> {
        return await db.query(
            'SELECT * FROM listing_promotions WHERE listing_id = $1 AND is_active = true AND end_date > NOW()',
            [listingId]
        );
    },

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
    },

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
    },

    async getListingPromotionsByListingId(listingId: number): Promise<ListingPromotion[]> {
        return await db.query(
            'SELECT * FROM listing_promotions WHERE listing_id = $1 ORDER BY start_date DESC',
            [listingId]
        );
    },

    async getCurrentListingPromotion(listingId: number): Promise<ListingPromotion | null> {
        const result = await db.query(
            `SELECT * FROM listing_promotions 
     WHERE listing_id = $1 AND is_active = true AND start_date <= NOW() AND end_date > NOW()
     ORDER BY start_date DESC 
     LIMIT 1`,
            [listingId]
        );
        return result.length > 0 ? result[0] : null;
    },

    async deactivateListingPromotion(id: number): Promise<void> {
        await db.query(
            'UPDATE listing_promotions SET is_active = false WHERE id = $1',
            [id]
        );
    },

    async clearPromotionsForListing(listingId: number): Promise<void> {
        await db.query('DELETE FROM listing_promotions WHERE listing_id = $1', [listingId]);
    }

};
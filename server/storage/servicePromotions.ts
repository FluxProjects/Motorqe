import { db } from "../db";
import { ServicePromotion, InsertServicePromotion } from "@shared/schema";

export interface IServicePromotionStorage {

    getActiveServicePromotions(serviceId: number): Promise<ServicePromotion[]>;
    getServicePromotionsByServiceId(serviceId: number): Promise<ServicePromotion[]>;
    getCurrentServicePromotion(serviceId: number): Promise<ServicePromotion | null>;
    createServicePromotion(promotion: InsertServicePromotion): Promise<ServicePromotion>;
    updateServicePromotion(
            promotionId: number,
            updates: Partial<{
                packageId: number;
                startDate: Date;
                endDate: Date;
                isActive: boolean;
            }>
        ): Promise<ServicePromotion>;
    deactivateServicePromotion(id: number): Promise<void>;

}

export const ServicePromotionStorage = {

    async getActiveServicePromotions(serviceId: number): Promise<ServicePromotion[]> {
            return await db.query(
                'SELECT * FROM service_promotions WHERE service_id = $1 AND is_active = true AND end_date > NOW()',
                [serviceId]
            );
        },
    
        async createServicePromotion(promotion: InsertServicePromotion): Promise<ServicePromotion> {
            const result = await db.query(
                'INSERT INTO service_promotions (service_id, package_id, start_date, end_date, transaction_id, is_active) ' +
                'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [
                    promotion.serviceId,
                    promotion.packageId,
                    promotion.startDate,
                    promotion.endDate,
                    promotion.transactionId,
                    promotion.isActive !== undefined ? promotion.isActive : true
                ]
            );
            return result[0];
        },
    
        async updateServicePromotion(
            promotionId: number,
            updates: Partial<{
                packageId: number;
                startDate: Date;
                endDate: Date;
                isActive: boolean;
            }>
        ): Promise<ServicePromotion> {
            // First validate that the promotion exists and is eligible for update
            const existingPromo = await db.query(
                `SELECT * FROM service_promotions 
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
        UPDATE service_promotions
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
    
            const result = await db.query(query, values);
            return result[0];
        },
    
        async getServicePromotionsByServiceId(serviceId: number): Promise<ServicePromotion[]> {
            return await db.query(
                'SELECT * FROM service_promotions WHERE service_id = $1 ORDER BY start_date DESC',
                [serviceId]
            );
        },
    
        async getCurrentServicePromotion(serviceId: number): Promise<ServicePromotion | null> {
            const result = await db.query(
                `SELECT * FROM service_promotions 
         WHERE service_id = $1 AND is_active = true AND start_date <= NOW() AND end_date > NOW()
         ORDER BY start_date DESC 
         LIMIT 1`,
                [serviceId]
            );
            return result.length > 0 ? result[0] : null;
        },
    
        async deactivateServicePromotion(id: number): Promise<void> {
            await db.query(
                'UPDATE service_promotions SET is_active = false WHERE id = $1',
                [id]
            );
        },
    
        async clearPromotionsForservice(serviceId: number): Promise<void> {
            await db.query('DELETE FROM service_promotions WHERE service_id = $1', [serviceId]);
        }

};
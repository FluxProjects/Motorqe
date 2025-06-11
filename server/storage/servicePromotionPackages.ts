import { db } from "../db";
import { ServicePromotionPackage, InsertServicePromotionPackage } from "@shared/schema";
import { storage } from "server/storage";

export interface IServicePromotionPackageStorage {

    getAllServicePromotionPackages(activeOnly?: boolean): Promise<ServicePromotionPackage[]>;
    getServicePromotionPackage(id: number): Promise<ServicePromotionPackage | undefined>;
    createServicePromotionPackage(pkg: InsertServicePromotionPackage): Promise<ServicePromotionPackage>;
    updateServicePromotionPackage(id: number, updates: Partial<InsertServicePromotionPackage>): Promise<ServicePromotionPackage | undefined>;
    deleteServicePromotionPackage(id: number): Promise<void>;

}

export const ServicePromotionPackageStorage = {

    async getAllServicePromotionPackages(activeOnly: boolean = true): Promise<ServicePromotionPackage[]> {
            let query = 'SELECT * FROM service_promotion_packages';
            if (activeOnly) {
                query += ' WHERE is_active = true';
            }
            query += ' ORDER BY price ASC';
           const result = await db.query(query);

        console.log("Raw DB result:", result);
        return result;
        },
    
        async getServicePromotionPackage(id: number): Promise<ServicePromotionPackage | undefined> {
            const result = await db.query('SELECT * FROM service_promotion_packages WHERE id = $1 LIMIT 1', [id]);
            return result[0];
        },
    
        async createServicePromotionPackage(pkg: InsertServicePromotionPackage): Promise<ServicePromotionPackage> {
            const result = await db.query(
                'INSERT INTO service_promotion_packages (name, name_ar, description, description_ar, plan, price, currency, duration_days, is_featured, priority, is_active) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
                [
                    pkg.name,
                    pkg.name_ar,
                    pkg.description,
                    pkg.description_ar,
                    pkg.plan,
                    pkg.price,
                    pkg.currency,
                    pkg.duration_days,
                    pkg.is_featured,
                    pkg.priority,
                    pkg.is_active
                ]
            );
            return result[0];
        },
    
        async updateServicePromotionPackage(id: number, updates: Partial<InsertServicePromotionPackage>): Promise<ServicePromotionPackage | undefined> {
            const fields = [];
            const values = [];
            let paramIndex = 1;
    
            if (updates.name !== undefined) {
                fields.push(`name = $${paramIndex}`);
                values.push(updates.name);
                paramIndex++;
            }
            if (updates.name_ar !== undefined) {
                fields.push(`name_ar = $${paramIndex}`);
                values.push(updates.name_ar);
                paramIndex++;
            }
            if (updates.description !== undefined) {
                fields.push(`description = $${paramIndex}`);
                values.push(updates.description);
                paramIndex++;
            }
            if (updates.description_ar !== undefined) {
                fields.push(`description_ar = $${paramIndex}`);
                values.push(updates.description_ar);
                paramIndex++;
            }
            if (updates.plan !== undefined) {
                fields.push(`plan = $${paramIndex}`);
                values.push(updates.plan);
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
            if (updates.duration_days !== undefined) {
                fields.push(`duration_days = $${paramIndex}`);
                values.push(updates.duration_days);
                paramIndex++;
            }
            if (updates.is_featured !== undefined) {
                fields.push(`is_featured = $${paramIndex}`);
                values.push(updates.is_featured);
                paramIndex++;
            }
            if (updates.priority !== undefined) {
                fields.push(`priority = $${paramIndex}`);
                values.push(updates.priority);
                paramIndex++;
            }
            if (updates.is_active !== undefined) {
                fields.push(`is_active = $${paramIndex}`);
                values.push(updates.is_active);
                paramIndex++;
            }
    
            if (fields.length === 0) {
                return storage.getServicePromotionPackage(id);
            }
    
            values.push(id);
            const query = `UPDATE service_promotion_packages SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
            const result = await db.query(query, values);
            return result[0];
        },
    
        async deleteServicePromotionPackage(id: number): Promise<void> {
            await db.query('DELETE FROM service_promotion_packages WHERE id = $1', [id]);
        }

};
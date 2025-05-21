import { db } from "../db";
import { PromotionPackage, InsertPromotionPackage } from "@shared/schema";

export interface IPromotionPackageStorage {

    getAllPromotionPackages(activeOnly?: boolean): Promise<PromotionPackage[]>;
    getPromotionPackage(id: number): Promise<PromotionPackage | undefined>;
    createPromotionPackage(pkg: InsertPromotionPackage): Promise<PromotionPackage>;
    updatePromotionPackage(id: number, updates: Partial<InsertPromotionPackage>): Promise<PromotionPackage | undefined>;
    deletePromotionPackage(id: number): Promise<void>;

}

export const PromotionPackageStorage = {

    async getAllPromotionPackages(activeOnly: boolean = true): Promise<PromotionPackage[]> {
        let query = 'SELECT * FROM promotion_packages';
        if (activeOnly) {
            query += ' WHERE is_active = true';
        }
        query += ' ORDER BY price ASC';
        return await db.query(query);
    },

    async getPromotionPackage(id: number): Promise<PromotionPackage | undefined> {
        const result = await db.query('SELECT * FROM promotion_packages WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },

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
    },

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
    },

    async deletePromotionPackage(id: number): Promise<void> {
        await db.query('DELETE FROM promotion_packages WHERE id = $1', [id]);
    }

};
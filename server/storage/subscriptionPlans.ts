import { db } from "../db";
import { SubscriptionPlan, InsertSubscriptionPlan } from "@shared/schema";

export interface ISubscriptionPlanStorage {

    getAllSubscriptionPlans(activeOnly?: boolean): Promise<SubscriptionPlan[]>;
    getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
    createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
    updateSubscriptionPlan(id: number, updates: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
    deleteSubscriptionPlan(id: number): Promise<void>;

}

export const SubscriptionPlanStorage = {

    async getAllSubscriptionPlans(activeOnly: boolean = true): Promise<SubscriptionPlan[]> {
        let query = 'SELECT * FROM subscription_plans';
        if (activeOnly) {
            query += ' WHERE is_active = true';
        }
        query += ' ORDER BY price ASC';
        return await db.query(query);
    },

    async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
        const result = await db.query('SELECT * FROM subscription_plans WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },

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
    },

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
    },

    async deleteSubscriptionPlan(id: number): Promise<void> {
        await db.query('DELETE FROM subscription_plans WHERE id = $1', [id]);
    }

};
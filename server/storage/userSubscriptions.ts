import { db } from "../db";
import { UserSubscription, InsertUserSubscription } from "@shared/schema";
import { storage } from "server/storage";

export interface IUserSubscriptionStorage {
    getUserSubscriptions(userId: number, activeOnly?: boolean): Promise<UserSubscription[]>;
    getUserSubscription(subscriptionId: number, activeOnly: boolean): Promise<UserSubscription | null>;
    getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined>;
    createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
    updateUserSubscription(id: number, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
    cancelUserSubscription(id: number): Promise<void>;
    renewUserSubscription(id: number): Promise<UserSubscription>;
}

export const UserSubscriptionStorage = {

    async getUserSubscriptions(userId: number, activeOnly: boolean = true): Promise<UserSubscription[]> {
        let query = 'SELECT * FROM user_subscriptions WHERE user_id = $1';
        if (activeOnly) {
            query += ' AND is_active = true';
        }
        query += ' ORDER BY start_date DESC';
        return await db.query(query, [userId]);
    },

    async getUserSubscription(subscriptionId: number, activeOnly: boolean = true): Promise<UserSubscription | null> {
        let query = 'SELECT * FROM user_subscriptions WHERE id = $1';
        const values: any[] = [subscriptionId];

        if (activeOnly) {
            query += ' AND is_active = true';
        }

        query += ' ORDER BY start_date DESC LIMIT 1';

        const result = await db.query(query, values);
        return result[0] || null;
    },

    async getUserActiveSubscription(userId: number): Promise<UserSubscription | undefined> {
        const result = await db.query(
            'SELECT * FROM user_subscriptions WHERE user_id = $1 AND is_active = true LIMIT 1',
            [userId]
        );
        return result[0];
    },

    async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
        const result = await db.query(
            'INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active, auto_renew, transaction_id) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [
                subscription.userId,
                subscription.planId,
                subscription.startDate,
                subscription.endDate,
                subscription.isActive,
                subscription.autoRenew,
                subscription.transactionId,
            ]
        );
        return result[0];
    },

    async updateUserSubscription(id: number, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.userId !== undefined) {
            fields.push(`user_id = $${paramIndex++}`);
            values.push(updates.userId);
        }
        if (updates.planId !== undefined) {
            fields.push(`plan_id = $${paramIndex++}`);
            values.push(updates.planId);
        }
        if (updates.startDate !== undefined) {
            fields.push(`start_date = $${paramIndex++}`);
            values.push(updates.startDate);
        }
        if (updates.endDate !== undefined) {
            fields.push(`end_date = $${paramIndex++}`);
            values.push(updates.endDate);
        }
        if (updates.isActive !== undefined) {
            fields.push(`is_active = $${paramIndex++}`);
            values.push(updates.isActive);
        }
        if (updates.autoRenew !== undefined) {
            fields.push(`auto_renew = $${paramIndex++}`);
            values.push(updates.autoRenew);
        }
        if (updates.transactionId !== undefined) {
            fields.push(`payment_id = $${paramIndex++}`);
            values.push(updates.transactionId);
        }

        if (fields.length === 0) {
            const subscriptions = await this.getUserSubscriptions(id);
            return subscriptions[0]; // ✅ Matches the expected return type
        }


        values.push(id);
        const query = `UPDATE user_subscriptions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

        const result: UserSubscription[] = await db.query(query, values);
        return result[0];
    },

    async cancelUserSubscription(id: number): Promise<void> {
        await db.query(
            'UPDATE user_subscriptions SET is_active = false, auto_renew = false WHERE id = $1',
            [id]
        );
    },

    async renewUserSubscription(id: number): Promise<UserSubscription> {
        const subscriptionList = await this.getUserSubscriptions(id);
        const subscription = subscriptionList[0];
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const plan = await storage.getSubscriptionPlan(subscription.planId);
        if (!plan) {
            throw new Error('Plan not found');
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);

        const result: UserSubscription[] = await db.query(
            'UPDATE user_subscriptions SET start_date = $1, end_date = $2, is_active = true WHERE id = $3 RETURNING *',
            [startDate, endDate, id]
        );

        return result[0];
    }

};
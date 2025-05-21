import { db } from "../db";
import { StripeCustomer, InsertStripeCustomer } from "@shared/schema";

export interface IStripeCustomerStorage {

    getStripeCustomerId(userId: number): Promise<string | null>;
    saveStripeCustomerId(userId: number, stripeCustomerId: string): Promise<void>;

}

export const StripeCustomerStorage = {

    async getStripeCustomerId(userId: number): Promise<string | null> {
        const record = await db.query(`SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1`, [userId]);
        return record[0]?.stripe_customer_id || null;
    },

    async saveStripeCustomerId(userId: number, stripeCustomerId: string): Promise<void> {
        await db.query(`
          INSERT INTO stripe_customers (user_id, stripe_customer_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = EXCLUDED.stripe_customer_id
        `, [userId, stripeCustomerId]);
    }


};
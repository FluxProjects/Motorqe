import { db } from "../db";
import { Transaction, InsertTransaction } from "@shared/schema";

export interface ITransactionStorage {

    getTransactionsByUser(userId: number): Promise<Transaction[]>;
    getTransaction(id: number): Promise<Transaction | undefined>;
    createTransaction(transaction: InsertTransaction): Promise<Transaction>;
    updateTransactionStatus(
        id: number,
        status: 'pending' | 'completed' | 'failed' | 'refunded',
        options?: { error?: string }
    ): Promise<void>;

}

export const TransactionStorage = {

    async getTransactionsByUser(userId: number): Promise<Transaction[]> {
        return await db.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
    },

    async getTransaction(id: number): Promise<Transaction | undefined> {
        const result = await db.query('SELECT * FROM transactions WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },

    async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
        const metadata =
            typeof transaction.metadata === 'object' && transaction.metadata !== null
                ? {
                    stripePaymentIntentId: transaction.paymentId,
                    ...transaction.metadata,
                }
                : { stripePaymentIntentId: transaction.paymentId };

        const result: Transaction[] = await db.query(
            `INSERT INTO transactions (
            user_id, amount, currency, description,
            payment_method, payment_id, status, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
            [
                transaction.userId,
                transaction.amount,
                transaction.currency || 'usd',
                transaction.description || 'One-time payment',
                transaction.paymentMethod || 'stripe',
                transaction.paymentId,
                transaction.status || 'pending',
                metadata
            ]
        );

        return result[0];
    },

    async updateTransactionStatus(id: number, status: 'pending' | 'completed' | 'failed' | 'refunded', options?: { error?: string }): Promise<void> {
        await db.query('UPDATE transactions SET status = $1 WHERE id = $2', [status, id]);
    }

};
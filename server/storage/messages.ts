import { db } from "../db";
import { Message, InsertMessage } from "@shared/schema";

export interface IMessageStorage {

    getMessagesByUser(userId: number): Promise<Message[]>;
    getAllMessages(): Promise<Message[]>;
    getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
    sendMessage(message: InsertMessage): Promise<Message>;
    getMessage(id: number): Promise<Message | undefined>;
    deleteMessage(id: number): Promise<void>;

    sendReply(message: InsertMessage): Promise<Message>;
    updateMessageStatus(id: number, status: string): Promise<void>;

    // Notification operations
    createNotification(notification: InsertMessage): Promise<Message>;
    getNotifications(listingId: number): Promise<Message[]>;
    getUserNotifications(userId: number): Promise<Message[]>;
    getPendingNotifications(): Promise<Message[]>;
    markNotificationSent(id: number, error?: string): Promise<void>;
    deleteNotification(id: number): Promise<void>;

}

export const MessageStorage = {

    async getMessagesByUser(userId: number): Promise<Message[]> {
        return await db.query(
            `
            SELECT 
            m.*,
            sender.id AS sender_id,
            sender.first_name AS sender_first_name,
            sender.last_name AS sender_last_name,
            sender.username AS sender_username,
            sender.email AS sender_email,
            sender.phone AS sender_phone,
            receiver.id AS receiver_id,
            receiver.first_name AS receiver_first_name,
            receiver.last_name AS receiver_last_name,
            receiver.username AS receiver_username,
            receiver.email AS receiver_email,
            receiver.phone AS receiver_phone
            FROM messages m
            LEFT JOIN users sender ON m.sender_id = sender.id
            LEFT JOIN users receiver ON m.receiver_id = receiver.id
            WHERE m.sender_id = $1 OR m.receiver_id = $1
            ORDER BY m.created_at DESC
            `,
            [userId]
        );
    },

    async getAllMessages(): Promise<Message[]> {
        return await db.query(
            `
            SELECT 
            m.*,
            sender.id AS sender_id,
            sender.first_name AS sender_first_name,
            sender.last_name AS sender_last_name,
            sender.username AS sender_username,
            sender.email AS sender_email,
            sender.phone AS sender_phone,
            receiver.id AS receiver_id,
            receiver.first_name AS receiver_first_name,
            receiver.last_name AS receiver_last_name,
            receiver.username AS receiver_username,
            receiver.email AS receiver_email,
            receiver.phone AS receiver_phone
            FROM messages m
            LEFT JOIN users sender ON m.sender_id = sender.id
            LEFT JOIN users receiver ON m.receiver_id = receiver.id
            ORDER BY m.created_at DESC
            `
        );
    },


    async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
        return await db.query(`
          SELECT * FROM messages 
          WHERE (sender_id = $1 AND receiver_id = $2) 
             OR (sender_id = $2 AND receiver_id = $1)
          ORDER BY created_at ASC
        `, [user1Id, user2Id]);
    },

    async sendMessage(message: InsertMessage): Promise<Message> {
        const fields = Object.keys(message);
        const values = Object.values(message);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO messages (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async getMessage(id: number): Promise<Message | undefined> {
        const result = await db.query('SELECT * FROM messages WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },

    async deleteMessage(id: number): Promise<void> {
        await db.query('DELETE FROM messages WHERE id = $1', [id]);
    },

    async sendReply(message: InsertMessage): Promise<Message> {
        const fields = Object.keys(message);
        const values = Object.values(message);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO messages (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async updateMessageStatus(id: number, status: string): Promise<void> {
        const query = 'UPDATE messages SET status = $1 WHERE id = $2';
        await db.query(query, [status, id]);
    },

    // =============================================
    // NOTIFICATION OPERATIONS
    // =============================================

    async createNotification(notification: InsertMessage): Promise<Message> {
        const result = await db.query(
            'INSERT INTO messages (sender_id, receiver_id, recipient_type, type, listing_id, content, status) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [
                notification.senderId,
                notification.receiverId,
                notification.recipientType,
                notification.type,
                notification.listingId,
                notification.content,
                'draft'
            ]
        );
        return result[0];
    },

    async getNotifications(listingId: number): Promise<Message[]> {
        return await db.query(
            'SELECT * FROM messages WHERE listing_id = $1 ORDER BY created_at DESC',
            [listingId]
        );
    },

    async getUserNotifications(userId: number): Promise<Message[]> {
        return await db.query(
            'SELECT * FROM messages WHERE receiver_id = $1 AND type = \'notification\' ORDER BY created_at DESC',
            [userId]
        );
    },

    async getPendingNotifications(): Promise<Message[]> {
        return await db.query(
            'SELECT * FROM messages WHERE status = \'pending\' AND type = \'notification\' ORDER BY created_at ASC'
        );
    },

    async markNotificationSent(id: number, error?: string): Promise<void> {
        if (error) {
            await db.query(
                'UPDATE messages SET status = \'failed\', sent_at = NOW(), error = $1 WHERE id = $2',
                [error, id]
            );
        } else {
            await db.query(
                'UPDATE messages SET status = \'sent\', sent_at = NOW() WHERE id = $1',
                [id]
            );
        }
    },

    async deleteNotification(id: number): Promise<void> {
        await db.query('DELETE FROM messages WHERE id = $1', [id]);
    }

};
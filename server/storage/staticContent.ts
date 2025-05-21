import { db } from "../db";
import { StaticContent, InsertStaticContent } from "@shared/schema";

export interface IStaticContentStorage {

    getAllStaticContents(): Promise<StaticContent[]>;
    getStaticContentByKey(key: string): Promise<StaticContent | undefined>;
    getAllPublishedStaticContents(): Promise<StaticContent[]>;
    getPublishedStaticContentByKey(key: string): Promise<StaticContent | undefined>;
    getStaticContentByPlacement(placement: string): Promise<StaticContent[]>;
    createStaticContent(content: InsertStaticContent): Promise<StaticContent>;
    updateStaticContent(id: number, updates: Partial<InsertStaticContent>): Promise<StaticContent | undefined>;
    deleteStaticContent(id: number): Promise<void>;

}

export const StaticContentStorage = {

    async getAllStaticContents(): Promise<StaticContent[]> {
        return await db.query('SELECT * FROM static_content ORDER BY key');
    },

    async getStaticContentByKey(key: string): Promise<StaticContent | undefined> {
        const result = await db.query('SELECT * FROM static_content WHERE key = $1 LIMIT 1', [key]);
        return result[0];
    },

    async getAllPublishedStaticContents(): Promise<StaticContent[]> {
        return await db.query(
            'SELECT * FROM static_content WHERE status = $1 ORDER BY key',
            ['published']
        );
    },

    async getPublishedStaticContentByKey(key: string): Promise<StaticContent | undefined> {
        const result = await db.query(
            'SELECT * FROM static_content WHERE key = $1 AND status = $2 LIMIT 1',
            [key, 'published']
        );
        return result[0];
    },

    async getStaticContentByPlacement(placement: string): Promise<StaticContent[]> {
        return await db.query(
            'SELECT key, title FROM static_content WHERE (placement = $1 OR placement = $2) AND status = $3 ORDER BY key',
            [placement, 'both', 'published']
        );
    },

    async createStaticContent(content: InsertStaticContent): Promise<StaticContent> {
        const result = await db.query(
            'INSERT INTO static_content (key, title, title_ar, content, content_ar) ' +
            'VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [content.key, content.title, content.titleAr, content.content, content.contentAr]
        );
        return result[0];
    },

    async updateStaticContent(id: number, updates: Partial<InsertStaticContent>): Promise<StaticContent | undefined> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.key !== undefined) {
            fields.push(`key = $${paramIndex}`);
            values.push(updates.key);
            paramIndex++;
        }
        if (updates.title !== undefined) {
            fields.push(`title = $${paramIndex}`);
            values.push(updates.title);
            paramIndex++;
        }
        if (updates.titleAr !== undefined) {
            fields.push(`title_ar = $${paramIndex}`);
            values.push(updates.titleAr);
            paramIndex++;
        }
        if (updates.content !== undefined) {
            fields.push(`content = $${paramIndex}`);
            values.push(updates.content);
            paramIndex++;
        }
        if (updates.contentAr !== undefined) {
            fields.push(`content_ar = $${paramIndex}`);
            values.push(updates.contentAr);
            paramIndex++;
        }

        if (fields.length === 0) {
            return this.getStaticContentByKey(updates.key || '');
        }

        values.push(id);
        const query = `UPDATE static_content SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async deleteStaticContent(id: number): Promise<void> {
        await db.query('DELETE FROM static_content WHERE id = $1', [id]);
    }

};
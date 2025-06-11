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
        return await db.query('SELECT * FROM static_content ORDER BY created_at DESC');
    },

    async getStaticContentByKey(key: string): Promise<StaticContent | undefined> {
        const result = await db.query('SELECT * FROM static_content WHERE key = $1 LIMIT 1', [key]);
        return result[0];
    },

    async getStaticContentById(id: number): Promise<StaticContent | undefined> {
        const result = await db.query('SELECT * FROM static_content WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },

    async getAllPublishedStaticContents(): Promise<StaticContent[]> {
        return await db.query(
            'SELECT * FROM static_content WHERE status = $1 ORDER BY created_at DESC',
            ['published']
        );
    },

    async getStaticContentByPlacement(placement: string): Promise<StaticContent[]> {
        return await db.query(
            'SELECT key, title FROM static_content WHERE (placement = $1 OR placement = $2) AND status = $3 ORDER BY key',
            [placement, 'both', 'published']
        );
    },

    async getPublishedStaticContentByKey(key: string): Promise<StaticContent | undefined> {
        const result = await db.query(
            'SELECT * FROM static_content WHERE key = $1 AND status = $2 LIMIT 1',
            [key, 'published']
        );
        return result[0];
    },

    async createStaticContent(content: InsertStaticContent): Promise<StaticContent> {
        const result = await db.query(
            `INSERT INTO static_content 
            (key, title, title_ar, content, content_ar, author, placement, status, full_width) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                content.key, 
                content.title, 
                content.titleAr, 
                content.content, 
                content.contentAr,
                content.author,
                content.placement || 'both',
                content.status || 'draft',
                content.fullWidth || false
            ]
        );
        return result[0];
    },

    async updateStaticContent(id: number, updates: Partial<InsertStaticContent>): Promise<StaticContent | undefined> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Dynamic field updates
        const fieldMappings = {
            key: 'key',
            title: 'title',
            titleAr: 'title_ar',
            content: 'content',
            contentAr: 'content_ar',
            status: 'status',
            placement: 'placement',
            fullWidth: 'full_width'
        };

        Object.entries(updates).forEach(([key, value]) => {
            if (key in fieldMappings && value !== undefined) {
                fields.push(`${fieldMappings[key as keyof typeof fieldMappings]} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        if (fields.length === 0) {
            return this.getStaticContentById(id);
        }

        // Always update the updated_at timestamp
        fields.push(`updated_at = $${paramIndex}`);
        values.push(new Date());
        paramIndex++;

        values.push(id);
        const query = `UPDATE static_content SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async deleteStaticContent(id: number): Promise<void> {
        await db.query('DELETE FROM static_content WHERE id = $1', [id]);
    }

    

};
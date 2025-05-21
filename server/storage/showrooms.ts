import { db } from "../db";
import { Showroom, InsertShowroom } from "@shared/schema";

export interface IShowroomStorage {

    getAllShowrooms(): Promise<Showroom[]>;
    getShowroom(id: number): Promise<Showroom | undefined>;
    createShowroom(showroom: InsertShowroom): Promise<Showroom>;
    updateShowroom(id: number, updates: Partial<InsertShowroom>): Promise<Showroom | undefined>;
    deleteShowroom(id: number): Promise<void>;
    getShowroomsByUser(userId: number): Promise<Showroom[]>;
    getMainShowroomByUser(userId: number): Promise<Showroom | undefined>;

}

export const ShowroomStorage = {

    async getAllShowrooms(): Promise<Showroom[]> {
        return await db.query('SELECT * FROM showrooms ORDER BY name');
    },

    async getShowroom(id: number): Promise<Showroom | undefined> {
        const result = await db.query('SELECT * FROM showrooms WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },

    async createShowroom(showroom: InsertShowroom): Promise<Showroom> {
        const result = await db.query(
            'INSERT INTO showrooms (user_id, name, name_ar, is_main_branch, parent_id, address, address_ar, location, phone, logo, is_featured) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [
                showroom.userId,
                showroom.name,
                showroom.nameAr,
                showroom.isMainBranch,
                showroom.parentId,
                showroom.address,
                showroom.addressAr,
                showroom.location,
                showroom.phone,
                showroom.logo,
                showroom.isFeatured,
            ]
        );
        return result[0];
    },

    async updateShowroom(id: number, updates: Partial<InsertShowroom>): Promise<Showroom | undefined> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.userId !== undefined) {
            fields.push(`user_id = $${paramIndex}`);
            values.push(updates.userId);
            paramIndex++;
        }
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
        if (updates.isMainBranch !== undefined) {
            fields.push(`is_main_branch = $${paramIndex}`);
            values.push(updates.isMainBranch);
            paramIndex++;
        }
        if (updates.parentId !== undefined) {
            fields.push(`parent_id = $${paramIndex}`);
            values.push(updates.parentId);
            paramIndex++;
        }
        if (updates.address !== undefined) {
            fields.push(`address = $${paramIndex}`);
            values.push(updates.address);
            paramIndex++;
        }
        if (updates.addressAr !== undefined) {
            fields.push(`address_ar = $${paramIndex}`);
            values.push(updates.addressAr);
            paramIndex++;
        }
        if (updates.location !== undefined) {
            fields.push(`location = $${paramIndex}`);
            values.push(updates.location);
            paramIndex++;
        }
        if (updates.phone !== undefined) {
            fields.push(`phone = $${paramIndex}`);
            values.push(updates.phone);
            paramIndex++;
        }

        if (updates.isFeatured !== undefined) {
            fields.push(`is_featured = $${paramIndex}`);
            values.push(updates.isFeatured);
            paramIndex++;
        }

        if (fields.length === 0) {
            return this.getShowroom(id);
        }

        values.push(id);
        const query = `UPDATE showrooms SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async deleteShowroom(id: number): Promise<void> {
        await db.query('DELETE FROM showrooms WHERE id = $1', [id]);
    },

    async getShowroomsByUser(userId: number): Promise<Showroom[]> {
        return await db.query(
            'SELECT * FROM showrooms WHERE user_id = $1 ORDER BY is_main_branch DESC, name',
            [userId]
        );
    },

    async getMainShowroomByUser(userId: number): Promise<Showroom | undefined> {
        const result = await db.query(
            'SELECT * FROM showrooms WHERE user_id = $1 AND is_main_branch = true LIMIT 1',
            [userId]
        );
        return result[0];
    }

};
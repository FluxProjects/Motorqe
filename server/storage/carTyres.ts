import { db } from "../db";
import { CarTyre, InsertCarTyre } from "@shared/schema";

export interface ICarTyreStorage {
    getAllCarTyres(): Promise<CarTyre[]>;
    getCarTyre(id: number): Promise<CarTyre | undefined>;
    createCarTyre(tyre: InsertCarTyre): Promise<CarTyre>;
    updateCarTyre(id: number, updates: Partial<InsertCarTyre>): Promise<CarTyre | undefined>;
    deleteCarTyre(id: number): Promise<void>;
}

export const CarTyreStorage: ICarTyreStorage = {

    async getAllCarTyres(): Promise<CarTyre[]> {
        return await db.query(`SELECT * FROM car_tyres ORDER BY id`);
    },

    async getCarTyre(id: number): Promise<CarTyre | undefined> {
        const result = await db.query(`SELECT * FROM car_tyres WHERE id = $1`, [id]);
        return result[0];
    },

    async createCarTyre(tyre: InsertCarTyre): Promise<CarTyre> {
        const result = await db.query(
            `INSERT INTO car_tyres (
                listing_id,
                front_tyre_size,
                front_tyre_price,
                rear_tyre_size,
                rear_tyre_price
            ) VALUES (
                $1, $2, $3, $4, $5
            ) RETURNING *`,
            [
                tyre.listingId,
                tyre.frontTyreSize ?? null,
                tyre.frontTyrePrice ?? null,
                tyre.rearTyreSize ?? null,
                tyre.rearTyrePrice ?? null,
            ]
        );
        return result[0];
    },

    async updateCarTyre(id: number, updates: Partial<InsertCarTyre>): Promise<CarTyre | undefined> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updates.listingId !== undefined) {
            fields.push(`listing_id = $${paramIndex}`);
            values.push(updates.listingId);
            paramIndex++;
        }
        if (updates.frontTyreSize !== undefined) {
            fields.push(`front_tyre_size = $${paramIndex}`);
            values.push(updates.frontTyreSize);
            paramIndex++;
        }
        if (updates.frontTyrePrice !== undefined) {
            fields.push(`front_tyre_price = $${paramIndex}`);
            values.push(updates.frontTyrePrice);
            paramIndex++;
        }
        if (updates.rearTyreSize !== undefined) {
            fields.push(`rear_tyre_size = $${paramIndex}`);
            values.push(updates.rearTyreSize);
            paramIndex++;
        }
        if (updates.rearTyrePrice !== undefined) {
            fields.push(`rear_tyre_price = $${paramIndex}`);
            values.push(updates.rearTyrePrice);
            paramIndex++;
        }

        if (fields.length === 0) {
            return this.getCarTyre(id);
        }

        values.push(id);
        const query = `UPDATE car_tyres SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async deleteCarTyre(id: number): Promise<void> {
        await db.query(`DELETE FROM car_tyres WHERE id = $1`, [id]);
    },
};

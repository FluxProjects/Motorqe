import { db } from "../db";
import bcrypt from "bcryptjs";
import { CarMake, InsertCarMake } from "@shared/schema";
import { M } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

export interface ICarMakeStorage {

    getAllCarMakes(): Promise<CarMake[]>;
    getCarMake(id: number): Promise<CarMake | undefined>;
    createCarMake(make: InsertCarMake): Promise<CarMake>;
    updateCarMake(id: number, updates: Partial<InsertCarMake>): Promise<CarMake | undefined>;
    deleteCarMake(id: number): Promise<void>;
    getMakesByIds(ids: number[]): Promise<CarMake[]>;

}

export const CarMakeStorage = {

    async getAllCarMakes(): Promise<CarMake[]> {
        return await db.query('SELECT * FROM car_makes ORDER BY name');
    },
    
      async getCarMake(id: number): Promise<CarMake | undefined> {
        const result = await db.query('SELECT * FROM car_makes WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },
    
      async createCarMake(make: InsertCarMake): Promise<CarMake> {
        const result = await db.query(
            'INSERT INTO car_makes (name, name_ar, image) VALUES ($1, $2, $3) RETURNING *',
            [make.name, make.nameAr, make.image]
        );
        return result[0];
    },
    
      async updateCarMake(id: number, updates: Partial<InsertCarMake>): Promise<CarMake | undefined> {
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
        if (updates.image !== undefined) {
            fields.push(`image = $${paramIndex}`);
            values.push(updates.image);
            paramIndex++;
        }

        if (fields.length === 0) {
            return this.getCarMake(id);
        }

        values.push(id);
        const query = `UPDATE car_makes SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },
    
      async deleteCarMake(id: number): Promise<void> {
        await db.query('DELETE FROM car_makes WHERE id = $1', [id]);
    },
    
      async getMakesByIds(ids: number[]): Promise<CarMake[]> {
        if (!ids.length) return [];
        const result = await db.query('SELECT * FROM car_makes WHERE id = ANY($1)', [ids]);
        return result;
    }


};
import { db } from "../db";
import { CarModel, InsertCarModel } from "@shared/schema";

export interface ICarModelStorage {

    getCarModelsByMake(makeId: number): Promise<CarModel[]>;
    getCarModel(id: number): Promise<CarModel | undefined>;
    createCarModel(model: InsertCarModel): Promise<CarModel>;
    updateCarModel(id: number, updates: Partial<InsertCarModel>): Promise<CarModel | undefined>;
    deleteCarModel(id: number): Promise<void>;
    getModelsByIds(ids: number[]): Promise<CarModel[]>;

}

export const CarModelStorage = {

    async getCarModelsByMake(makeId: number): Promise<CarModel[]> {
        return await db.query('SELECT * FROM car_models WHERE make_id = $1 ORDER BY name', [makeId]);
    },

    async getCarModel(id: number): Promise<CarModel | undefined> {
        const result = await db.query('SELECT * FROM car_models WHERE id = $1', [id]);
        return result[0];
    },

    async createCarModel(model: InsertCarModel): Promise<CarModel> {
        const result = await db.query(
            'INSERT INTO car_models (make_id, name, name_ar) VALUES ($1, $2, $3) RETURNING *',
            [model.makeId, model.name, model.nameAr]
        );
        return result[0];
    },

    async updateCarModel(id: number, updates: Partial<InsertCarModel>): Promise<CarModel | undefined> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.makeId !== undefined) {
            fields.push(`make_id = $${paramIndex}`);
            values.push(updates.makeId);
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

        if (fields.length === 0) {
            return this.getCarModel(id);
        }

        values.push(id);
        const query = `UPDATE car_models SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async deleteCarModel(id: number): Promise<void> {
        await db.query('DELETE FROM car_models WHERE id = $1', [id]);
    },

    async getModelsByIds(ids: number[]): Promise<CarModel[]> {
        if (!ids.length) return [];
        const result = await db.query('SELECT * FROM car_models WHERE id = ANY($1)', [ids]);
        return result;
    }

};
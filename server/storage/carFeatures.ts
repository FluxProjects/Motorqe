import { db } from "../db";
import { CarFeature, InsertCarFeature } from "@shared/schema";

export interface ICarFeatureStorage {

    getAllCarFeatures(): Promise<CarFeature[]>;
    getCarFeature(id: number): Promise<CarFeature | undefined>;
    createCarFeature(feature: InsertCarFeature): Promise<CarFeature>;
    updateCarFeature(id: number, updates: Partial<InsertCarFeature>): Promise<CarFeature | undefined>;
    deleteCarFeature(id: number): Promise<void>;

}

export const CarFeatureStorage = {

    async getAllCarFeatures(): Promise<CarFeature[]> {
        return await db.query('SELECT * FROM car_features ORDER BY name');
    },
    
      async getCarFeature(id: number): Promise<CarFeature | undefined> {
        const result = await db.query('SELECT * FROM car_features WHERE id = $1', [id]);
        return result[0];
    },
    
      async createCarFeature(feature: InsertCarFeature): Promise<CarFeature> {
        const result = await db.query(
            'INSERT INTO car_features (name, name_ar) VALUES ($1, $2) RETURNING *',
            [feature.name, feature.nameAr]
        );
        return result[0];
    },
    
      async updateCarFeature(id: number, updates: Partial<InsertCarFeature>): Promise<CarFeature | undefined> {
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

        if (fields.length === 0) {
            return this.getCarFeature(id);
        }

        values.push(id);
        const query = `UPDATE car_features SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },
    
      async deleteCarFeature(id: number): Promise<void> {
        await db.query('DELETE FROM car_features WHERE id = $1', [id]);
    }

};
import { db } from "../db";
import { CarCategory, InsertCarCategory } from "@shared/schema";

export interface ICarCategoryStorage {

    getAllCarCategories(): Promise<CarCategory[]>;
    getCarCategory(id: number): Promise<CarCategory | undefined>;
    createCarCategory(category: InsertCarCategory): Promise<CarCategory>;
    updateCarCategory(id: number, updates: Partial<InsertCarCategory>): Promise<CarCategory | undefined>;
    deleteCarCategory(id: number): Promise<void>;

}

export const CarCategoryStorage = {

    async getAllCarCategories(): Promise<CarCategory[]> {
        return await db.query('SELECT * FROM car_categories ORDER BY name');
      },
    
      async getCarCategory(id: number): Promise<CarCategory | undefined> {
        const result = await db.query('SELECT * FROM car_categories WHERE id = $1 LIMIT 1', [id]);
        return result[0];
      },
    
      async createCarCategory(category: InsertCarCategory): Promise<CarCategory> {
        const result = await db.query(
          'INSERT INTO car_categories (name, name_ar, image) VALUES ($1, $2, $3) RETURNING *',
          [category.name, category.nameAr, category.image]
        );
        return result[0];
      },
    
      async updateCarCategory(id: number, updates: Partial<InsertCarCategory>): Promise<CarCategory | undefined> {
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
          return this.getCarCategory(id);
        }
    
        values.push(id);
        const query = `UPDATE car_categories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
      },
    
      async deleteCarCategory(id: number): Promise<void> {
        await db.query('DELETE FROM car_categories WHERE id = $1', [id]);
      }

};
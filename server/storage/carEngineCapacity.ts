import { db } from "../db";
import { CarEngineCapacity, InsertCarEngineCapacity } from "@shared/schema";

export interface ICarEngineCapacityStorage {

    getAllEngineCapacities(): Promise<CarEngineCapacity[]>;
    getEngineCapacity(id: number): Promise<CarEngineCapacity | undefined>;
    createEngineCapacity(data: InsertCarEngineCapacity): Promise<CarEngineCapacity>;
    updateEngineCapacity(
        id: number,
        updates: Partial<InsertCarEngineCapacity>
      ): Promise<CarEngineCapacity | undefined>;
    deleteEngineCapacity(id: number): Promise<void>;

}

export const CarEngineCapacityStorage = {
    
     async getAllEngineCapacities(): Promise<CarEngineCapacity[]> {
        const result = await db.query('SELECT * FROM car_engine_capacities ORDER BY id');
        return result[0];
      },
    
      async getEngineCapacity(id: number): Promise<CarEngineCapacity | undefined> {
        const result = await db.query(
          'SELECT * FROM car_engine_capacities WHERE id = $1 LIMIT 1',
          [id]
        );
        return result[0];
      },
    
      async createEngineCapacity(data: InsertCarEngineCapacity): Promise<CarEngineCapacity> {
        const result = await db.query(
          `INSERT INTO car_engine_capacities (size_liters, label, description)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [data.sizeLiters, data.label, data.description]
        );
        return result[0];
      },
    
      async updateEngineCapacity(
        id: number,
        updates: Partial<InsertCarEngineCapacity>
      ): Promise<CarEngineCapacity | undefined> {
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;
    
        if (updates.sizeLiters !== undefined) {
          fields.push(`size_liters = $${index++}`);
          values.push(updates.sizeLiters);
        }
        if (updates.label !== undefined) {
          fields.push(`label = $${index++}`);
          values.push(updates.label);
        }
    
        if (fields.length === 0) return this.getEngineCapacity(id); // nothing to update
    
        values.push(id);
    
        const query = `
          UPDATE car_engine_capacities
          SET ${fields.join(', ')}
          WHERE id = $${index}
          RETURNING *`;
    
        const result = await db.query(query, values);
        return result[0];
      },
    
      async deleteEngineCapacity(id: number): Promise<void> {
        await db.query('DELETE FROM car_engine_capacities WHERE id = $1', [id]);
      }
    
}
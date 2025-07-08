import { db } from "../db";
import { CarPart, InsertCarPart } from "@shared/schema";

export interface ICarPartStorage {
    getAllCarParts(): Promise<CarPart[]>;
    getCarPart(id: number): Promise<CarPart | undefined>;
    createCarPart(part: InsertCarPart): Promise<CarPart>;
    updateCarPart(id: number, updates: Partial<InsertCarPart>): Promise<CarPart | undefined>;
    deleteCarPart(id: number): Promise<void>;
}

export const CarPartStorage: ICarPartStorage = {

    async getAllCarParts(): Promise<CarPart[]> {
        return await db.query(`SELECT * FROM car_parts ORDER BY id`);
    },

    async getCarPart(id: number): Promise<CarPart | undefined> {
        const result = await db.query(`SELECT * FROM car_parts WHERE id = $1`, [id]);
        return result[0];
    },

    async createCarPart(part: InsertCarPart): Promise<CarPart> {
        const result = await db.query(
            `INSERT INTO car_parts (
                listing_id,
                engine_oil,
                engine_oil_filter,
                gearbox_oil,
                ac_filter,
                air_filter,
                fuel_filter,
                spark_plugs,
                front_brake_pads,
                rear_brake_pads,
                front_brake_discs,
                rear_brake_discs,
                battery
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
            ) RETURNING *`,
            [
                part.listingId,
                part.engineOil ?? null,
                part.engineOilFilter ?? null,
                part.gearboxOil ?? null,
                part.acFilter ?? null,
                part.airFilter ?? null,
                part.fuelFilter ?? null,
                part.sparkPlugs ?? null,
                part.frontBrakePads ?? null,
                part.rearBrakePads ?? null,
                part.frontBrakeDiscs ?? null,
                part.rearBrakeDiscs ?? null,
                part.battery ?? null
            ]
        );
        return result[0];
    },

    async updateCarPart(id: number, updates: Partial<InsertCarPart>): Promise<CarPart | undefined> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updates.listingId !== undefined) {
            fields.push(`listing_id = $${paramIndex}`);
            values.push(updates.listingId);
            paramIndex++;
        }
        if (updates.engineOil !== undefined) {
            fields.push(`engine_oil = $${paramIndex}`);
            values.push(updates.engineOil);
            paramIndex++;
        }
        if (updates.engineOilFilter !== undefined) {
            fields.push(`engine_oil_filter = $${paramIndex}`);
            values.push(updates.engineOilFilter);
            paramIndex++;
        }
        if (updates.gearboxOil !== undefined) {
            fields.push(`gearbox_oil = $${paramIndex}`);
            values.push(updates.gearboxOil);
            paramIndex++;
        }
        if (updates.acFilter !== undefined) {
            fields.push(`ac_filter = $${paramIndex}`);
            values.push(updates.acFilter);
            paramIndex++;
        }
        if (updates.airFilter !== undefined) {
            fields.push(`air_filter = $${paramIndex}`);
            values.push(updates.airFilter);
            paramIndex++;
        }
        if (updates.fuelFilter !== undefined) {
            fields.push(`fuel_filter = $${paramIndex}`);
            values.push(updates.fuelFilter);
            paramIndex++;
        }
        if (updates.sparkPlugs !== undefined) {
            fields.push(`spark_plugs = $${paramIndex}`);
            values.push(updates.sparkPlugs);
            paramIndex++;
        }
        if (updates.frontBrakePads !== undefined) {
            fields.push(`front_brake_pads = $${paramIndex}`);
            values.push(updates.frontBrakePads);
            paramIndex++;
        }
        if (updates.rearBrakePads !== undefined) {
            fields.push(`rear_brake_pads = $${paramIndex}`);
            values.push(updates.rearBrakePads);
            paramIndex++;
        }
        if (updates.frontBrakeDiscs !== undefined) {
            fields.push(`front_brake_discs = $${paramIndex}`);
            values.push(updates.frontBrakeDiscs);
            paramIndex++;
        }
        if (updates.rearBrakeDiscs !== undefined) {
            fields.push(`rear_brake_discs = $${paramIndex}`);
            values.push(updates.rearBrakeDiscs);
            paramIndex++;
        }
        if (updates.battery !== undefined) {
            fields.push(`battery = $${paramIndex}`);
            values.push(updates.battery);
            paramIndex++;
        }

        if (fields.length === 0) {
            return this.getCarPart(id);
        }

        values.push(id);
        const query = `UPDATE car_parts SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async deleteCarPart(id: number): Promise<void> {
        await db.query(`DELETE FROM car_parts WHERE id = $1`, [id]);
    },
};

import { db } from "../db";
import { ShowroomService, InsertShowroomService, CarService } from "@shared/schema";

export interface IShowroomServiceStorage {

    getAllShowroomServices(filter?: Partial<ShowroomService>, sortBy?: keyof ShowroomService, sortOrder?: 'asc' | 'desc'  // No default value here
    ): Promise<ShowroomService[]>;
    getShowroomServices(showroomId: number): Promise<ShowroomService[]>;
    getShowroomService(id: number): Promise<ShowroomService | undefined>;
    getShowroomServicesByShowroomId(
        showroomId: number,
        filter?: Partial<ShowroomService>,
        sortBy?: keyof ShowroomService,
        sortOrder?: 'asc' | 'desc'  // No default value here
    ): Promise<ShowroomService[]>;
    createShowroomService(service: InsertShowroomService): Promise<ShowroomService>;
    updateShowroomService(id: number, updates: Partial<InsertShowroomService>): Promise<ShowroomService | undefined>;
    deleteShowroomService(id: number): Promise<void>;

}

export const ShowroomServiceStorage = {

    async getAllShowroomServices(
        filter?: Partial<ShowroomService>,
        sortBy?: keyof ShowroomService,
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<ShowroomService[]> {
        let baseQuery = 'SELECT * FROM showroom_services';
        const whereClauses: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        for (const key in filter) {
            if (Object.prototype.hasOwnProperty.call(filter, key)) {
                const typedKey = key as keyof typeof filter;
                const value = filter[typedKey];

                if (value !== undefined) {
                    whereClauses.push(`${key} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }
        }

        if (whereClauses.length) {
            baseQuery += ' WHERE ' + whereClauses.join(' AND ');
        }

        if (sortBy) {
            baseQuery += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
        }

        return await db.query(baseQuery, values);
    },

    async getShowroomServices(showroomId: number): Promise<ShowroomService[]> {
        return await db.query(
            'SELECT * FROM showroom_services WHERE showroom_id = $1 ORDER BY service_id',
            [showroomId]
        );
    },

    async getShowroomService(id: number): Promise<ShowroomService | undefined> {
        const result = await db.query('SELECT * FROM showroom_services WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },

    async getShowroomServicesByShowroomId(
        showroomId: number,
        filter?: Partial<ShowroomService>,
        sortBy?: keyof ShowroomService,
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<(ShowroomService & { service?: CarService })[]> {
        // Start with base query and include service data in a single join
        let baseQuery = `
          SELECT ss.*, cs.* 
          FROM showroom_services ss
          LEFT JOIN car_services cs ON ss.service_id = cs.id
          WHERE ss.showroom_id = $1
        `;

        const values: any[] = [showroomId];
        let paramIndex = 2;

        // Apply filters
        if (filter) {
            for (const key in filter) {
                if (Object.prototype.hasOwnProperty.call(filter, key)) {
                    const typedKey = key as keyof typeof filter;
                    const value = filter[typedKey];

                    if (value !== undefined) {
                        baseQuery += ` AND ss.${key} = $${paramIndex}`;
                        values.push(value);
                        paramIndex++;
                    }
                }
            }
        }

        // Apply sorting
        if (sortBy) {
            baseQuery += ` ORDER BY ss.${sortBy} ${sortOrder.toUpperCase()}`;
        }

        // Execute single query
        const results = await db.query(baseQuery, values);

        // Map results to combine showroom service and car service data
        return results.map((record) => {
            const { id, created_at, updated_at, ...serviceData } = record;
            const service = serviceData.id ? {
                id: serviceData.id,
                created_at: serviceData.created_at,
                updated_at: serviceData.updated_at,
                ...serviceData
            } : undefined;

            return {
                ...record,
                service
            };
        });
    },


    async createShowroomService(service: InsertShowroomService): Promise<ShowroomService> {
        const result = await db.query(
            'INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar) ' +
            'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [
                service.showroomId,
                service.serviceId,
                service.price,
                service.currency,
                service.description,
                service.descriptionAr
            ]
        );
        return result[0];
    },

    async updateShowroomService(id: number, updates: Partial<InsertShowroomService>): Promise<ShowroomService | undefined> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.showroomId !== undefined) {
            fields.push(`showroom_id = $${paramIndex}`);
            values.push(updates.showroomId);
            paramIndex++;
        }
        if (updates.serviceId !== undefined) {
            fields.push(`service_id = $${paramIndex}`);
            values.push(updates.serviceId);
            paramIndex++;
        }
        if (updates.price !== undefined) {
            fields.push(`price = $${paramIndex}`);
            values.push(updates.price);
            paramIndex++;
        }
        if (updates.currency !== undefined) {
            fields.push(`currency = $${paramIndex}`);
            values.push(updates.currency);
            paramIndex++;
        }
        if (updates.description !== undefined) {
            fields.push(`description = $${paramIndex}`);
            values.push(updates.description);
            paramIndex++;
        }
        if (updates.descriptionAr !== undefined) {
            fields.push(`description_ar = $${paramIndex}`);
            values.push(updates.descriptionAr);
            paramIndex++;
        }

        if (fields.length === 0) {
            return this.getShowroomService(id);
        }

        values.push(id);
        const query = `UPDATE showroom_services SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async deleteShowroomService(id: number): Promise<void> {
        await db.query('DELETE FROM showroom_services WHERE id = $1', [id]);
    }

};
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
  ): Promise<(ShowroomService & {
          package_id?: number;
          start_date?: Date;
          end_date?: Date;
          package_name?: string;
          package_description?: string;
          package_price?: number;
      })[]> {
    let baseQuery = `
    SELECT 
      cl.*, 
      lp.id AS promotion_id,
      lp.package_id, 
      lp.start_date, 
      lp.end_date, 
      lp.is_active,
      lp.transaction_id,
      p.name AS package_name,
      p.description AS package_description,
      p.price AS package_price,
      p.currency AS package_currency,
      p.duration_days AS package_duration_days,
      p.is_featured AS package_is_featured
    FROM showroom_services cl
    INNER JOIN service_promotions lp ON cl.id = lp.service_id
      AND lp.end_date > NOW()
    LEFT JOIN service_promotion_packages p ON lp.package_id = p.id
    `;

    const whereClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Handle filters
    for (const key in filter) {
      if (Object.prototype.hasOwnProperty.call(filter, key)) {
        const value = filter[key as keyof typeof filter];

        if (value !== undefined) {
          // Special handling for search (LIKE query)
          if (key === 'search') {
            whereClauses.push(`(description ILIKE $${paramIndex} OR notes ILIKE $${paramIndex})`);
            values.push(`%${value}%`);
          } 
          // Handle range filters
          else if (key.endsWith('_from')) {
            const baseKey = key.replace('_from', '');
            whereClauses.push(`${baseKey} >= $${paramIndex}`);
            values.push(value);
          } 
          else if (key.endsWith('_to')) {
            const baseKey = key.replace('_to', '');
            whereClauses.push(`${baseKey} <= $${paramIndex}`);
            values.push(value);
          } 
          // Standard equality filter
          else {
            whereClauses.push(`${key} = $${paramIndex}`);
            values.push(value);
          }
          paramIndex++;
        }
      }
    }

    // Build WHERE clause
    if (whereClauses.length) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Handle sorting
    if (sortBy) {
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    console.log('Final SQL query:', baseQuery);

    try {
            const result = await db.query(baseQuery, values);
            console.log('Query successful. Retrieved rows:', result.length);
            console.log('First row (sample):', result.slice(0, 1));

            console.log('--- END: getAllShowroomServices ---');
            return result;
        } catch (error) {
            console.error('Database query failed:', error);
            console.log('--- END: getAllShowroomServices (with error) ---');
            throw error;
        }
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


    // Update your storage methods to include isFeatured and isActive
    async createShowroomService(service: InsertShowroomService): Promise<ShowroomService> {
        const result = await db.query(
            'INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, is_featured, is_active, status) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [
                service.showroomId,
                service.serviceId,
                service.price,
                service.currency,
                service.description,
                service.descriptionAr,
                service.isFeatured || false,
                service.isActive !== false, // Default to true
                service.status || 'draft',
            ]
        );
        return result[0];
    },

    // Add these fields to your update method
    async updateShowroomService(id: number, updates: Partial<InsertShowroomService>): Promise<ShowroomService | undefined> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Existing fields...
        if (updates.isFeatured !== undefined) {
            fields.push(`is_featured = $${paramIndex}`);
            values.push(updates.isFeatured);
            paramIndex++;
        }
        if (updates.isActive !== undefined) {
            fields.push(`is_active = $${paramIndex}`);
            values.push(updates.isActive);
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
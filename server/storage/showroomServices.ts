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
        filter?: Partial<ShowroomService> & {

            price_from?: number | string;
            price_to?: number | string;

            showroom_id?: string;
            service_id?: string;

            is_featured?: boolean;

            updated_from?: string;
            updated_to?: string;

            status?: string;

            user_id?: number;


        },
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
        console.log('--- START: getAllShowroomServices ---');
        console.log('Incoming filter parameters:', JSON.stringify(filter, null, 2));
        console.log('Incoming sort parameters:', { sortBy, sortOrder });
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
    p.name_ar AS package_name_ar,
    p.description AS package_description,
    p.description_ar AS package_description_ar,
    p.plan AS package_plan,
    p.price AS package_price,
    p.currency AS package_currency,
    p.duration_days AS package_duration_days,
    p.is_featured AS package_is_featured,
    s.id AS showroom_id,
    s.name AS showroom_name,
    s.name_ar AS showroom_name_ar,
    s.logo AS showroom_logo,
    s.phone AS showroom_phone,
    s.location AS showroom_location,
    s.timing AS showroom_timing
  FROM showroom_services cl
  INNER JOIN service_promotions lp ON cl.id = lp.service_id
    AND lp.end_date > NOW()
  LEFT JOIN service_promotion_packages p ON lp.package_id = p.id
  LEFT JOIN showrooms s ON cl.showroom_id = s.id
  LEFT JOIN car_services sc ON cl.service_id = sc.id
`;


        const whereClauses: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Process filters
        for (const key in filter) {
            if (Object.prototype.hasOwnProperty.call(filter, key)) {
                const value = filter[key as keyof typeof filter];

                console.log(`Processing filter: ${key} =`, value);

                if (value !== undefined && value !== null) {
                    switch (key) {
                        case 'user_id':
                            whereClauses.push(`cl.user_id = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added user filter: user_id = ${value}`);
                            paramIndex++;
                            break;
                        case 'showroom_id':
                            whereClauses.push(`cl.showroom_id = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added user filter: showroom_id = ${value}`);
                            paramIndex++;
                            break;
                        case 'service_id':
                            whereClauses.push(`cl.service_id = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added user filter: service_id = ${value}`);
                            paramIndex++;
                            break;
                        case 'price_from':
                            whereClauses.push(`cl.price >= $${paramIndex}`);
                            values.push(Number(value));
                            console.log(`Added price filter: price >= ${Number(value)}`);
                            paramIndex++;
                            break;
                        case 'price_to':
                            whereClauses.push(`cl.price <= $${paramIndex}`);
                            values.push(Number(value));
                            console.log(`Added price filter: price <= ${Number(value)}`);
                            paramIndex++;
                            break;
                        case 'status':
                            whereClauses.push(`cl.status = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added Status filter: status = ${value}`);
                            paramIndex++;
                            break;
                        case 'is_featured':
                            whereClauses.push(`cl.is_featured = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added featured filter: is_featured = ${value}`);
                            paramIndex++;
                            break;
                        case 'updated_from': {
                            if (typeof value === 'string' || value instanceof Date) {
                                const date = new Date(value);
                                if (!isNaN(date.getTime())) {
                                    whereClauses.push(`updated_at >= $${paramIndex}`);
                                    values.push(date.toISOString());
                                    console.log(`Added date filter: updated_at >= ${date.toISOString()}`);
                                    paramIndex++;
                                }
                            }
                            break;
                        }
                        case 'updated_to': {
                            if (typeof value === 'string' || value instanceof Date) {
                                const date = new Date(value);
                                if (!isNaN(date.getTime())) {
                                    date.setUTCHours(23, 59, 59, 999);
                                    whereClauses.push(`updated_at <= $${paramIndex}`);
                                    values.push(date.toISOString());
                                    console.log(`Added date filter: updated_at <= ${date.toISOString()}`);
                                    paramIndex++;
                                }
                            }
                            break;
                        }
                        default:
                            const column = ['id', 'created_at', 'updated_at'].includes(key) ? `cl.${key}` : key;
                            whereClauses.push(`${column} = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added generic filter: ${key} = ${value}`);
                            paramIndex++;
                            break;
                    }
                } else {
                    console.log(`Skipping filter ${key} - value is undefined or null`);
                }
            }
        }


        // Build WHERE clause
        if (whereClauses.length > 0) {
            baseQuery += ' WHERE ' + whereClauses.join(' AND ');
            console.log('Final WHERE clause:', whereClauses.join(' AND '));
            console.log('Query parameters:', values);
        } else {
            console.log('No filters applied - using base query');
        }


        // Handle sorting
        const validSortFields: (keyof ShowroomService)[] = [
            'id', 'price', 'is_featured', 'status', 'updated_at', 'created_at'
        ];

        if (sortBy && validSortFields.includes(sortBy)) {
            baseQuery += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
            console.log(`Applying sort: ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`);
        } else if (sortBy) {
            console.log(`Invalid sort field: ${sortBy} - skipping sort`);
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
            'INSERT INTO showroom_services (showroom_id, service_id, price, currency, description, description_ar, availability, is_featured, is_active, status) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [
                service.showroomId,
                service.serviceId,
                service.price,
                service.currency,
                service.description,
                service.descriptionAr,
                service.availability,
                service.isFeatured || false,
                service.isActive !== false, // Default to true
                service.status || 'draft',
            ]
        );
        return result[0];
    },

    // Add these fields to your update method
    async updateShowroomService(
        id: number,
        updates: Partial<InsertShowroomService>
    ): Promise<ShowroomService | undefined> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Handle all possible fields that might be updated
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

        if (updates.status !== undefined) {
            fields.push(`status = $${paramIndex}`);
            values.push(updates.status);
            paramIndex++;
        }

        if (updates.availability !== undefined) {
            fields.push(`availability = $${paramIndex}`);
            // Store as JSON string if it's an object
            values.push(
                typeof updates.availability === 'string'
                    ? updates.availability
                    : JSON.stringify(updates.availability)
            );
            paramIndex++;
        }

        if (fields.length === 0) {
            return this.getShowroomService(id);
        }

        values.push(id);

        try {
            const query = `
            UPDATE showroom_services 
            SET ${fields.join(', ')} 
            WHERE id = $${paramIndex} 
            RETURNING *
        `;
            const result = await db.query(query, values);
            return result[0];
        } catch (error) {
            console.error('Failed to update showroom service:', error);
            throw new Error('Failed to update showroom service');
        }
    },

    async deleteShowroomService(id: number): Promise<void> {
        await db.query('DELETE FROM showroom_services WHERE id = $1', [id]);
    }

};
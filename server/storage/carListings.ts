import { db } from "../db";
import { CarListing, CarListingWithFeatures, InsertCarListing, ListingPromotion, Showroom } from "@shared/schema";

export interface ICarListingStorage {

    getAllCarListings(filter?: Partial<CarListing>, sortBy?: keyof CarListing, sortOrder?: 'asc' | 'desc'): Promise<CarListing[]>;
    getCarListingById(id: number): Promise<CarListingWithFeatures | undefined>;
    getListingsBySeller(sellerId: number): Promise<CarListing[]>;
    getFeaturedListings(): Promise<CarListing[]>;
    getCarFeaturedListings(filter?: Partial<CarListing>, sortBy?: keyof CarListing, sortOrder?: 'asc' | 'desc'): Promise<CarListing[]>;
    createCarListing(listing: InsertCarListing): Promise<CarListing>;
    updateCarListing(id: number, updates: Partial<InsertCarListing>): Promise<CarListing | undefined>;
    deleteCarListing(id: number): Promise<void>;
    incrementListingViews(id: number): Promise<void>;
    updateListingStatus(id: number, status: 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'reject'): Promise<void>;
    getSimilarCarListings(
        listingId: string,
        limit: number
    ): Promise<CarListing[]>;

}

export const CarListingStorage = {

    async getAllCarListings(
        filter: Partial<CarListing> & {

            price_from?: number | string;
            price_to?: number | string;
            year_from?: number;
            year_to?: number;

            make?: string;
            model?: string;
            category?: string;

            miles_from?: number | string;
            miles_to?: number | string;
            fuel_type?: string;
            transmission?: string;
            engine_capacity?: number | string;
            cylinder_count?: number | string;

            color?: string;
            interior_color?: string;
            tinted?: boolean;

            condition?: string;
            location?: string;

            is_featured?: boolean;
            is_imported?: boolean;

            owner_type?: string;
            has_warranty?: string;
            has_insurance?: string;

            updated_from?: string;
            updated_to?: string;

            is_business?: string;
            showroom_id?: string;

            status?: string;

            user_id?: number;
        } = {},
        sortBy?: keyof CarListing,
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<(CarListing & {
        package_id?: number;
        start_date?: Date;
        end_date?: Date;
        package_name?: string;
        package_description?: string;
        package_price?: number;
    })[]> {
        console.log('--- START: getAllCarListings ---');
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
            FROM car_listings cl
            INNER JOIN listing_promotions lp ON cl.id = lp.listing_id
            AND lp.end_date > NOW()
            LEFT JOIN promotion_packages p ON lp.package_id = p.id
            LEFT JOIN showrooms s ON cl.is_business = true AND cl.showroom_id = s.id
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
                            whereClauses.push(`user_id = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added user filter: user_id = ${value}`);
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
                        case 'year_from':
                            whereClauses.push(`cl.year >= $${paramIndex}`);
                            values.push(Number(value));
                            console.log(`Added year filter: year >= ${Number(value)}`);
                            paramIndex++;
                            break;
                        case 'year_to':
                            whereClauses.push(`cl.year <= $${paramIndex}`);
                            values.push(Number(value));
                            console.log(`Added year filter: year <= ${Number(value)}`);
                            paramIndex++;
                            break;
                        case 'make':
                            whereClauses.push(`cl.make = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added make filter: make = ${value}`);
                            paramIndex++;
                            break;
                        case 'model':
                            whereClauses.push(`cl.model = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added model filter: model = ${value}`);
                            paramIndex++;
                            break;
                        case 'category':
                            whereClauses.push(`cl.category = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added category filter: category = ${value}`);
                            paramIndex++;
                            break;
                        case 'miles_from':
                            whereClauses.push(`cl.mileage >= $${paramIndex}`);
                            values.push(Number(value));
                            console.log(`Added mileage filter: mileage >= ${Number(value)}`);
                            paramIndex++;
                            break;
                        case 'miles_to':
                            whereClauses.push(`cl.mileage <= $${paramIndex}`);
                            values.push(Number(value));
                            console.log(`Added mileage filter: mileage <= ${Number(value)}`);
                            paramIndex++;
                            break;
                        case 'fuel_tyoe':
                            whereClauses.push(`cl.fuel_tyoe = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added fuel_tyoe filter: fuel_tyoe = ${value}`);
                            paramIndex++;
                            break;
                        case 'transmission':
                            whereClauses.push(`cl.transmission = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added transmission filter: transmission = ${value}`);
                            paramIndex++;
                            break;
                        case 'engline_capacity_id':
                            whereClauses.push(`cl.engline_capacity_id = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added engline_capacity_id filter: engline_capacity_id = ${value}`);
                            paramIndex++;
                            break;
                        case 'cylinder_count':
                            whereClauses.push(`cl.cylinder_count = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added cylinder_count filter: cylinder_count = ${value}`);
                            paramIndex++;
                            break;
                        case 'color':
                            whereClauses.push(`cl.color = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added color filter: color = ${value}`);
                            paramIndex++;
                            break;
                        case 'interior_color':
                            whereClauses.push(`cl.interior_color = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added interior_color filter: interior_color = ${value}`);
                            paramIndex++;
                            break;
                        case 'tinted':
                            whereClauses.push(`cl.tinted = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added tinted filter: tinted = ${value}`);
                            paramIndex++;
                            break;
                        case 'condition':
                            whereClauses.push(`cl.condition <= $${paramIndex}`);
                            values.push(value);
                            console.log(`Added condition filter: condition <= ${value}`);
                            paramIndex++;
                            break;
                        case 'location':
                            whereClauses.push(`cl.location = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added location filter: location = ${value}`);
                            paramIndex++;
                            break;
                        case 'is_featured':
                            whereClauses.push(`cl.is_featured = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added featured filter: is_featured = ${value}`);
                            paramIndex++;
                            break;
                        case 'is_imported':
                            whereClauses.push(`cl.is_imported = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added imported filter: is_imported = ${value}`);
                            paramIndex++;
                            break;
                        case 'owner_type':
                            whereClauses.push(`cl.owner_type = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added featured filter: owner_type = ${value}`);
                            paramIndex++;
                            break;
                        case 'has_warranty':
                            whereClauses.push(`cl.has_warranty = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added imported filter: has_warranty = ${value}`);
                            paramIndex++;
                            break;
                        case 'has_insurance':
                            whereClauses.push(`cl.has_insurance = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added imported filter: has_insurance = ${value}`);
                            paramIndex++;
                            break;
                         case 'status':
                            whereClauses.push(`cl.status = $${paramIndex}`);
                            values.push(value);
                            console.log(`Added Status filter: status = ${value}`);
                            paramIndex++;
                            break;
                        case 'updated_from': {
                            if (typeof value === 'string' || value instanceof Date) {
                                const date = new Date(value);
                                if (!isNaN(date.getTime())) {
                                    whereClauses.push(`cl.updated_at >= $${paramIndex}`);
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
                                    whereClauses.push(`cl.updated_at <= $${paramIndex}`);
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
        const validSortFields: (keyof CarListing)[] = [
            'id', 'title', 'price', 'year', 'mileage', 'status', 'updated_at', 'created_at'
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

            console.log('--- END: getAllCarListings ---');
            return result;
        } catch (error) {
            console.error('Database query failed:', error);
            console.log('--- END: getAllCarListings (with error) ---');
            throw error;
        }
    },

    async getCarListingById(id: number): Promise<(CarListingWithFeatures & { currentPackage?: ListingPromotion; showroom?: Showroom }) | undefined> {
        const listingResult = await db.query(`SELECT * FROM car_listings WHERE id = $1`, [id]);
        const listing = listingResult[0];
        if (!listing) return undefined;

        const features = await db.query(
            `
        SELECT f.* FROM car_features f
        JOIN car_listing_features clf ON clf.feature_id = f.id
        WHERE clf.listing_id = $1
        `,
            [id]
        );

        const promotionResult = await db.query(
            `
        SELECT 
          lp.*, 
          p.name AS package_name, 
          p.description AS package_description, 
          p.price AS package_price
        FROM listing_promotions lp
        JOIN promotion_packages p ON lp.package_id = p.id
        WHERE lp.listing_id = $1 
          AND lp.is_active = true 
          AND lp.start_date <= NOW() 
          AND lp.end_date > NOW()
        ORDER BY lp.start_date DESC
        LIMIT 1
        `,
            [id]
        );

        const currentPackage = promotionResult[0];

        let showroom = undefined;
        if (listing.showroom_id) {
            const showroomResult = await db.query(`SELECT * FROM showrooms WHERE id = $1`, [listing.showroom_id]);
            showroom = showroomResult[0];
        }

        return {
            ...listing,
            features,
            currentPackage,
            showroom,
        };
    },

    async getFeaturedListings(): Promise<CarListing[]> {
        return await db.query(`
      SELECT cl.* FROM car_listings cl
      JOIN listing_promotions lp ON cl.id = lp.listing_id
      JOIN promotion_packages pp ON lp.package_id = pp.id
      WHERE lp.is_active = true 
        AND lp.end_date > NOW()
        AND pp.is_featured = true
      ORDER BY pp.priority DESC, lp.start_date DESC
    `);
    },

    async getCarFeaturedListings(filter: Partial<CarListing> = {}, sortBy?: keyof CarListing, sortOrder: 'asc' | 'desc' = 'asc'): Promise<CarListing[]> {
        let baseQuery = 'SELECT * FROM car_listings WHERE is_featured = true';
        const values: any[] = [];
        let paramIndex = 1;

        for (const key in filter) {
            if (Object.prototype.hasOwnProperty.call(filter, key)) {
                const typedKey = key as keyof typeof filter;
                const value = filter[typedKey];

                if (value !== undefined) {
                    baseQuery += ` AND ${key} = $${paramIndex}`;
                    values.push(value);
                    paramIndex++;
                }
            }
        }

        if (sortBy) {
            baseQuery += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
        }

        return await db.query(baseQuery, values);
    },

    async createCarListing(listing: InsertCarListing): Promise<CarListing> {
        const fields = Object.keys(listing);
        const values = Object.values(listing);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO car_listings (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async updateCarListing(id: number, updates: Partial<InsertCarListing>): Promise<CarListing | undefined> {
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            console.warn("[updateCarListing] No fields to update");
            return undefined;
        }

        const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const query = `UPDATE car_listings SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
        const result = await db.query(query, [...values, id]);

        return result[0];
    },

    async deleteCarListing(id: number): Promise<void> {
        try {
            // Delete dependent rows first
            await db.query('DELETE FROM car_listing_features WHERE listing_id = $1', [id]);
            await db.query('DELETE FROM listing_promotions WHERE listing_id = $1', [id]);

            // Then delete main listing
            await db.query('DELETE FROM car_listings WHERE id = $1', [id]);
        } catch (err) {
            console.error('Failed to delete listing:', err);
            throw new Error('Failed to delete listing and its dependencies');
        }
    },

    async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
        return await db.query('SELECT * FROM car_listings WHERE seller_id = $1 ORDER BY created_at DESC', [sellerId]);
    },

    async incrementListingViews(id: number): Promise<void> {
        await db.query('UPDATE car_listings SET views = views + 1 WHERE id = $1', [id]);
    },

    async updateListingStatus(id: number, status: 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'reject'): Promise<void> {
        await db.query('UPDATE car_listings SET status = $1 WHERE id = $2', [status, id]);
    },

    async getSimilarCarListings(
    listingId: string,
    limit = 4
  ): Promise<CarListing[]> {
    console.log('🔍 Fetching similar listings for:', listingId);

    // Step 1: Get the target listing's make_id and category_id
    const [base] = await db.query(
      `SELECT category_id
       FROM car_listings
       WHERE id = $1
       LIMIT 1`,
      [listingId]
    );

    console.log('📋 Base listing details:', base);
    if (!base) {
      console.warn(`Listing with ID ${listingId} not found, returning empty.`);
      return [];
    }

    // Step 2: Query for similar listings
    const similar = await db.query(
      `SELECT *
       FROM car_listings
       WHERE category_id = $1
         AND id != $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [base.category_id, listingId, limit]
    );

    console.log(`✅ Found ${similar.length} similar listings.`);
    return similar as CarListing[];
  },


};
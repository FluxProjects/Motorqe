import { db } from "../db";
import { CarService, InsertCarService, ShowroomService } from "@shared/schema";

export interface ICarServiceStorage {

    getAllServices(): Promise<CarService[]>;
    getAllFeaturedServices(): Promise<CarService[]>
    getFeaturedServices(): Promise<CarService[]>;
    getShowroomServiceByServiceId(id: number): Promise<any>;
    getService(id: number): Promise<any>
    getServicesByMake(makeId: number): Promise<ShowroomService[]>
    createService(service: InsertCarService): Promise<CarService>;
    updateService(id: number, updates: Partial<InsertCarService>): Promise<CarService | undefined>;
    deleteService(id: number): Promise<void>;

}

export const CarServiceStorage = {

    async getAllServices(): Promise<CarService[]> {
        return await db.query('SELECT * FROM car_services ORDER BY name');
    },

    async getAllFeaturedServices(): Promise<any[]> {
        return await db.query(`SELECT
      ss.id AS showroom_service_id,
      ss.is_featured,
      ss.price,
      ss.currency,
      ss.description,
      ss.description_ar,
      cs.id AS service_id,
      cs.name AS service_name,
      cs.name_ar AS service_nameAr,
      s.id AS showroom_id,
      s.name AS showroom_name,
      s.location AS showroom_location,
      s.address AS showroom_address,
      s.phone AS showroom_phone
    FROM showroom_services ss
    JOIN car_services cs ON ss.service_id = cs.id
    JOIN showrooms s ON ss.showroom_id = s.id
    WHERE ss.is_featured = true
    `);
    },

    async getFeaturedServices(): Promise<CarService[]> {
            return await db.query(`
          SELECT cl.* FROM car_services cl
          JOIN service_promotions lp ON cl.id = lp.service_id
          JOIN service_promotion_packages pp ON lp.package_id = pp.id
          WHERE lp.is_active = true 
            AND lp.end_date > NOW()
            AND pp.is_featured = true
          ORDER BY pp.priority DESC, lp.start_date DESC
        `);
        },

    async getServicesByMake(makeId: number): Promise<ShowroomService[]> {
        const query = `
          SELECT ss.*, cs.*, s.* 
    FROM showroom_services ss
    JOIN car_services cs ON ss.service_id = cs.id
    JOIN showrooms s ON ss.showroom_id = s.id
    JOIN showroom_service_makes ssm ON ss.showroom_id = ssm.showroom_id
    WHERE ssm.make_id = :makeId
        `;

        return await db.query(query, [makeId]);
    },

    async getShowroomServiceByServiceId(id: number): Promise<any | undefined> {
        const query = `
          SELECT 
            cs.id AS service_id,
            cs.name AS service_name,
            cs.name_ar AS service_name_ar,
            cs.image AS service_image,
            ss.description AS service_description,
            ss.description_ar AS service_description_ar,
            ss.price,
            ss.currency,
            ss.is_featured,
      
            sr.id AS showroom_id,
            sr.name AS showroom_name,
            sr.name_ar AS showroom_name_ar,
            sr.logo,
            sr.is_featured,
            sr.description AS showroom_description,
            sr.description_ar AS showroom_description_ar,
            sr.address,
            sr.address_ar,
            sr.location,
            sr.phone,
            sr.is_main_branch,
      
            cm.id AS make_id,
            cm.name AS make_name,
            cm.name_ar AS make_name_ar,
            cm.image AS make_image
      
          FROM showroom_services ss
          JOIN car_services cs ON ss.service_id = cs.id
          JOIN showrooms sr ON ss.showroom_id = sr.id
          LEFT JOIN showroom_service_makes ssm ON ssm.showroom_id = sr.id
          LEFT JOIN car_makes cm ON ssm.make_id = cm.id
          WHERE cs.id = $1;
        `;

        try {
            const result = await db.query(query, [id]);

            if (result.length === 0) return undefined;

            const firstRow = result[0];

            const makes = result
                .filter(row => row.make_id) // ignore null joins
                .map(row => ({
                    id: row.make_id,
                    name: row.make_name,
                    nameAr: row.make_name_ar,
                    image: row.make_image
                }));

            return {
                service: {
                    id: firstRow.service_id,
                    name: firstRow.service_name,
                    nameAr: firstRow.service_name_ar,
                    image: firstRow.service_image,
                    description: firstRow.service_description,
                    descriptionAr: firstRow.service_description_ar
                },
                showroom: {
                    id: firstRow.showroom_id,
                    name: firstRow.showroom_name,
                    nameAr: firstRow.showroom_name_ar,
                    logo: firstRow.logo,
                    description: firstRow.showroom_description,
                    descriptionAr: firstRow.showroom_description_ar,
                    isMainBranch: firstRow.is_main_branch,
                    address: firstRow.address,
                    addressAr: firstRow.address_ar,
                    location: firstRow.location,
                    phone: firstRow.phone
                },
                makes,
                price: firstRow.price,
                currency: firstRow.currency,
                description: firstRow.description,
                descriptionAr: firstRow.description_ar,
                isFeatured: firstRow.is_featured
            };
        } catch (error) {
            console.error('Error fetching service:', error);
            throw new Error('Failed to fetch service');
        }
    },

    async getService(id: number): Promise<any | undefined> {
        const query = `
          SELECT 
            cs.id AS service_id,
            cs.name AS service_name,
            cs.name_ar AS service_name_ar,
            cs.image AS service_image,
      
            ss.description AS service_description,
            ss.description_ar AS service_description_ar,
            ss.price,
            ss.currency,
            ss.is_featured,
      
            sr.id AS showroom_id,
            sr.name AS showroom_name,
            sr.name_ar AS showroom_name_ar,
            sr.logo,
            sr.description AS showroom_description,
            sr.description_ar AS showroom_description_ar,
            sr.address,
            sr.address_ar,
            sr.location,
            sr.phone,
            sr.is_main_branch,
      
            cm.id AS make_id,
            cm.name AS make_name,
            cm.name_ar AS make_name_ar,
            cm.image AS make_image
      
          FROM showroom_services ss
          JOIN car_services cs ON ss.service_id = cs.id
          JOIN showrooms sr ON ss.showroom_id = sr.id
          LEFT JOIN showroom_service_makes ssm ON ssm.showroom_id = sr.id
          LEFT JOIN car_makes cm ON ssm.make_id = cm.id
          WHERE cs.id = $1;
        `;

        try {
            const result = await db.query(query, [id]);

            if (result.length === 0) return undefined;

            const firstRow = result[0];

            const showroomMap = new Map<number, any>();

            for (const row of result) {
                const showroomId = row.showroom_id;
                if (!showroomMap.has(showroomId)) {
                    showroomMap.set(showroomId, {
                        id: showroomId,
                        name: row.showroom_name,
                        nameAr: row.showroom_name_ar,
                        logo: row.logo,
                        description: row.showroom_description,
                        descriptionAr: row.showroom_description_ar,
                        isMainBranch: row.is_main_branch,
                        address: row.address,
                        addressAr: row.address_ar,
                        location: row.location,
                        phone: row.phone,
                        price: row.price,
                        currency: row.currency,
                        isFeatured: row.is_featured,
                        makes: []
                    });
                }

                if (row.make_id) {
                    showroomMap.get(showroomId).makes.push({
                        id: row.make_id,
                        name: row.make_name,
                        nameAr: row.make_name_ar,
                        image: row.make_image
                    });
                }
            }

            return {
                service: {
                    id: firstRow.service_id,
                    name: firstRow.service_name,
                    nameAr: firstRow.service_name_ar,
                    image: firstRow.service_image,
                    description: firstRow.service_description,
                    descriptionAr: firstRow.service_description_ar
                },
                showrooms: Array.from(showroomMap.values())
            };
        } catch (error) {
            console.error('Error fetching service:', error);
            throw new Error('Failed to fetch service');
        }
    },

    async createService(service: InsertCarService): Promise<CarService> {
        const result = await db.query(
            'INSERT INTO car_services (name, name_ar) VALUES ($1, $2) RETURNING *',
            [service.name, service.nameAr]
        );
        return result[0];
    },

    async updateService(id: number, updates: Partial<InsertCarService>): Promise<CarService | undefined> {
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
            return this.getService(id);
        }

        values.push(id);
        const query = `UPDATE car_services SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async deleteService(id: number): Promise<void> {
        await db.query('DELETE FROM car_services WHERE id = $1', [id]);
    } 

};
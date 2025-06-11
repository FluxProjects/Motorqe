import { db } from "../db";
import { ServiceBooking, InsertServiceBooking } from "@shared/schema";

export interface IServiceBookingStorage {

    getAllServiceBookings(filter?: Partial<ServiceBooking>, sortBy?: keyof ServiceBooking, sortOrder?: 'asc' | 'desc'  // No default value here
        ): Promise<ServiceBooking[]>;
    getServiceBookingsByUser(userId: number): Promise<ServiceBooking[]>;
    getServiceBookingsByShowroom(showroomId: number): Promise<ServiceBooking[]>;
    getServiceBooking(id: number): Promise<ServiceBooking | undefined>;
    createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking>;
    updateServiceBooking(id: number, updates: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined>;
    cancelServiceBooking(id: number): Promise<void>;
    completeServiceBooking(id: number): Promise<void>;

}

export const ServiceBookingStorage = {

    async getAllServiceBookings(
      filter?: Partial<ServiceBooking> & {
        user_id?: number;        // This should match s.user_id (showroom owner)
        customer_id?: number;    // This should match sb.user_id (customer who booked)
        service_id?: number;
        showroom_id?: number;
        status?: string;
        scheduled_from?: string;
        scheduled_to?: string;
        created_from?: string;
        created_to?: string;
        price_from?: number;
        price_to?: number;
      },
      sortBy?: keyof ServiceBooking,
      sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<ServiceBooking[]> {
      console.log('--- START: getAllServiceBookings ---');
      console.log('Filter:', filter);
      console.log('Sort:', sortBy, sortOrder);

      let baseQuery = `
        SELECT sb.*, 
              cu.username AS customer_name, 
              cu.first_name AS customer_first_name,
              cu.last_name AS customer_last_name,
              cs.name AS service_name, 
              s.name AS showroom_name,
              su.username AS showroom_user_name
        FROM service_bookings sb
        LEFT JOIN users cu ON sb.user_id = cu.id
        LEFT JOIN showroom_services ss ON sb.service_id = ss.id
        LEFT JOIN car_services cs ON ss.service_id = cs.id
        LEFT JOIN showrooms s ON sb.showroom_id = s.id
        LEFT JOIN users su ON s.user_id = su.id
      `;

      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      for (const key in filter) {
        const value = filter[key as keyof typeof filter];
        if (value === undefined || value === null) continue;

        switch (key) {
          case 'user_id':
            // Filter for showroom owner's user ID
            whereClauses.push(`s.user_id = $${paramIndex}`);
            values.push(value);
            break;

          case 'customer_id':
            // Filter for customer (who booked the service)
            whereClauses.push(`sb.user_id = $${paramIndex}`);
            values.push(value);
            break;

          case 'service_id':
          case 'showroom_id':
            whereClauses.push(`sb.${key} = $${paramIndex}`);
            values.push(value);
            break;

          case 'status':
            whereClauses.push(`sb.status = $${paramIndex}`);
            values.push(value);
            break;

          case 'scheduled_from':
            whereClauses.push(`sb.scheduled_at >= $${paramIndex}`);
            values.push(new Date(value).toISOString());
            break;

          case 'scheduled_to': {
            const date = new Date(value);
            date.setUTCHours(23, 59, 59, 999);
            whereClauses.push(`sb.scheduled_at <= $${paramIndex}`);
            values.push(date.toISOString());
            break;
          }

          case 'created_from':
            whereClauses.push(`sb.created_at >= $${paramIndex}`);
            values.push(new Date(value).toISOString());
            break;

          case 'created_to': {
            const date = new Date(value);
            date.setUTCHours(23, 59, 59, 999);
            whereClauses.push(`sb.created_at <= $${paramIndex}`);
            values.push(date.toISOString());
            break;
          }

          case 'price_from':
            whereClauses.push(`sb.price >= $${paramIndex}`);
            values.push(value);
            break;

          case 'price_to':
            whereClauses.push(`sb.price <= $${paramIndex}`);
            values.push(value);
            break;
        }

        paramIndex++;
      }

      if (whereClauses.length > 0) {
        baseQuery += ' WHERE ' + whereClauses.join(' AND ');
      }

      const validSortFields: (keyof ServiceBooking)[] = [
        'id', 'price', 'scheduled_at', 'created_at', 'status'
      ];

      if (sortBy && validSortFields.includes(sortBy)) {
        baseQuery += ` ORDER BY sb.${sortBy} ${sortOrder.toUpperCase()}`;
      }

      console.log('Final SQL:', baseQuery);
      console.log('Values:', values);

      try {
        const result = await db.query(baseQuery, values);
        console.log('Rows:', result.length);
        return result;
      } catch (err) {
        console.error('Query failed:', err);
        throw err;
      }
    },

    async getServiceBookingsByUser(userId: number): Promise<ServiceBooking[]> {
        return await db.query(
            'SELECT * FROM service_bookings WHERE user_id = $1 ORDER BY scheduled_at DESC',
            [userId]
        );
    },

    async getServiceBookingsByShowroom(showroomId: number): Promise<ServiceBooking[]> {
        return await db.query(
            `SELECT sb.* FROM service_bookings sb
           JOIN showroom_services ss ON sb.showroom_service_id = ss.id
           WHERE ss.showroom_id = $1
           ORDER BY sb.scheduled_at DESC`,
            [showroomId]
        );
    },

    async getServiceBooking(id: number): Promise<ServiceBooking | undefined> {
        const result = await db.query('SELECT * FROM service_bookings WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },

    async createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking> {
        const result = await db.query(
            'INSERT INTO service_bookings (user_id, service_id, showroom_id, scheduled_at, status, notes,  price, currency) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
                booking.userId,
                booking.serviceId,
                booking.showroomId,
                booking.scheduledAt,
                booking.status || 'pending',
                booking.notes,
                booking.price,
                booking.currency || 'QAR'
            ]
        );
        return result[0];
    },

    async updateServiceBooking(id: number, updates: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.userId !== undefined) {
            fields.push(`user_id = $${paramIndex}`);
            values.push(updates.userId);
            paramIndex++;
        }
        if (updates.serviceId !== undefined) {
            fields.push(`service_id = $${paramIndex}`);
            values.push(updates.serviceId);
            paramIndex++;
        }
        if (updates.scheduledAt !== undefined) {
            fields.push(`scheduled_at = $${paramIndex}`);
            values.push(updates.scheduledAt);
            paramIndex++;
        }
        if (updates.status !== undefined) {
            fields.push(`status = $${paramIndex}`);
            values.push(updates.status);
            paramIndex++;
        }
        if (updates.notes !== undefined) {
            fields.push(`notes = $${paramIndex}`);
            values.push(updates.notes);
            paramIndex++;
        }

        if (fields.length === 0) {
            return this.getServiceBooking(id);
        }

        values.push(id);
        const query = `UPDATE service_bookings SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async cancelServiceBooking(id: number): Promise<void> {
        await db.query(
            'UPDATE service_bookings SET status = \'cancelled\' WHERE id = $1',
            [id]
        );
    },

    async completeServiceBooking(id: number): Promise<void> {
        await db.query(
            'UPDATE service_bookings SET status = \'completed\' WHERE id = $1',
            [id]
        );
    }

};
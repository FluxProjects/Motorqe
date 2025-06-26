import { notificationService } from "server/services/notification";
import { db } from "../db";
import { ServiceBooking, InsertServiceBooking } from "@shared/schema";

export interface IServiceBookingStorage {

    getShowroomBookingStats(showroomId: number): Promise<{ today: number; upcoming: number; pending: number }>;
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

  async getShowroomBookingStats(showroomId: number): Promise<{ today: number; upcoming: number; pending: number }> {
  const query = `
    SELECT
      COUNT(*) FILTER (
        WHERE DATE(scheduled_at) = CURRENT_DATE
      ) AS today_bookings,
      COUNT(*) FILTER (
        WHERE DATE(scheduled_at) > CURRENT_DATE
      ) AS upcoming_bookings,
      COUNT(*) FILTER (
        WHERE status = 'pending'
      ) AS pending_bookings
    FROM service_bookings
    WHERE showroom_id = $1;
  `;

  const [row] = await db.query(query, [showroomId]);
  return {
    today: Number(row.today_bookings),
    upcoming: Number(row.upcoming_bookings),
    pending: Number(row.pending_bookings),
  };
},

    async getAllServiceBookings(
      filter?: {
        user_id?: number;        // Showroom owner (s.user_id)
        customer_id?: number;    // Booking customer (sb.user_id)
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
      sortBy?: 'id' | 'price' | 'scheduled_at' | 'created_at' | 'status',
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
        LEFT JOIN showrooms s ON ss.showroom_id = s.id
        LEFT JOIN users su ON s.user_id = su.id
      `;

      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (filter) {
        for (const key in filter) {
          const value = filter[key as keyof typeof filter];
          if (value === undefined || value === null) continue;

          switch (key) {
            case 'user_id':
              whereClauses.push(`s.user_id = $${paramIndex}`);
              values.push(value);
              break;

            case 'customer_id':
              whereClauses.push(`sb.user_id = $${paramIndex}`);
              values.push(value);
              break;

            case 'service_id':
              whereClauses.push(`sb.service_id = $${paramIndex}`);
              values.push(value);
              break;

            case 'showroom_id':
              whereClauses.push(`s.id = $${paramIndex}`);
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
      }

      if (whereClauses.length > 0) {
        baseQuery += ' WHERE ' + whereClauses.join(' AND ');
      }

      if (sortBy) {
        baseQuery += ` ORDER BY sb.${sortBy} ${sortOrder.toUpperCase()}`;
      }

      console.log('Final SQL:', baseQuery);
      console.log('Values:', values);

      try {
        const result = await db.query(baseQuery, values);
        // If using node-postgres (pg), return result.rows
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
    console.log(`[updateServiceBooking] Updating booking ID: ${id} with data:`, updates);

    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Transform 'rescheduled' to 'pending'
    if (updates.status === 'rescheduled') {
        updates.status = 'pending';
    }

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
    if (updates.scheduled_at !== undefined) {
        fields.push(`scheduled_at = $${paramIndex}`);
        values.push(updates.scheduled_at);
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
        console.log('[updateServiceBooking] No update fields provided. Fetching current record...');
        return this.getServiceBooking(id);
    }

    values.push(id);
    const query = `UPDATE service_bookings SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    console.log('[updateServiceBooking] Executing query:', query);
    const result = await db.query(query, values);

    const updatedBooking = result[0];
    console.log('[updateServiceBooking] Booking updated:', updatedBooking);

    // If status was updated to 'completed', trigger completeServiceBooking
    if (updates.status === 'completed') {
        console.log(`[updateServiceBooking] Booking status is 'completed'. Triggering completeServiceBooking(${id})...`);
        await this.completeServiceBooking(id);
        console.log(`[updateServiceBooking] completeServiceBooking(${id}) finished.`);
    }

    return updatedBooking;
},


    async cancelServiceBooking(id: number): Promise<void> {
        await db.query(
            'UPDATE service_bookings SET status = \'cancelled\' WHERE id = $1',
            [id]
        );
    },

    async completeServiceBooking(id: number): Promise<void> {
    console.log(`[completeServiceBooking] Starting transaction for booking ID: ${id}`);
    
    // Start a transaction
    await db.query('BEGIN');
    console.log('[completeServiceBooking] Transaction started');

    try {
        // 1. Update the booking status
        console.log('[completeServiceBooking] Updating booking status to completed...');
        await db.query(
            'UPDATE service_bookings SET status = \'completed\' WHERE id = $1',
            [id]
        );
        console.log('[completeServiceBooking] Booking status updated');

        // 2. Get booking details with user and showroom info
        console.log('[completeServiceBooking] Fetching booking details...');
        const bookingQuery = `
          SELECT 
              sb.*, 
              u.id as user_id,
              u.email, 
              u.first_name,
              u.phone,
              s.name as showroom_name,
              s.user_id as showroom_owner_id
          FROM service_bookings sb
          JOIN users u ON sb.user_id = u.id
          LEFT JOIN showrooms s ON sb.showroom_id = s.id
          WHERE sb.id = $1
      `;
        const result = await db.query(bookingQuery, [id]);
        const booking = result[0];
        console.log("booking", booking);



        if (!booking) {
            console.error('[completeServiceBooking] Booking not found');
            throw new Error('Booking not found');
        }

        console.log('[completeServiceBooking] Booking details fetched:', {
            userId: booking?.user_id,
            showroomOwnerId: booking?.showroom_owner_id,
            showroomName: booking?.showroom_name,
            userEmail: booking?.email,
        });

        // 3. Generate review link
        console.log('[completeServiceBooking] Generating review link...');
        const reviewLink = generateReviewLink({
            showroomId: booking?.showroom_id,
            bookingId: booking?.id,
            userId: booking?.user_id
        });
        console.log('[completeServiceBooking] Review link generated:', reviewLink);

        // 4. Create notifications using NotificationService
        console.log('[completeServiceBooking] Creating notifications...');
        await notificationService.createServiceCompletionNotifications(
            booking.id,
            booking.showroom_owner_id,
            booking.user_id,
            booking.email,
            booking.phone,
            booking.showroom_name,
            booking.first_name,
            reviewLink
        );
        console.log('[completeServiceBooking] Notifications created successfully');

        // Commit the transaction
        await db.query('COMMIT');
        console.log('[completeServiceBooking] Transaction committed successfully');
    } catch (error) {
        console.error('[completeServiceBooking] Error occurred:', error);
        // Rollback on error
        await db.query('ROLLBACK');
        console.log('[completeServiceBooking] Transaction rolled back due to error');
        throw error;
    }
    }


};

export function generateReviewLink(params: {
    showroomId: number;
    bookingId: number;
    userId?: number;
}) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    return `${baseUrl}/review?showroomId=${params.showroomId}&bookingId=${params.bookingId}`;
}


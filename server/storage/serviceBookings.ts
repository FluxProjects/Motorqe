import { db } from "../db";
import { ServiceBooking, InsertServiceBooking } from "@shared/schema";

export interface IServiceBookingStorage {

    getServiceBookingsByUser(userId: number): Promise<ServiceBooking[]>;
    getServiceBookingsByShowroom(showroomId: number): Promise<ServiceBooking[]>;
    getServiceBooking(id: number): Promise<ServiceBooking | undefined>;
    createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking>;
    updateServiceBooking(id: number, updates: Partial<InsertServiceBooking>): Promise<ServiceBooking | undefined>;
    cancelServiceBooking(id: number): Promise<void>;
    completeServiceBooking(id: number): Promise<void>;

}

export const ServiceBookingStorage = {

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
            'INSERT INTO service_bookings (user_id, service_id, scheduled_at, status, notes) ' +
            'VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [
                booking.userId,
                booking.serviceId,
                booking.scheduledAt,
                booking.status || 'pending',
                booking.notes
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
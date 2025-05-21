import { db } from "../db";
import { Report, InsertReport } from "@shared/schema";

export interface IReportStorage {

    getReports(): Promise<Report[]>;
    getReport(id: number): Promise<Report | undefined>;
    addReport(report: InsertReport): Promise<Report>;
    updateReportStatus(id: number, status: 'pending' | 'reviewed' | 'resolved'): Promise<void>;
    deleteReport(id: number): Promise<void>;

}

export const ReportStorage = {

    async getReports(): Promise<Report[]> {
        return await db.query('SELECT * FROM reports ORDER BY created_at DESC');
    },

    async getReport(id: number): Promise<Report | undefined> {
        const result = await db.query('SELECT * FROM reports WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },

    async addReport(report: InsertReport): Promise<Report> {
        const result = await db.query(
            'INSERT INTO reports (user_id, car_id, reason, details) VALUES ($1, $2, $3, $4) RETURNING *',
            [report.userId, report.carId, report.reason, report.details]
        );
        return result[0];
    },

    async updateReportStatus(id: number, status: 'pending' | 'reviewed' | 'resolved'): Promise<void> {
        await db.query('UPDATE reports SET status = $1 WHERE id = $2', [status, id]);
    },

    async deleteReport(id: number): Promise<void> {
        await db.query('DELETE FROM reports WHERE id = $1', [id]);
    }

};
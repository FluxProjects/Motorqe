import { db } from "../db";
import bcrypt from "bcryptjs";
import { User, InsertUser } from "@shared/schema";

export interface IUserStorage {
    getUserByEmail(email: string): Promise<User | undefined>;
    hashPassword(password: string): Promise<string>;
    getUser(id: number): Promise<User | undefined>;
    getUsersByIds(ids: number[]): Promise<User[]>;
    getFilteredUsers(params: {
        search?: string;
        role?: string;
        status?: string;
        sortBy?: string;
    }): Promise<User[]>;
    getUserByUsername(username: string): Promise<User | undefined>;
    getUserWithPassword(id: number): Promise<{ password: string } | undefined>;
    updateUserPassword(id: number, newPassword: string): Promise<boolean>;
    updateUserPasswordByEmail(email: string, newPassword: string): Promise<boolean>;
    createUser(user: InsertUser): Promise<User>;
    updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
    deleteUser(id: number): Promise<void>;
    createPasswordResetToken(
        email: string,
        otp: string,
        token: string
    ): Promise<void>;
    verifyPasswordResetToken(
        email: string,
        otp: string,
        token: string
    ): Promise<boolean>;
    invalidateResetToken(token: string): Promise<void>;
    updateLastLogin(id: number, ip: string): Promise<void>;

}

export const UserStorage = {

    async getUserByEmail(email: string): Promise<User | undefined> {
        const result = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
        return result[0];
    },
    
      async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    },
    
      async getUser(id: number): Promise<User | undefined> {
        const result = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    },
    
      async getUsersByIds(ids: number[]): Promise<User[]> {
        if (!ids.length) return [];
        const result = await db.query('SELECT * FROM users WHERE id = ANY($1)', [ids]);
        return result;
    },
    
      async getFilteredUsers({
        search,
        role,
        status,
        sortBy,
    }: {
        search?: string;
        role?: string;
        status?: string;
        sortBy?: string;
    }): Promise<User[]> {
        const values: any[] = [];
        const conditions: string[] = [];

        if (search) {
            values.push(`%${search}%`);
            conditions.push(`(first_name ILIKE $${values.length} OR last_name ILIKE $${values.length} OR email ILIKE $${values.length})`);
        }

        if (role) {
            values.push(role);
            conditions.push(`role_id = $${values.length}`);
        }

        if (status) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        let query = "SELECT * FROM users";
        if (conditions.length) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        if (sortBy) {
            const allowedSorts = ["username", "email", "first_name", "created_at"];
            if (allowedSorts.includes(sortBy)) {
                query += ` ORDER BY ${sortBy}`;
            }
        }

        const result = await db.query(query, values);
        return result;
    },
    
      async getUserByUsername(username: string): Promise<User | undefined> {
        const result = await db.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
        return result[0];
    },
    
      async getUserWithPassword(id: number): Promise<{ password: string } | undefined> {
        const query = 'SELECT password FROM users WHERE id = $1';
        const result = await db.query(query, [id]);
        return result[0];
    },
    
    async updateUserPassword(id: number, newPassword: string): Promise<boolean> {
        const result = await db.query(
            `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
            [newPassword, id]
        );
        return result.length > 0;
    },
    
    async updateUserPasswordByEmail(email: string, newPassword: string): Promise<boolean> {
        const result = await db.query(
            `UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2 RETURNING id`,
            [newPassword, email]
        );
        return result.length > 0;
    },
    
      async createUser(user: InsertUser): Promise<User> {
        const fields = Object.keys(user);
        const values = Object.values(user);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },
    
      async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const query = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
        const result = await db.query(query, [...values, id]);
        return result[0];
    },
    
      async deleteUser(id: number): Promise<void> {
        await db.query('DELETE FROM users WHERE id = $1', [id]);
    },
    
      async createPasswordResetToken(
        email: string,
        otp: string,
        token: string
    ): Promise<void> {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

        await db.query(
            `INSERT INTO password_reset_tokens 
         (email, token, otp, expires_at) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) 
         DO UPDATE SET token = $2, otp = $3, expires_at = $4, used = false`,
            [email, token, otp, expiresAt]
        );
    },
    
    async verifyPasswordResetToken(
        email: string,
        otp: string,
        token: string
    ): Promise<boolean> {
        const result = await db.query(
            `SELECT 1 FROM password_reset_tokens 
         WHERE email = $1 AND token = $2 AND otp = $3 
         AND expires_at > NOW() AND used = false`,
            [email, token, otp]
        );
        return result.length > 0;
    },
    
    async invalidateResetToken(token: string): Promise<void> {
        await db.query(
            `UPDATE password_reset_tokens SET used = true WHERE token = $1`,
            [token]
        );
    },
    
    async updateLastLogin(id: number, ip: string): Promise<void> {
        await db.query(
            `UPDATE users SET last_login_at = NOW(), login_ip = $1, updated_at = NOW() WHERE id = $2`,
            [ip, id]
        );
    }

};
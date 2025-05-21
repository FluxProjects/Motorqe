import { db } from "../db";
import { UserRoleSwitch, InsertUserRoleSwitch } from "@shared/schema";

export interface IUserRoleSwitchStorage {

    getUserRoleSwitches(userId: number): Promise<UserRoleSwitch[]>;
    createUserRoleSwitch(switchData: InsertUserRoleSwitch): Promise<UserRoleSwitch>;
    activateUserRole(userId: number, role: string): Promise<void>;
    deactivateUserRole(userId: number, role: string): Promise<void>;
    getActiveUserRole(userId: number): Promise<string | undefined>;

}

export const UserRoleSwitchStorage = {

    async getUserRoleSwitches(userId: number): Promise<UserRoleSwitch[]> {
        return await db.query(
            'SELECT * FROM user_roles_switch WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
    },

    async createUserRoleSwitch(switchData: InsertUserRoleSwitch): Promise<UserRoleSwitch> {
        const result = await db.query(
            'INSERT INTO user_roles_switch (user_id, role, is_active) VALUES ($1, $2, $3) RETURNING *',
            [switchData.userId, switchData.role, switchData.isActive]
        );
        return result[0];
    },

    async activateUserRole(userId: number, role: string): Promise<void> {
        await db.query('BEGIN');
        try {
            // Deactivate all other roles for this user
            await db.query(
                'UPDATE user_roles_switch SET is_active = false WHERE user_id = $1',
                [userId]
            );

            // Activate the specified role
            await db.query(
                'UPDATE user_roles_switch SET is_active = true WHERE user_id = $1 AND role = $2',
                [userId, role]
            );

            await db.query('COMMIT');
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    },

    async deactivateUserRole(userId: number, role: string): Promise<void> {
        await db.query(
            'UPDATE user_roles_switch SET is_active = false WHERE user_id = $1 AND role = $2',
            [userId, role]
        );
    },

    async getActiveUserRole(userId: number): Promise<string | undefined> {
        const result = await db.query(
            'SELECT role FROM user_roles_switch WHERE user_id = $1 AND is_active = true LIMIT 1',
            [userId]
        );
        return result[0]?.role;
    }

};
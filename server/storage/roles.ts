import { db } from "../db";
import { Role, InsertRole } from "@shared/schema";

export interface IRoleStorage {

    getAllRoles(): Promise<Role[]>;
    getRole(id: number): Promise<Role | undefined>;
    createRole(role: InsertRole): Promise<Role>;
    updateRole(id: number, updates: Partial<InsertRole>): Promise<Role | undefined>;
    deleteRole(id: number): Promise<void>;
    getRoleIdByName(roleName: string): Promise<number>;

}

export const RoleStorage = {

     async getAllRoles(): Promise<Role[]> {
        return await db.query('SELECT * FROM roles ORDER BY name');
      },
    
      async getRole(id: number): Promise<Role | undefined> {
        const result = await db.query('SELECT * FROM roles WHERE id = $1 LIMIT 1', [id]);
        return result[0];
      },
    
      async createRole(role: InsertRole): Promise<Role> {
        const result = await db.query(
          'INSERT INTO roles (name, name_ar, description) VALUES ($1, $2, $3) RETURNING *',
          [role.name, role.nameAr, role.description]
        );
        return result[0];
      },
    
      async updateRole(id: number, updates: Partial<InsertRole>): Promise<Role | undefined> {
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
        if (updates.description !== undefined) {
          fields.push(`description = $${paramIndex}`);
          values.push(updates.description);
          paramIndex++;
        }
    
        if (fields.length === 0) {
          return this.getRole(id);
        }
    
        values.push(id);
        const query = `UPDATE roles SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
      },
    
      async deleteRole(id: number): Promise<void> {
        await db.query('DELETE FROM roles WHERE id = $1', [id]);
      },
    
      async getRoleIdByName(roleName: string): Promise<number> {
        const result = await db.query('SELECT id FROM roles WHERE name = $1 LIMIT 1', [roleName]);
        if (!result[0]) throw new Error('Role not found');
        return result[0].id;
      }    

};
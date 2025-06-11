import { CarInspection } from "@shared/schema";
import { db } from "../db";

interface CarInspectionInput {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  carMake: string;
  carModel: string;
  carYear: number;
  price: number;
  additionalNotes?: string | null;
}

interface CarInspectionFinal {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  car_make: string;
  car_model: string;
  car_year: number;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  additional_notes: string | null;
  created_at: Date;
}


export interface ICarInspectionStorage {

    getInspections(status?: string): Promise<CarInspection[]>;
    getInspectionById(id: number): Promise<CarInspection | null>;
    createInspection(data: Omit<CarInspection, 'id' | 'created_at' | 'status'>): Promise<CarInspection>;
    updateInspectionStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<CarInspection>;
    deleteInspection(id: number): Promise<void>;

}

export const CarInspectionStorage = {

    async getInspections(status?: string): Promise<CarInspection[]> {
    let query = `
      SELECT 
        i.*,
        u.first_name,
        u.email,
        u.phone
      FROM car_inspections i
      JOIN users u ON i.user_id = u.id
    `;
    
    const params: any[] = [];
    
    if (status && status !== 'all') {
      query += ` WHERE i.status = $1`;
      params.push(status);
    }
    
    query += ` ORDER BY i.created_at DESC`;
    
    return await db.query(query, params);
  },

  // Get single inspection by ID
  async getInspectionById(id: number): Promise<CarInspection | null> {
    const [inspection] = await db.query(`
      SELECT 
        i.*,
        u.first_name,
        u.email,
        u.phone
      FROM car_inspections i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `, [id]);
    
    return inspection || null;
  },

  // Create new inspection
  async createInspection(data: CarInspectionInput): Promise<CarInspectionFinal> {
  const [newInspection] = await db.query(`
    INSERT INTO car_inspections (
      user_id,
      full_name,
      email,
      phone,
      car_make,
      car_model,
      car_year,
      price,
      status,
      additional_notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
    RETURNING *,
      (SELECT first_name || ' ' || last_name FROM users WHERE id = $1) as full_name,
      (SELECT email FROM users WHERE id = $1) as email,
      (SELECT phone FROM users WHERE id = $1) as phone
  `, [
    data.userId,
    data.fullName,
    data.email,
    data.phone,
    data.carMake,
    data.carModel,
    data.carYear,
    data.price,
    data.additionalNotes || null
  ]);
  
  return newInspection;
},

  // Update inspection status
  async updateInspectionStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<CarInspection> {
    const [updated] = await db.query(`
      UPDATE car_inspections
      SET status = $1
      WHERE id = $2
      RETURNING *,
        (SELECT first_name FROM users WHERE id = user_id) as first_name,
        (SELECT email FROM users WHERE id = user_id) as email,
        (SELECT phone FROM users WHERE id = user_id) as phone
    `, [status, id]);
    
    return updated;
  },

  // Delete inspection
  async deleteInspection(id: number): Promise<void> {
    await db.query(`DELETE FROM car_inspections WHERE id = $1`, [id]);
  }

}
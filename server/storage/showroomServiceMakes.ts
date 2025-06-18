import { storage } from "server/storage";
import { db } from "../db";
import { ShowroomMake, CarMake } from "@shared/schema";

export interface IShowroomServiceMakeStorage {

  getShowroomMakes(listingId: number): Promise<(ShowroomMake & { make?: CarMake })[]>;
  getGarageMakes(garageId: number): Promise<(ShowroomMake & { make_id: number; make_name: string; make_image: string })[]>;
  getAllShowroomsMakes(): Promise<any>;
  addShowroomMake(serviceId: number, makeId: number): Promise<ShowroomMake>;
  removeShowroomMake(serviceId: number, makeId: number): Promise<void>;
  bulkAddShowroomMakes(serviceId: number, makeIds: number[]): Promise<void>;

}

export const ShowroomMakeStorage = {

  async getAllShowroomsMakes(): Promise<any[]> {
    return await db.query('SELECT * FROM showroom_service_makes');
  },

  async getShowroomMakes(
    showroomId: number
  ): Promise<(ShowroomMake & { make?: CarMake })[]> {
    const showroomMakes = await db.query(
      'SELECT * FROM car_listings WHERE showroom_id = $1',
      [showroomId]
    );

    const enrichedMakes = await Promise.all(
      showroomMakes.map(async (item) => {
        const make = await storage.getCarMake(item.make_id); // Assuming `make_id` refers to `car_makes.id`
        return { ...item, make };
      })
    );

    return enrichedMakes;
  },

  async getGarageMakes(garageId: number): Promise<(ShowroomMake & { make_id: number; make_name: string; make_image: string })[]> {
  const showroomMakes = await db.query(
    `
    SELECT 
      ssm.*, 
      cm.id AS make_id,
      cm.name AS make_name,
      cm.name_ar AS make_name_ar,
      cm.image AS make_image
    FROM showroom_service_makes ssm
    JOIN car_makes cm ON ssm.make_id = cm.id
    WHERE ssm.showroom_id = $1
    `,
    [garageId]
  );

  return showroomMakes;
},

  async addShowroomMake(serviceId: number, makeId: number): Promise<ShowroomMake> {
    const result = await db.query(
      'INSERT INTO showroom_makes (service_id, make_id) VALUES ($1, $2) RETURNING *',
      [serviceId, makeId]
    );
    return result[0];
  },

  async removeShowroomMake(serviceId: number, makeId: number): Promise<void> {
    await db.query(
      'DELETE FROM showroom_makes WHERE showroom_service_id = $1 AND make_id = $2',
      [serviceId, makeId]
    );
  },

  async bulkAddShowroomMakes(serviceId: number, makeIds: number[]): Promise<void> {
    if (!makeIds.length) return;

    const values = makeIds.map((id, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
      .join(', ');
    const params = makeIds.flatMap(id => [serviceId, id]);

    await db.query(
      `INSERT INTO showroom_makes (showroom_service_id, make_id) VALUES ${values}`,
      params
    );
  }


};
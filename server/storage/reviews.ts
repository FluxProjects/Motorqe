import { db } from "../db";
import type { InsertReview, Review } from "@shared/schema";

export interface IReviewsStorage {

}
export const ReviewsStorage = {
  // Get all reviews
  async getAllReviews(): Promise<Review[]> {
    const query = `SELECT * FROM reviews ORDER BY created_at DESC`;
    return await db.query(query);
  },

  // Get single review by ID
  async getReviewById(id: number): Promise<Review | null> {
    const query = `SELECT * FROM reviews WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result[0] || null;
  },

  // Create a review and update the showroom rating
  async createReview(data: InsertReview): Promise<Review> {
    const query = `
      INSERT INTO reviews (showroom_id, user_id, rating, comment, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *;
    `;

    const values = [data.showroom_id, data.author, data.rating, data.comment];
    const result = await db.query(query, values);
    const review = result[0];

    await storage.updateShowroomAverageRating(data.showroom_id);

    return review;
  },

  // Update review and refresh rating
  async updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key in updates) {
      fields.push(`${key} = $${idx}`);
      values.push((updates as any)[key]);
      idx++;
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE reviews
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING *;
    `;

    values.push(id);

    const result = await db.query(query, values);
    const updated = result[0];

    if (updated) {
      await storage.updateShowroomAverageRating(updated.showroom_id);
    }

    return updated || null;
  },

  // Delete review and refresh rating
  async deleteReview(id: number): Promise<void> {
    const review = await storage.getReviewById(id);
    if (!review) return;

    await db.query(`DELETE FROM reviews WHERE id = $1`, [id]);

    await storage.updateShowroomAverageRating(review.showroom_id);
  },

  // Update average rating for a showroom
  async updateShowroomAverageRating(showroomId: number): Promise<void> {
    const query = `
      UPDATE showrooms
      SET rating = COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM reviews
        WHERE showroom_id = $1
      ), 0)
      WHERE id = $1;
    `;

    try {
      await db.query(query, [showroomId]);
    } catch (error) {
      console.error("❌ Failed to update showroom rating:", error);
      throw new Error("Failed to update showroom rating");
    }
  }
};

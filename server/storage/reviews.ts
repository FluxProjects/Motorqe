import { db } from "../db";
import type { InsertReview, Review } from "@shared/schema";

export interface IReviewsStorage {

  getAllReviews(): Promise<Review[]>;
  getReviewById(id: number): Promise<Review | null>;
  createReview(data: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | null>;
  deleteReview(id: number): Promise<void>;
  updateShowroomAverageRating(showroomId: number): Promise<void>;

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
  // storage/reviews.ts
  async createReview(data: InsertReview): Promise<Review> {
    const query = `
      INSERT INTO reviews (showroom_id, user_id, rating, comment, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *;
    `;

    // use camelCase properties from your schema
    const values = [
      data.showroomId,
      data.userId,
      data.rating,
      data.comment ?? null,
    ];

    const result = await db.query(query, values);
    const review = result[0];

    await ReviewsStorage.updateShowroomAverageRating(data.showroomId);
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
      await ReviewsStorage.updateShowroomAverageRating(updated.showroom_id);
    }

    return updated || null;
  },

  // Delete review and refresh rating
  async deleteReview(id: number): Promise<void> {
    const review = await ReviewsStorage.getReviewById(id);
    if (!review) return;

    await db.query(`DELETE FROM reviews WHERE id = $1`, [id]);

    await ReviewsStorage.updateShowroomAverageRating(review.showroom_id);
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

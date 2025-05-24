import { db } from "../db";
import { Favorite, InsertFavorite } from "@shared/schema";

export interface IFavoriteStorage {

    getFavoritesByUser(userId: number): Promise<Favorite[]>;
    addFavorite(favorite: InsertFavorite): Promise<Favorite>;
    removeFavorite(favorite: Partial<Favorite>): Promise<void>;
    isFavorite(favorite: Partial<Favorite>): Promise<boolean>;

}

export const FavoriteStorage = {

   async getFavoritesByUser(userId: number): Promise<Favorite[]> {
  if (!userId) return []; // Return empty array if no userId provided
  const favorites = await db.query(
    'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return favorites;
},

    async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    if (!favorite.userId || !favorite.listingId) {
        throw new Error('Missing userId or listingId');
    }

    const result = await db.query(
        'INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) RETURNING *',
        [favorite.userId, favorite.listingId]
    );
    return result[0];
},

    async removeFavorite(favorite: Partial<Favorite>): Promise<void> {
    if (!favorite.userId || !favorite.listingId) {
        throw new Error('Missing userId or listingId');
    }

    await db.query(
        'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2',
        [favorite.userId, favorite.listingId]
    );
},

    async isFavorite(favorite: Partial<Favorite>): Promise<boolean> {
    if (!favorite.userId || !favorite.listingId) {
        throw new Error('Missing userId or listingId');
    }

    const result = await db.query(
        'SELECT 1 FROM favorites WHERE user_id = $1 AND listing_id = $2 LIMIT 1',
        [favorite.userId, favorite.listingId]
    );

    return result.length > 0;
}



};
import { db } from "../db";
import { Favorite, InsertFavorite } from "@shared/schema";

export interface IFavoriteStorage {

    getFavoritesByUser(userId: number): Promise<Favorite[]>;
    addFavorite(favorite: InsertFavorite): Promise<Favorite>;
    removeFavorite(userId: number, listingId: number): Promise<void>;
    isFavorite(userId: number, listingId: number): Promise<boolean>;

}

export const FavoriteStorage = {

    async getFavoritesByUser(userId: number): Promise<Favorite[]> {
        return await db.query('SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    },

    async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
        const result = await db.query(
            'INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) RETURNING *',
            [favorite.userId, favorite.listingId]
        );
        return result[0];
    },

    async removeFavorite(userId: number, listingId: number): Promise<void> {
        await db.query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [userId, listingId]);
    },

    async isFavorite(userId: number, listingId: number): Promise<boolean> {
        const result = await db.query(
            'SELECT 1 FROM favorites WHERE user_id = $1 AND listing_id = $2 LIMIT 1',
            [userId, listingId]
        );
        return result.length > 0;
    }

};
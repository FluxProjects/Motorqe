import { db } from "../db";
import { SearchHistory, InsertSearchHistory } from "@shared/schema";

export interface ISearchHistoryStorage {

    getSearchHistoryByUser(userId: number): Promise<SearchHistory[]>;
    addSearchHistory(entry: InsertSearchHistory): Promise<SearchHistory>;
    clearUserSearchHistory(userId: number): Promise<void>;

}

export const SearchHistoryStorage = {

    async getSearchHistoryByUser(userId: number): Promise<SearchHistory[]> {
        return await db.query(
            'SELECT * FROM search_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
    },

    async addSearchHistory(entry: InsertSearchHistory): Promise<SearchHistory> {
        const result = await db.query(
            'INSERT INTO search_history (user_id, query) VALUES ($1, $2) RETURNING *',
            [entry.userId, entry.query]
        );
        return result[0];
    },

    async clearUserSearchHistory(userId: number): Promise<void> {
        await db.query('DELETE FROM search_history WHERE user_id = $1', [userId]);
    }

};
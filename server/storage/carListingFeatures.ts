import { db } from "../db";
import { CarListingFeature, InsertCarListingFeature } from "@shared/schema";

export interface ICarListingFeatureStorage {

    getFeaturesForListing(listingId: number): Promise<CarListingFeature[]>;
    addFeatureToListing(listingId: number, featureId: number): Promise<CarListingFeature>;
    removeFeatureFromListing(listingId: number, featureId: number): Promise<void>;
    clearFeaturesForListing(listingId: number): Promise<void>;
    bulkAddFeaturesToListing(listingId: number, featureIds: number[]): Promise<void>;

}

export const CarListingFeatureStorage = {

    async getFeaturesForListing(listing_id: number): Promise<CarListingFeature[]> {
        return await db.query('SELECT * FROM car_listing_features WHERE listing_id = $1', [listing_id]);
    },

    async addFeatureToListing(listingId: number, featureId: number): Promise<CarListingFeature> {
        const result = await db.query(
            'INSERT INTO car_listing_features (listing_id, feature_id) VALUES ($1, $2) RETURNING *',
            [listingId, featureId]
        );
        return result[0];
    },

    async removeFeatureFromListing(listingId: number, featureId: number): Promise<void> {
        await db.query(
            'DELETE FROM car_listing_features WHERE listing_id = $1 AND feature_id = $2',
            [listingId, featureId]
        );
    },

    async clearFeaturesForListing(listingId: number): Promise<void> {
        await db.query(`DELETE FROM car_listing_features WHERE listing_id = $1`, [listingId]);
    },


    async bulkAddFeaturesToListing(listingId: number, featureIds: number[]): Promise<void> {
        if (!featureIds.length) return;

        const validFeatures = featureIds
            .filter((id) => typeof id === 'number' && !isNaN(id));

        if (validFeatures.length === 0) return;

        const values = validFeatures
            .map((featureId, i) => `($1, $${i + 2})`)
            .join(", ");

        const params = [listingId, ...validFeatures];

        await db.query(
            `INSERT INTO car_listing_features (listing_id, feature_id) VALUES ${values}`,
            params
        );
    }

};
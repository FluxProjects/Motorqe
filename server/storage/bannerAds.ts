import { BannerAd, InsertBannerAd } from "@shared/schema";
import { fileURLToPath } from 'url';
import * as fs from 'fs/promises';
import * as path from 'path';
import { db } from "server/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface IBannerAdsStorage {

    getAllBannerAds(): Promise<BannerAd[]>;
    getBannerAdById(id: number): Promise<BannerAd | undefined>;
    createBannerAd(banner: InsertBannerAd): Promise<BannerAd>;
    updateBannerAd(id: number, updates: Partial<InsertBannerAd>): Promise<BannerAd | undefined>;
    deleteBannerAd(id: number): Promise<void>;
    deleteBannerImage(imageUrl: string): Promise<void>;

    uploadSingleFile(file: Express.Multer.File): Promise<string>;
    uploadMultipleFiles(file: Express.Multer.File): Promise<string>;
    

}


export const BannerAdsStorage = {
    
    async getAllBannerAds(): Promise<BannerAd[]> {
        const result = await db.query(
            `SELECT * FROM banner_ads ORDER BY position, start_date DESC`
        );
        return result;
    },

    async getBannerAdById(id: number): Promise<BannerAd | undefined> {
        const result = await db.query(
            `SELECT * FROM banner_ads WHERE id = $1`,
            [id]
        );
        return result[0];
    },

    async createBannerAd(banner: InsertBannerAd): Promise<BannerAd> {
        const result = await db.query(
            `INSERT INTO banner_ads 
    (title, title_ar, image_url, link, position, is_active, start_date, end_date) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *`,
            [
                banner.title,
                banner.titleAr,
                banner.imageUrl,
                banner.link,
                banner.position || 'top',
                banner.isActive ?? true,
                banner.startDate,
                banner.endDate
            ]
        );
        return result[0];
    },

    async updateBannerAd(id: number, updates: Partial<InsertBannerAd>): Promise<BannerAd | undefined> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Dynamic field updates
        const fieldMappings = {
            title: 'title',
            titleAr: 'title_ar',
            imageUrl: 'image_url',
            link: 'link',
            position: 'position',
            isActive: 'is_active',
            startDate: 'start_date',
            endDate: 'end_date'
        };

        Object.entries(updates).forEach(([key, value]) => {
            if (key in fieldMappings && value !== undefined) {
                fields.push(`${fieldMappings[key as keyof typeof fieldMappings]} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        if (fields.length === 0) {
            return this.getBannerAdById(id);
        }

        // Always update the updated_at timestamp
        fields.push(`updated_at = $${paramIndex}`);
        values.push(new Date());
        paramIndex++;

        values.push(id);
        const query = `UPDATE banner_ads SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
    },

    async deleteBannerAd(id: number): Promise<boolean> {
    try {
        await db.query(
            `DELETE FROM banner_ads WHERE id = $1`,
            [id]
        );
        return true; // Success
    } catch (error) {
        return false; // Failure
    }
},

    

    async deleteBannerImage(imageUrl: string | undefined | null): Promise<boolean> {
    // Check if imageUrl exists and is a string
    if (!imageUrl || typeof imageUrl !== 'string') {
        console.warn('No image URL provided for deletion');
        return false;
    }

    // Only attempt deletion for local files
    if (imageUrl.startsWith('/src/assets/uploads/')) {
        const filePath = path.join(__dirname, '../../client', imageUrl);
        try {
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            console.error('Failed to delete banner image:', error);
            return false;
        }
    }

    // Return true for external URLs or if no deletion was needed
    return true;
},

    async uploadSingleFile(MFile: Express.Multer.File): Promise<string> {
        const uploadDir = path.resolve(__dirname, "../../client/src/assets/uploads");
        const fileName = `${Date.now()}-${MFile.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(filePath, MFile.buffer);

        // Return public URL path
        return `/src/assets/uploads/${fileName}`;
    },

    async uploadMultipleFiles(file: Express.Multer.File): Promise<string> {
        const uploadDir = path.resolve(__dirname, "../../client/src/assets/uploads");
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(filePath, file.buffer);

        // Return public URL path
        return `/src/assets/uploads/${fileName}`;
    },
}
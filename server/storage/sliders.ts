import { HeroSlider, InsertHeroSlider } from "@shared/schema";
import { db } from "server/db";

// Hero Sliders Storage Operations
export interface ISliderStorage {

    getAllHeroSliders(): Promise<HeroSlider[]>;
    createHeroSlider(slider: InsertHeroSlider): Promise<HeroSlider>;
    updateHeroSlider(id: number, updates: Partial<InsertHeroSlider>): Promise<HeroSlider | undefined>;
    deleteHeroSlider(id: number): Promise<boolean>;
    getHeroSliderById(id: number): Promise<HeroSlider | undefined>;
    
}

export const SliderStorage = {
  async getAllHeroSliders(): Promise<HeroSlider[]> {
    return await db.query("SELECT * FROM hero_sliders ORDER BY slide_type, slide_order");
  },

  async createHeroSlider(slider: InsertHeroSlider): Promise<HeroSlider> {
    const result = await db.query(
      `INSERT INTO hero_sliders 
      (title, title_ar, subtitle, subtitle_ar, button_text, button_text_ar, 
       button_url, image_url, slide_type, is_active, "slide_order") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        slider.title,
        slider.title_ar,
        slider.subtitle,
        slider.subtitle_ar,
        slider.button_text,
        slider.button_text_ar,
        slider.button_url,
        slider.image_url,
        slider.slide_type,
        slider.is_active ?? true,
        slider.slide_order ?? 0
      ]
    );
    return result[0];
  },

  async updateHeroSlider(id: number, updates: Partial<InsertHeroSlider>): Promise<HeroSlider | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMappings = {
      title: 'title',
      title_ar: 'title_ar',
      subtitle: 'subtitle',
      subtitle_ar: 'subtitle_ar',
      button_text: 'button_text',
      button_text_ar: 'button_text_ar',
      button_url: 'button_url',
      image_url: 'image_url',
      slide_type: 'slide_type',
      is_active: 'is_active',
      slide_order: 'slide_order'
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (key in fieldMappings && value !== undefined) {
        fields.push(`${fieldMappings[key as keyof typeof fieldMappings]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.getHeroSliderById(id);
    }

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    values.push(id);
    const query = `UPDATE hero_sliders SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  },

  async deleteHeroSlider(id: number): Promise<boolean> {
    const result = await db.query("DELETE FROM hero_sliders WHERE id = $1", [id]);
    return result.length > 0;
  },

  async getHeroSliderById(id: number): Promise<HeroSlider | undefined> {
    const result = await db.query("SELECT * FROM hero_sliders WHERE id = $1", [id]);
    return result[0];
  }
};
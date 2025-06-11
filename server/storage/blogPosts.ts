import { BlogPost, InsertBlogPost } from "@shared/schema";
import { db } from "server/db";

// Hero Sliders Storage Operations
export interface IBlogPostStorage {

getAllBlogPosts(): Promise<BlogPost[]>;
createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
deleteBlogPost(id: number): Promise<boolean>;
getBlogPostById(id: number): Promise<BlogPost | undefined>;
getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
    
}

// Blog Posts Storage Operations
export const BlogPostStorage = {

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.query("SELECT * FROM blog_posts ORDER BY published_at DESC");
  },

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.query(
      `INSERT INTO blog_posts 
      (title, title_ar, slug, excerpt, excerpt_ar, content, content_ar, 
       featured_image, author_id, author_name, status, published_at, 
       meta_title, meta_description, tags) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING *`,
      [
        post.title,
        post.titleAr,
        post.slug,
        post.excerpt,
        post.excerptAr,
        post.content,
        post.contentAr,
        post.featuredImage,
        post.authorId,
        post.authorName,
        post.status || 'draft',
        post.publishedAt || new Date(),
        post.metaTitle,
        post.metaDescription,
        post.tags || []
      ]
    );
    return result[0];
  },

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMappings = {
      title: 'title',
      titleAr: 'title_ar',
      slug: 'slug',
      excerpt: 'excerpt',
      excerptAr: 'excerpt_ar',
      content: 'content',
      contentAr: 'content_ar',
      featuredImage: 'featured_image',
      status: 'status',
      publishedAt: 'published_at',
      metaTitle: 'meta_title',
      metaDescription: 'meta_description',
      tags: 'tags'
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (key in fieldMappings && value !== undefined) {
        fields.push(`${fieldMappings[key as keyof typeof fieldMappings]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.getBlogPostById(id);
    }

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    values.push(id);
    const query = `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  },

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db.query("DELETE FROM blog_posts WHERE id = $1", [id]);
    return result.length > 0;
  },

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const result = await db.query("SELECT * FROM blog_posts WHERE id = $1", [id]);
    return result[0];
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const result = await db.query("SELECT * FROM blog_posts WHERE slug = $1", [slug]);
    return result[0];
  }
};
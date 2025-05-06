import 'dotenv/config'; // Load environment variables from .env
import pg from 'pg';

const { Pool } = pg;


// Log that the dotenv config is loaded
console.log('Environment variables loaded from .env');

// Check if DATABASE_URL is available in the environment variables
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set! Please check your .env file.");
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
} else {
  console.log("DATABASE_URL is set:", process.env.DATABASE_URL);
}

// Create a new database connection pool
console.log("Creating database connection pool...");
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Log that the pool is created and ready
pool.on('connect', () => {
  console.log('Successfully connected to the database.');
});

pool.on('error', (err) => {
  console.error('Error with database connection pool:', err);
});

// Instead of Drizzle ORM, export the pool directly so it can be used in other files
export const db = {
  query: async (text: string, params?: any[]) => {
    const client = await pool.connect(); // Get a client from the pool
    try {
      console.log('Executing query:', text); // Log the query to ensure it's being executed
      const result = await client.query(text, params); // Execute the query
      console.log('Query result:', result.rows); // Log the result to ensure data is returned
      return result.rows; // Return the rows from the result
    } catch (error: any) {
      console.error('Error executing query:', error); // Detailed error log
      console.error('Error stack trace:', error.stack); // Log the stack trace
      throw new Error('Failed to fetch data: ' + error.message);
    } finally {
      client.release(); // Release the client back to the pool
    }
  },
};


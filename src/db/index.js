import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Initialize PostgreSQL client
 * Connects to Neon database using CONNECTION_STRING from .env
 */
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_atMGxAlYC61y@ep-dry-star-a1g1acfh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  // SSL is required by Neon
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Connect to the database
 */
try {
  await client.connect();
  console.log('✅ Connected to Neon PostgreSQL database');
} catch (error) {
  console.error('❌ Failed to connect to database:', error.message);
  process.exit(1);
}

/**
 * Create Drizzle ORM instance
 * This is what we use for all database operations
 */
export const db = drizzle(client, { schema });

// Optional: Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await client.end();
  process.exit(0);
});

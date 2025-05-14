import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './db/schema';

// Function to initialize the database
async function initializeDatabase() {
  console.log('🔄 Initializing database with Drizzle ORM...');
  
  try {
    // Create the connection pool
    const pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
    });
    
    // Create the Drizzle instance
    const db = drizzle(pool, { schema });
    
    // Apply migrations
    console.log('🔄 Applying migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('✅ Database initialization completed successfully.');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

export { initializeDatabase };

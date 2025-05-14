import {  drizzle } from 'drizzle-orm/postgres-js';
import { Pool } from 'pg';
import * as schema from './schema';

// Configure PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

// Create Drizzle instance with the schema
const db = drizzle(pool, { schema });

export { db, schema };

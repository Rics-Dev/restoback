const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const schema = require('../src/db/schema');
require('dotenv').config();

// Create the connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Test the connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful.');
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
};

testConnection();

// Create the Drizzle instance
const db = drizzle(pool, { schema });

module.exports = { pool, db };

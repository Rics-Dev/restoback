// db_init.js
const pool = require('./db.js');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🔄 Checking database schema...');
  
  try {
    // Check if schema exists
    const schemaExists = await checkIfSchemaExists();
    
    if (!schemaExists) {
      console.log('🚀 Creating "connected_restaurant" schema...');
      await createSchema();
    } else {
      console.log('✅ Schema "connected_restaurant" already exists.');
    }
    
    // Check and create all required tables
    await createTables();
    
    console.log('✅ Database initialization completed successfully.');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

async function checkIfSchemaExists() {
  const result = await pool.query(
    "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'connected_restaurant'"
  );
  return result.rows.length > 0;
}

async function createSchema() {
  await pool.query('CREATE SCHEMA connected_restaurant');
}

async function createTables() {
  // Read and execute the SQL script
  try {
    const sqlScript = fs.readFileSync(path.join(__dirname, 'db-schema.sql'), 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript.split(';').filter(statement => statement.trim() !== '');
    
    // Start a transaction
    await pool.query('BEGIN');
    
    // Execute each statement
    for (const statement of statements) {
      await pool.query(statement);
    }
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    console.log('✅ Tables created/verified successfully');
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    throw error;
  }
}

module.exports = { initializeDatabase };

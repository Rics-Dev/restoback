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
  try {
    // Instead of directly running all SQL statements, check if tables exist first
    const tableCheckResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'connected_restaurant' 
      AND table_type = 'BASE TABLE'
    `);
    
    const existingTables = tableCheckResult.rows.map(row => row.table_name);
    
    if (existingTables.length > 0) {
      console.log(`✅ Found ${existingTables.length} existing tables in connected_restaurant schema.`);
      
      // Check if the main constraint exists to determine if we need to run full setup
      const constraintCheckResult = await pool.query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_personnel_table' 
        AND table_schema = 'connected_restaurant'
      `);
      
      if (constraintCheckResult.rows.length > 0) {
        console.log('✅ Database schema already properly initialized.');
        return; // Exit early if constraints already exist
      }
    }
    
    // If we get here, we need to initialize the database or add missing parts
    // Read and execute the SQL script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'db-schema.sql'), 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript.split(';').filter(statement => statement.trim() !== '');
    
    // Start a transaction
    await pool.query('BEGIN');
    
    // Execute each statement with IF NOT EXISTS modifications
    for (const statement of statements) {
      // Skip empty statements
      if (!statement || statement.trim() === '') continue;
      
      try {
        await pool.query(statement);
      } catch (err) {
        // If error is about something already existing, just log and continue
        if (err.code === '42710' || // Duplicate constraint
            err.code === '42P07' || // Duplicate table
            err.code === '42701') { // Duplicate column
          console.log(`⚠️ Skipping existing object: ${err.message}`);
          continue;
        }
        throw err; // Rethrow other errors
      }
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

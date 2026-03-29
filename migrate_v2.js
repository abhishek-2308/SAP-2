const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ Error: DATABASE_URL not found in backend/.env');
  process.exit(1);
}

const ssl = { rejectUnauthorized: false };
const pool = new Pool({ connectionString, ssl });

async function migrate() {
  console.log('--- Evolution Migration Started ---');
  try {
    await pool.query(`
      ALTER TABLE boards 
      ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Column is_starred added to boards table');

    await pool.query(`
      ALTER TABLE cards 
      ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'default';
    `);
    console.log('✅ Column theme added to cards table');

    console.log('--- Migration Completed Successfully ---');
  } catch (err) {
    console.error('❌ Migration Failed:', err.stack);
  } finally {
    await pool.end();
    process.exit();
  }
}

migrate();

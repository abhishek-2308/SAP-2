const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://trello_user:uacAuDRNlvEq3WGYBwO0Dxzd5nFxPYTC@dpg-d73o1qoule4c73el2tbg-a.oregon-postgres.render.com/trello_db_khiv',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await pool.query(`ALTER TABLE boards ADD COLUMN IF NOT EXISTS background VARCHAR(255) DEFAULT 'default';`);
    console.log('Added background to boards');
    await pool.query(`ALTER TABLE lists ADD COLUMN IF NOT EXISTS theme VARCHAR(255) DEFAULT 'default';`);
    console.log('Added theme to lists');
    await pool.query(`ALTER TABLE cards ADD COLUMN IF NOT EXISTS theme VARCHAR(255) DEFAULT 'default';`);
    console.log('Added theme to cards');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    pool.end();
  }
}

runMigration();

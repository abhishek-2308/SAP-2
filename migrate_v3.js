const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found in backend/.env');
    process.exit(1);
  }

  console.log('--- Heavy-Duty Migration Started ---');
  console.log('Target:', connectionString.split('@')[1]); // Log host for sanity check
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 90000, // 90 seconds
  });

  try {
    await client.connect();
    console.log('✅ Connection established with Render DB');

    // Boards
    await client.query(`
      ALTER TABLE boards 
      ADD COLUMN IF NOT EXISTS background VARCHAR(100) DEFAULT 'default';
    `);
    console.log('✅ Column background added to boards');

    await client.query(`
      ALTER TABLE boards 
      ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Column is_starred added to boards');

    // Cards
    await client.query(`
      ALTER TABLE cards 
      ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'default';
    `);
    console.log('✅ Column theme added to cards');

    console.log('--- Migration Successful! ---');
  } catch (err) {
    console.error('❌ Migration Critical Failure:', err.message);
    if(err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      console.log('💡 Tip: Your network might be blocking port 5432. Try a mobile hotspot or different WiFi.');
    }
  } finally {
    await client.end();
    process.exit();
  }
}

migrate();

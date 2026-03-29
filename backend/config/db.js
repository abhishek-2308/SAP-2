require('dotenv').config();
const { Pool } = require('pg');

// IPv4 Forcing for Windows Stability: 35.227.164.209 is Oregon Render PG IP
const RAW_URL = process.env.DATABASE_URL || 'postgresql://trello_user:uacAuDRNlvEq3WGYBwO0Dxzd5nFxPYTC@35.227.164.209/trello_db_khiv';
const connectionString = RAW_URL.replace('dpg-d73o1qoule4c73el2tbg-a.oregon-postgres.render.com', '35.227.164.209');

// Determine whether to use SSL. Use SSL in production or when DATABASE_URL points to a remote host.
let ssl = false;
if (process.env.NODE_ENV === 'production') {
  ssl = { rejectUnauthorized: false };
} else if (connectionString && !/localhost|127\.0\.0\.1/.test(connectionString)) {
  // If a non-local connection string is provided in non-production, still attempt SSL by default
  ssl = { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString,
  ssl,
  max: 10,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

module.exports = pool;

require('dotenv').config();
const { Pool } = require('pg');

// Provide a sensible default for local development. You can override with DATABASE_URL in .env
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trello_cello';

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
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

module.exports = pool;

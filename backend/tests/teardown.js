const pool = require('../config/db');

module.exports = async () => {
  console.log('Finalizing database connections...');
  await pool.end();
};

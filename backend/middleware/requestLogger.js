const morgan = require('morgan');

/**
 * HTTP request logger middleware.
 * Uses 'dev' format in development (colored, concise)
 * Uses 'combined' format in production (Apache-style for log aggregators)
 */
const logger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
);

module.exports = logger;

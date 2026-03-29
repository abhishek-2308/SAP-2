// Set a global timeout for all tests to 60 seconds.
// This accommodates cloud-based Render PostgreSQL response times during stress and integration tests.
jest.setTimeout(60000);

// Ensure the database connection pool is correctly closed after all tests have completed
// to prevent memory leaks and open-handle warnings.
// This is now handled in individual test files as per specific requirements.

module.exports = {
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 10000,
  forceExit: true,
  clearMocks: true,
};

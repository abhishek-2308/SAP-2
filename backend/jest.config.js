module.exports = {
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 10000,
  forceExit: true,
  globalTeardown: './tests/teardown.js',
  clearMocks: true,
};

const nextJest = require('next/jest');

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^jose': require.resolve('jose'),
    '^@panva/hkdf': require.resolve('@panva/hkdf'),
    '^preact-render-to-string': require.resolve('preact-render-to-string'),
    '^preact': require.resolve('preact'),
    '^uuid': require.resolve('uuid'),
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);

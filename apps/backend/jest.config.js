export default {
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupFile.js'],
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/modules/**/*.js',
    '!src/modules/**/index.js',
    '!src/modules/**/*.routes.js',
    '!src/modules/**/*.constants.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default {
  transform: {},
  moduleNameMapper: {
    '^#b2b/(.*)$': '<rootDir>/src/modules/b2b/$1',
    '^#b2c/(.*)$': '<rootDir>/src/modules/b2c/$1',
    '^#modules/(.*)$': '<rootDir>/src/modules/$1',
    '^#integrations/(.*)$': '<rootDir>/src/integrations/$1',
    '^#shared/(.*)$': '<rootDir>/src/shared/$1',
    '^#middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^#config/(.*)$': '<rootDir>/config/$1',
    '^#utils/(.*)$': '<rootDir>/src/utils/$1',
    '^#app/(.*)$': '<rootDir>/src/app/$1',
  },
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

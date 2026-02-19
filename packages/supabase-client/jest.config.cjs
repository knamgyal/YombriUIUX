/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,

  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: false,
      },
    ],
  },

  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.cjs'],

  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'cjs'],

  // 1) Only measure coverage for Phase 4 pure TS logic (Section B).
  // Jest coverage configuration supports restricting included files. [web:71]
  collectCoverageFrom: [
    '<rootDir>/src/utils/abuse.ts',
    '<rootDir>/src/utils/social.ts',
    '<rootDir>/src/utils/realtime.ts',
  ],

  // 2) And explicitly ignore the rest (defense-in-depth).
  // These are intentionally NOT part of Phase 4 Jest trust tests. [web:71]
  coveragePathIgnorePatterns: [
    '<rootDir>/src/api/',
  ],

  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};

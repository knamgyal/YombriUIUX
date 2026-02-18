import type { Config } from 'jest';

const config: Config = {
  // Remove preset entirely if necessary:
  // preset: 'jest-expo',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: { warnOnly: false },
      },
    ],
  },
  setupFiles: [],
  setupFilesAfterEnv: [],
  collectCoverageFrom: [
    'src/logic/**/*.ts',
    'src/utils/**/*.ts',
    '!**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },
};

export default config;

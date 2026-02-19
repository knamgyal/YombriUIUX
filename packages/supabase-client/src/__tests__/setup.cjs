// Global test setup
global.console = {
  ...console,
  // Suppress console.error during tests unless needed
  error: jest.fn(),
  warn: jest.fn(),
};

// Setup global mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

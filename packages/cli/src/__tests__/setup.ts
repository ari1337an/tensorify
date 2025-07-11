// Test setup file
// Add any global test configuration here

// Mock keytar for testing
jest.mock("keytar", () => ({
  setPassword: jest.fn(),
  getPassword: jest.fn(),
  deletePassword: jest.fn(),
}));

// Mock open for testing
jest.mock("open", () => jest.fn());

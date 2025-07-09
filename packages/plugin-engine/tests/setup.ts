/**
 * Jest setup file for plugin engine tests
 */

// Global test timeout
jest.setTimeout(30000);

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Uncomment below to disable console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock AWS SDK for unit tests
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetObjectCommand: jest.fn(),
  HeadObjectCommand: jest.fn(),
  ListObjectsV2Command: jest.fn(),
}));

// Mock isolated-vm for unit tests
jest.mock("isolated-vm", () => ({
  __esModule: true,
  default: {
    Isolate: jest.fn().mockImplementation(() => ({
      dispose: jest.fn(),
      compileScript: jest.fn().mockResolvedValue({}),
    })),
  },
}));

// Setup environment variables for tests
process.env.NODE_ENV = "test";
process.env.AWS_REGION = "us-east-1";
process.env.TENSORIFY_PLUGIN_BUCKET = "test-bucket";

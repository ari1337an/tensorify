import {
  initContract,
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { z } from "zod";
import { initServer } from "@ts-rest/express";
import jwt from "jsonwebtoken";

// SECURITY: Only works in development environment
// if (process.env.NODE_ENV !== "development") {
//   throw new Error(
//     "Test auth endpoints are only available in development environment"
//   );
// }

const s = initServer();
const c = initContract();

// Store test users in memory (development only)
const testUsers = new Map<
  string,
  {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    testId: string;
    createdAt: Date;
    token: string;
  }
>();

const createTestUserSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
  username: z.string().min(1, "Username is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const contract = c.router({
  createTestUser: {
    method: "POST",
    path: "/test/auth",
    headers: z.object({
      "x-test-environment": z.literal("development"),
    }),
    body: createTestUserSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        token: z.string(),
        userId: z.string(),
        username: z.string(),
        expiresIn: z.string(),
      }),
      400: z.object({
        status: z.literal("error"),
        message: z.string(),
      }),
      403: z.object({
        status: z.literal("error"),
        message: z.literal("Test endpoints only available in development"),
      }),
    },
    summary: "Create test authentication token (development only)",
    strictStatusCodes: true,
  },

  deleteTestUser: {
    method: "DELETE",
    path: "/test/auth/:userId",
    headers: z.object({
      "x-test-environment": z.literal("development"),
      authorization: z.string(),
    }),
    pathParams: z.object({
      userId: z.string(),
    }),
    responses: {
      200: z.object({
        success: z.literal(true),
        message: z.string(),
      }),
      400: z.object({
        status: z.literal("error"),
        message: z.string(),
      }),
      403: z.object({
        status: z.literal("error"),
        message: z.literal("Test endpoints only available in development"),
      }),
      404: z.object({
        status: z.literal("error"),
        message: z.string(),
      }),
    },
    summary: "Delete test user and revoke token (development only)",
    strictStatusCodes: true,
  },

  getTestUsers: {
    method: "GET",
    path: "/test/auth",
    headers: z.object({
      "x-test-environment": z.literal("development"),
    }),
    responses: {
      200: z.object({
        success: z.literal(true),
        users: z.array(
          z.object({
            id: z.string(),
            username: z.string(),
            testId: z.string(),
            createdAt: z.string(),
          })
        ),
      }),
      400: z.object({
        status: z.literal("error"),
        message: z.string(),
      }),
      403: z.object({
        status: z.literal("error"),
        message: z.literal("Test endpoints only available in development"),
      }),
    },
    summary: "List all test users (development only)",
    strictStatusCodes: true,
  },
});

type CreateTestUserRequest = ServerInferRequest<typeof contract.createTestUser>;
type CreateTestUserResponse = ServerInferResponses<
  typeof contract.createTestUser
>;

type DeleteTestUserRequest = ServerInferRequest<typeof contract.deleteTestUser>;
type DeleteTestUserResponse = ServerInferResponses<
  typeof contract.deleteTestUser
>;

type GetTestUsersRequest = ServerInferRequest<typeof contract.getTestUsers>;
type GetTestUsersResponse = ServerInferResponses<typeof contract.getTestUsers>;

/**
 * Create a test authentication token
 */
export const createTestUser = async (
  request: CreateTestUserRequest
): Promise<CreateTestUserResponse> => {
  try {
    // Double-check environment
    if (process.env.NODE_ENV !== "development") {
      throw new TsRestResponseError(contract.createTestUser, {
        status: 403,
        body: {
          status: "error",
          message: "Test endpoints only available in development",
        },
      });
    }

    const { testId } = request.body;

    // Use consistent username for all test users
    const username = "testing-bot-tensorify-dev";
    const firstName = "Testing";
    const lastName = "Bot";

    // Generate unique user ID
    const userId = `test-user-d930a51d-c882-4443-b3d8-020894f02d8e`;

    // Create JWT token
    const payload = {
      sub: userId,
      id: userId,
      username: username,
      firstName: firstName,
      lastName: lastName,
      email: `${username}@test.tensorify.io`,
      imageUrl: "https://test.tensorify.io/avatar.png",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    // Use a test secret for development
    const secret =
      process.env.TEST_JWT_SECRET || "test-secret-development-only";
    const token = jwt.sign(payload, secret, { algorithm: "HS256" });

    // Store test user
    const testUser = {
      id: userId,
      username,
      firstName,
      lastName,
      testId,
      createdAt: new Date(),
      token,
    };

    testUsers.set(userId, testUser);

    return {
      status: 200,
      body: {
        success: true,
        token,
        userId,
        username,
        expiresIn: "24h",
      },
    };
  } catch (error) {
    if (error instanceof TsRestResponseError) {
      throw error;
    }

    throw new TsRestResponseError(contract.createTestUser, {
      status: 400,
      body: {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to create test user",
      },
    });
  }
};

/**
 * Delete a test user and revoke their token
 */
export const deleteTestUser = async (
  request: DeleteTestUserRequest
): Promise<DeleteTestUserResponse> => {
  try {
    // Double-check environment
    if (process.env.NODE_ENV !== "development") {
      throw new TsRestResponseError(contract.deleteTestUser, {
        status: 403,
        body: {
          status: "error",
          message: "Test endpoints only available in development",
        },
      });
    }

    const { userId } = request.params;

    // Check if user exists
    const testUser = testUsers.get(userId);
    if (!testUser) {
      throw new TsRestResponseError(contract.deleteTestUser, {
        status: 404,
        body: {
          status: "error",
          message: "Test user not found",
        },
      });
    }

    // Remove from memory
    testUsers.delete(userId);

    return {
      status: 200,
      body: {
        success: true,
        message: "Test user deleted and token revoked",
      },
    };
  } catch (error) {
    if (error instanceof TsRestResponseError) {
      throw error;
    }

    throw new TsRestResponseError(contract.deleteTestUser, {
      status: 400,
      body: {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete test user",
      },
    });
  }
};

/**
 * List all test users
 */
export const getTestUsers = async (
  // eslint-disable-next-line no-unused-vars
  _request: GetTestUsersRequest
): Promise<GetTestUsersResponse> => {
  try {
    // Double-check environment
    if (process.env.NODE_ENV !== "development") {
      throw new TsRestResponseError(contract.getTestUsers, {
        status: 403,
        body: {
          status: "error",
          message: "Test endpoints only available in development",
        },
      });
    }

    const users = Array.from(testUsers.values()).map((user) => ({
      id: user.id,
      username: user.username,
      testId: user.testId,
      createdAt: user.createdAt.toISOString(),
    }));

    return {
      status: 200,
      body: {
        success: true,
        users,
      },
    };
  } catch (error) {
    if (error instanceof TsRestResponseError) {
      throw error;
    }

    throw new TsRestResponseError(contract.getTestUsers, {
      status: 400,
      body: {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to get test users",
      },
    });
  }
};

/**
 * Verify test token (used by other endpoints)
 */
export const verifyTestToken = (
  token: string
): {
  valid: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  error?: string;
} => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return { valid: false, error: "Test tokens only valid in development" };
    }

    const secret =
      process.env.TEST_JWT_SECRET || "test-secret-development-only";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = jwt.verify(token, secret) as any;

    // Check if user still exists in our test users store
    const testUser = testUsers.get(decoded.sub || decoded.id);
    if (!testUser) {
      return { valid: false, error: "Test user no longer exists" };
    }

    return { valid: true, user: decoded };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid test token",
    };
  }
};

/**
 * Cleanup all test users (utility function)
 */
export const cleanupAllTestUsers = (): number => {
  if (process.env.NODE_ENV !== "development") {
    return 0;
  }

  const count = testUsers.size;
  testUsers.clear();
  return count;
};

export const actions = {
  createTestUser: s.route(contract.createTestUser, createTestUser),
  deleteTestUser: s.route(contract.deleteTestUser, deleteTestUser),
  getTestUsers: s.route(contract.getTestUsers, getTestUsers),
};

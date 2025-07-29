import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { format } from "timeago.js";

import { verifyTestToken } from "../v1/test/auth";

/**
 * Decodes and verifies a JWT token using JWKS endpoint
 * @param {string} token - The JWT token to verify
 * @param {string} jwksUrl - The JWKS URL to fetch the public key
 * @param {Object} options - Additional verification options
 * @returns {Promise<Object>} Decoded JWT payload
 */
async function verifyJwtWithJwks(token: string, jwksUrl: string, options = {}) {
  try {
    // Create JWKS client
    const client = jwksClient({
      jwksUri: jwksUrl,
      requestHeaders: {}, // Optional headers
      timeout: 30000, // 30 seconds timeout
      cache: true, // Cache keys for 10 minutes by default
      cacheMaxEntries: 5, // Max 5 entries in cache
      cacheMaxAge: 10 * 60 * 1000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 5, // Limit requests per minute
    });

    // Function to get the signing key
    const getKey = (header: any, callback: any) => {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          return callback(err);
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
      });
    };

    // Verify the token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          algorithms: ["RS256", "RS384", "RS512"], // Common RSA algorithms
          ...options, // Allow custom options like audience, issuer, etc.
        },
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        }
      );
    });

    return decoded;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error}`);
  }
}

export async function getDecodedJwt(token: string): Promise<{
  success: boolean;
  data?: any;
  message: string;
}> {
  try {
    // In development, check if this is a test token first
    if (process.env.NODE_ENV === "development") {
      const testTokenResult = verifyTestToken(token);
      if (testTokenResult.valid) {
        return {
          success: true,
          data: testTokenResult.user,
          message: "Test token verified",
        };
      }
      // If it's not a valid test token, continue with normal JWT verification
    }

    if (!token) {
      return {
        success: false,
        message: "Unauthorized: No bearer token or cookie provided!",
      };
    }

    const decodedToken = await verifyJwtWithJwks(
      token,
      process.env.CLERK_JWKS_URL as string
    );

    return {
      success: true,
      data: decodedToken as any,
      message: "Token verified successfully",
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        message:
          "Unauthorized: Token expired " +
          format(new Date(error.expiredAt).toISOString()),
      };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        message: "Unauthorized: Invalid token!",
      };
    } else {
      console.error(error);
      return {
        success: false,
        message: "Unauthorized",
      };
    }
  }
}

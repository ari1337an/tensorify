"use server";

import jwt, { Algorithm } from "jsonwebtoken";
import { NextRequest } from "next/server";
import { JwtPayloadSchema } from "./schema";
import * as cookie from "cookie";
import { TsRestResponseError } from "@ts-rest/core";
import { TsRestRequest } from "@ts-rest/serverless/next";
/**
 * Verifies the authentication of a request.
 *
 * Either the token is in the cookie or the Authorization header.
 * @param request - The request to verify.
 * @param contract - The contract to use for the response.
 * @returns Blocks the response and throws an error if the request is not authenticated.
 */
export async function secureByAuthentication(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contract: any
): Promise<void> {
  const publicKey = process.env.CLERK_PEM_PUBLIC_KEY as string;
  const tokenSameOrigin = cookie.parse(request.headers.get("cookie") || "")[
    "__session"
  ];
  const tokenCrossOrigin = request.headers
    .get("Authorization")
    ?.split(" ")[1] as string;

  if (!tokenSameOrigin && !tokenCrossOrigin) {
    throw new Error("Unauthorized");
  }

  try {
    let decoded;
    const options = { algorithms: ["RS256"] as Algorithm[] }; // The algorithm used to sign the token. Optional.

    if (tokenSameOrigin) {
      decoded = JwtPayloadSchema.parse(
        jwt.verify(tokenSameOrigin, publicKey, options)
      );
    } else {
      decoded = JwtPayloadSchema.parse(
        jwt.verify(tokenCrossOrigin, publicKey, options)
      );
    }

    // Validate the token's expiration (exp) and not before (nbf) claims
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime || decoded.nbf > currentTime) {
      throw new Error("Unauthorized");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // MUST throw an error to be caught by the error handler as the try body is leveraing the try catch block to throw a single error
    throw new TsRestResponseError(contract, {
      status: 401,
      body: {
        status: "failed",
        message: "Unauthorized",
      },
    });
  }
}

export async function middlewareCustom(request: TsRestRequest): Promise<void> {
  const publicKey = process.env.CLERK_PEM_PUBLIC_KEY as string;
  const tokenSameOrigin = cookie.parse(request.headers.get("cookie") || "")[
    "__session"
  ];
  const tokenCrossOrigin = request.headers
    .get("Authorization")
    ?.split(" ")[1] as string;

  if (!tokenSameOrigin && !tokenCrossOrigin) {
    throw new Error("Unauthorized");
  }

  try {
    let decoded;
    const options = { algorithms: ["RS256"] as Algorithm[] }; // The algorithm used to sign the token. Optional.

    if (tokenSameOrigin) {
      decoded = JwtPayloadSchema.parse(
        jwt.verify(tokenSameOrigin, publicKey, options)
      );
    } else {
      decoded = JwtPayloadSchema.parse(
        jwt.verify(tokenCrossOrigin, publicKey, options)
      );
    }

    // Validate the token's expiration (exp) and not before (nbf) claims
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime || decoded.nbf > currentTime) {
      throw new Error("Unauthorized");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // MUST throw an error to be caught by the error handler as the try body is leveraing the try catch block to throw a single error
    throw new TsRestResponseError(contract, {
      status: 401,
      body: {
        status: "failed",
        message: "Unauthorized",
      },
    });
  }
}

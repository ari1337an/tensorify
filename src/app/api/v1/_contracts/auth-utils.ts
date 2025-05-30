"use server";

import jwt, { Algorithm } from "jsonwebtoken";
import { JwtPayloadSchema } from "./schema";
import * as cookie from "cookie";
import { tsr, TsRestResponse } from "@ts-rest/serverless/next";
import { z } from "zod";
import { format } from "timeago.js";

export const secureByAuthentication = tsr.middleware<{
  decodedJwt: z.infer<typeof JwtPayloadSchema>;
}>(async (request) => {
  const publicKey = process.env.CLERK_PEM_PUBLIC_KEY as string;
  const tokenSameOrigin = cookie.parse(request.headers.get("cookie") || "")[
    "__session"
  ];
  const tokenCrossOrigin = request.headers
    .get("Authorization")
    ?.split(" ")[1] as string;

  if (!tokenSameOrigin && !tokenCrossOrigin) {
    return TsRestResponse.fromJson(
      { message: "Unauthorized: No bearer token or cookie provided!" },
      { status: 401 }
    );
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
      return TsRestResponse.fromJson(
        { message: "Unauthorized: Token expired or not yet valid!" },
        { status: 401 }
      );
    }

    request.decodedJwt = decoded;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return TsRestResponse.fromJson(
        {
          message:
            "Unauthorized: Token expired " +
            format(new Date(error.expiredAt).toISOString()),
        },
        { status: 401 }
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      return TsRestResponse.fromJson(
        { message: "Unauthorized: Invalid token!" },
        { status: 401 }
      );
    } else {
      return TsRestResponse.fromJson(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
  }
});

"use server";

import jwt, { Algorithm } from "jsonwebtoken";
import { JwtPayloadSchema } from "./schema";
import * as cookie from "cookie";
import { tsr, TsRestResponse } from "@ts-rest/serverless/next";
import { z } from "zod";

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
      { message: "Unauthorized" },
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
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    request.decodedJwt = decoded;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // MUST throw an error to be caught by the error handler as the try body is leveraing the try catch block to throw a single error
    return TsRestResponse.fromJson(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
});

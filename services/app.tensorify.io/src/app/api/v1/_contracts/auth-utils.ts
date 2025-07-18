"use server";

import jwt, { JwtHeader } from "jsonwebtoken";
import jwksClient, { SigningKey } from "jwks-rsa";
import { JwtPayloadSchema } from "./schema";
import * as cookie from "cookie";
import { tsr, TsRestResponse } from "@ts-rest/serverless/next";
import { z } from "zod";
import { format } from "timeago.js";

const client = jwksClient({
  jwksUri: process.env.CLERK_JWKS_URL as string,
});

function getKey(
  header: JwtHeader,
  callback: (err: Error | null, key?: string) => void
) {
  client.getSigningKey(
    header.kid,
    function (err: Error | null, key?: SigningKey) {
      if (err) {
        callback(err, undefined);
        return;
      }

      if (key && "publicKey" in key) {
        callback(null, key.publicKey);
      } else if (key && "rsaPublicKey" in key) {
        callback(null, key.rsaPublicKey);
      } else {
        callback(
          new Error("Unsupported key type or key is missing."),
          undefined
        );
      }
    }
  );
}

export const secureByAuthentication = tsr.middleware<{
  decodedJwt: z.infer<typeof JwtPayloadSchema>;
}>(async (request) => {
  const tokenSameOrigin = cookie.parse(request.headers.get("cookie") || "")[
    "__session"
  ];
  const tokenCrossOrigin = request.headers.get("Authorization")?.split(" ")[1];

  const token = tokenSameOrigin || tokenCrossOrigin;

  if (!token) {
    return TsRestResponse.fromJson(
      { message: "Unauthorized: No bearer token or cookie provided!" },
      { status: 401 }
    );
  }

  try {
    const decodedToken = await new Promise<z.infer<typeof JwtPayloadSchema>>(
      (resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
          if (err) {
            return reject(err);
          }
          const parsedPayload = JwtPayloadSchema.safeParse(decoded);
          if (!parsedPayload.success) {
            return reject(new Error("Token payload validation failed"));
          }
          resolve(parsedPayload.data);
        });
      }
    );

    const currentTime = Math.floor(Date.now() / 1000);
    if (
      (decodedToken.exp && decodedToken.exp < currentTime) ||
      (decodedToken.nbf && decodedToken.nbf > currentTime)
    ) {
      return TsRestResponse.fromJson(
        { message: "Unauthorized: Token expired or not yet valid!" },
        { status: 401 }
      );
    }

    request.decodedJwt = decodedToken;
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
      console.error(error);
      return TsRestResponse.fromJson(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
  }
});

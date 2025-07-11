"use server";

import jwt, { JwtHeader } from "jsonwebtoken";
import jwksClient, { SigningKey } from "jwks-rsa";
import { format } from "timeago.js";

type DecodedJwt = jwt.JwtPayload & {
  email: string;
  exp: number;
  firstName: string;
  iat: number;
  id: string;
  imageUrl: string;
  iss: string;
  jti: string;
  lastName: string;
  name: string;
  nbf: number;
  sub: string;
};

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

export const getDecodedJwt = async (token: string) => {
  if (!token) {
    return {
      success: false,
      message: "Unauthorized: No bearer token or cookie provided!",
    };
  }

  try {
    const decodedToken = await new Promise<jwt.JwtPayload>(
      (resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded as jwt.JwtPayload);
        });
      }
    );

    const currentTime = Math.floor(Date.now() / 1000);
    if (
      (decodedToken.exp && decodedToken.exp < currentTime) ||
      (decodedToken.nbf && decodedToken.nbf > currentTime)
    ) {
      return {
        success: false,
        message: "Unauthorized: Token expired or not yet valid!",
      };
    }

    return {
      success: true,
      data: decodedToken as DecodedJwt,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        message: "Unauthorized: Token expired " + format(new Date(error.expiredAt).toISOString()),
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
};
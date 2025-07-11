import { z } from "zod";

export const JwtPayloadSchema = z.object({
  iss: z.string(),
  sub: z.string(),
  aud: z.union([z.string(), z.array(z.string())]),
  exp: z.number(),
  nbf: z.number().optional(),
  iat: z.number(),
  jti: z.string().optional(),
  azp: z.string().optional(),
  // Clerk specific claims
  sid: z.string().optional(),
  org_id: z.string().optional(),
  org_role: z.string().optional(),
  org_slug: z.string().optional(),
  // User metadata
  email: z.string().optional(),
  email_verified: z.boolean().optional(),
  family_name: z.string().optional(),
  given_name: z.string().optional(),
  name: z.string().optional(),
  picture: z.string().optional(),
  username: z.string().optional(),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

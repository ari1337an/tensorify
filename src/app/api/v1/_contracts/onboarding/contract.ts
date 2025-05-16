import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/onboarding/:id",
      pathParams: z.object({
        id: z.coerce.number(),
      }),
      query: z.object({
        foo: z.string(),
        bar: z.number(),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          foo: z.string(),
          bar: z.number(),
          deleteMe: z.string().optional(),
        }),
      },
      metadata: {
        openApiTags: ["test"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Test",
      description: "Test desc",
    },
  },
  {
    strictStatusCodes: true,
  }
);

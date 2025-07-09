import {
  initContract,
  ServerInferRequest,
  ServerInferResponses,
} from "@ts-rest/core";
import { z } from "zod";
import { PluginSlugSchema } from "../schema";

const c = initContract();

export const contract = {
  method: "GET" as const,
  path: "/plugin",
  query: z.object({
    slug: PluginSlugSchema,
  }),
  responses: {
    200: z.object({
      id: z.string(),
      slug: z.string(),
      code: z.string(),
    }),
  },
  summary: "Get plugin code by slug",
};

type ContractRequest = ServerInferRequest<typeof contract>;
type ContractResponse = ServerInferResponses<typeof contract>;

export const action = async ({
  query,
}: ContractRequest): Promise<ContractResponse> => {
  const { slug } = query;

  return {
    status: 200 as const,
    body: { id: "1", slug: slug, code: "console.log('Hello World');" },
  };
};

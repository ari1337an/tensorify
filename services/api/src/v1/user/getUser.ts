import { initContract, ServerInferResponses } from "@ts-rest/core";
import { User } from "../schema";

const c = initContract();

export const contract = {
  method: "GET" as const,
  path: "/user",
  responses: {
    200: User,
  },
  summary: "Get all users",
};

type ContractResponse = ServerInferResponses<typeof contract>;

export const action = async () => {
  return {
    status: 200 as const,
    body: { id: "1", name: "John Doe" },
  };
};

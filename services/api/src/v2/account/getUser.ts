import { initContract, ServerInferResponses } from "@ts-rest/core";
import { User } from "../schema";

const c = initContract();

export const contract = {
  method: "GET" as const,
  path: "/user",
  responses: {
    200: User,
    404: c.type<{ message: string }>(),
  },
  summary: "Get all users (v2 with enhanced error handling)",
};

type ContractResponse = ServerInferResponses<typeof contract>;

export const action = async () => {
  // Enhanced v2 logic with better error handling
  const shouldFail = Math.random() < 0.1; // 10% chance to demonstrate error handling

  if (shouldFail) {
    return {
      status: 404 as const,
      body: { message: "User not found" },
    };
  }

  return {
    status: 200 as const,
    body: { id: "1", name: "John Doe (v2)" },
  };
};

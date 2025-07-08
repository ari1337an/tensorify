import {
  initContract,
  // ServerInferRequest,
  ServerInferResponses,
} from "@ts-rest/core";
import { User } from "../schema";

const c = initContract();

export const contract = c.router({
  contract: {
    method: "GET",
    path: "/user",
    responses: {
      200: User,
    },
    summary: "Get all users",
  },
});

// type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: async (): Promise<ContractResponse> => {
    return {
      status: 200,
      body: { id: "1", name: "John Doe" },
    };
  },
};

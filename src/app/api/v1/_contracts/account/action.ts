import { ServerInferResponses } from "@ts-rest/core";
import { contract } from "./contract";

// type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: async (): Promise<ContractResponse> => {
    return {
      status: 200,
      body: {
        message: "Hello, world!",
      },
    };
  },
};

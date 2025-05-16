import { ServerInferRequest, ServerInferResponses } from "@ts-rest/core";
import { contract } from "./contract";

type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: async ({
    params,
    query,
  }: ContractRequest): Promise<ContractResponse> => {
    return {
      status: 200,
      body: {
        id: params.id,
        foo: query.foo,
        bar: query.bar,
      },
    };
  },
};

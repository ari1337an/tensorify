import {
  createNextHandler,
  TsRestRequest,
  TsRestResponse,
} from "@ts-rest/serverless/next";
import { contract } from "../_contracts";
import { appRouter } from "../_contracts";
import { ZodError } from "zod";

const handler = createNextHandler(contract, appRouter, {
  basePath: "/api/v1",
  jsonQuery: true,
  responseValidation: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorHandler: (error: unknown, request: TsRestRequest) => {
    if (
      (error as { constructor: { name: string } }).constructor.name ==
      "ResponseValidationError"
    ) {
      const validationError = error as { error: ZodError };

      if (validationError.error instanceof ZodError) {
        const errorMessage = validationError.error.issues
          .map(
            (issue) => `${issue.path.join(".") || "field"}: ${issue.message}`
          )
          .join(", ");

        // console.log("\x1b[31m%s\x1b[0m", errorMessage);

        return TsRestResponse.fromJson(
          {
            type: "ResponseValidationError",
            errors: errorMessage,
          },
          { status: 400 }
        );
      }
    }

    return TsRestResponse.fromJson(
      { message: "Internal Server Error." },
      { status: 500 }
    );
  },
  handlerType: "app-router",
});

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
};

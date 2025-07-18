"use server";

import {
  createNextHandler,
  RequestValidationError,
  ResponseValidationError,
  TsRestHttpError,
  TsRestRequest,
  TsRestResponse,
} from "@ts-rest/serverless/next";
import { contract } from "../_contracts";
import { appRouter } from "../_contracts";

const handler = createNextHandler(contract, appRouter, {
  basePath: "/api/v1",
  jsonQuery: true,
  responseValidation: true,
  errorHandler: (error: unknown, request: TsRestRequest) => {
    const debug = false;
    if (debug) {
      console.log(
        "\x1b[31m%s\x1b[0m",
        JSON.stringify({ body: request.body, headers: request.headers, query: request.query }, null, 2)
      );
    }
    if (error instanceof RequestValidationError) {
      const errorMessages: string[] = [];
      if (error.pathParamsError) {
        errorMessages.push(
          ...error.pathParamsError.issues.map(
            (issue) =>
              `Path parameter '${issue.path.join(".") || "unknown"}': ${issue.message}`
          )
        );
      }
      if (error.headersError) {
        errorMessages.push(
          ...error.headersError.issues.map(
            (issue) =>
              `Header '${issue.path.join(".") || "unknown"}': ${issue.message}`
          )
        );
      }
      if (error.queryError) {
        errorMessages.push(
          ...error.queryError.issues.map(
            (issue) =>
              `Query parameter '${issue.path.join(".") || "unknown"}': ${issue.message}`
          )
        );
      }
      if (error.bodyError) {
        errorMessages.push(
          ...error.bodyError.issues.map(
            (issue) =>
              `Body '${issue.path.join(".") || "unknown"}': ${issue.message}`
          )
        );
      }

      const errorMessage = errorMessages.join(", ");
      const responseBody = {
        type: "RequestValidationError",
        message: errorMessage,
      };
      const status = 400;
      if (debug) {
        console.log(
          "\x1b[31m%s\x1b[0m",
          JSON.stringify({ status, body: responseBody }, null, 2)
        );
      }
      return TsRestResponse.fromJson(responseBody, { status });
    } else if (error instanceof ResponseValidationError) {
      const errorMessage = error.error.issues
        .map(
          (issue) =>
            `Response '${issue.path.join(".") || "unknown"}': ${issue.message}`
        )
        .join(", ");
      const responseBody = {
        type: "ResponseValidationError",
        message: errorMessage,
      };
      const status = 500;
      if (debug) {
        console.log(
          "\x1b[31m%s\x1b[0m",
          JSON.stringify({ status, body: responseBody }, null, 2)
        );
      }
      return TsRestResponse.fromJson(responseBody, { status });
    } else if (error instanceof TsRestHttpError) {
      const responseBody = {
        type: "HttpError",
        message: error.message,
      };
      const status = error.statusCode;
      if (debug) {
        console.log(
          "\x1b[31m%s\x1b[0m",
          JSON.stringify({ status, body: responseBody }, null, 2)
        );
      }
      return TsRestResponse.fromJson(responseBody, { status });
    } else {
      const responseBody = {
        type: "InternalServerError",
        message: "Internal Server Error.",
      };
      const status = 500;
      if (debug) {
        console.log(
          "\x1b[31m%s\x1b[0m",
          JSON.stringify({ status, body: responseBody }, null, 2)
        );
        console.error("Unhandled error:", error);
      }
      return TsRestResponse.fromJson(responseBody, { status });
    }
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

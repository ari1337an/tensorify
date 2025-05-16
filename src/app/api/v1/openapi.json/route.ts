import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "../_contracts";
import { SecurityRequirementObject } from "openapi3-ts";

const hasCustomTags = (
  metadata: unknown
): metadata is { openApiTags: string[] } => {
  return (
    !!metadata && typeof metadata === "object" && "openApiTags" in metadata
  );
};

const hasSecurity = (
  metadata: unknown
): metadata is { openApiSecurity: SecurityRequirementObject[] } => {
  return (
    !!metadata && typeof metadata === "object" && "openApiSecurity" in metadata
  );
};

const OpenAPIV1 = generateOpenApi(
  contract,
  {
    info: {
      title: "Tensorify Application API",
      version: "1.0.0",
      description:
        "The official API specification for app.tensorify.io, serving as the single source of truth for all backend services.",
      contact: {
        name: "Tensorify",
        url: "https://app.tensorify.io",
        email: "contact@tensorify.io",
      },
    },
    jsonQuery: true,
    // setOperationId: true,
    servers: [
      {
        url: "/api/v1",
        description: "Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  {
    operationMapper: (operation, appRoute) => ({
      ...operation,
      ...(hasCustomTags(appRoute.metadata)
        ? {
            tags: appRoute.metadata.openApiTags,
          }
        : {}),
      ...(hasSecurity(appRoute.metadata)
        ? {
            security: appRoute.metadata.openApiSecurity,
          }
        : {}),
    }),
  }
);

export async function GET() {
  return Response.json(OpenAPIV1);
}

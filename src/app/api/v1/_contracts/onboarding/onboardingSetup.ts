import {
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { secureByAuthentication } from "../auth-utils";
import { tsr } from "@ts-rest/serverless/next";
import {
  ErrorResponse,
  JwtPayloadSchema,
  OnboardingSetupResponse,
} from "../schema";

import { OnboardingSetupRequest } from "../schema";
import db from "@/server/database/db";
import { Organization, Prisma, Project, Team, Workflow } from "@prisma/client";
extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/onboarding/setup",
      responses: {
        201: OnboardingSetupResponse,
        400: ErrorResponse,
        401: ErrorResponse,
        500: ErrorResponse,
      },
      body: OnboardingSetupRequest,
      metadata: {
        openApiTags: ["Onboarding"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Submit onboarding & provision account",
      description: "Submit onboarding & provision account",
    },
  },
  {
    strictStatusCodes: true,
  }
);

type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    { decodedJwt: z.infer<typeof JwtPayloadSchema> },
    Record<string, never>
  >({
    middleware: [secureByAuthentication],
    handler: async (
      { body }: ContractRequest,
      { request }
    ): Promise<ContractResponse> => {
      try {
        const userId = request.decodedJwt.id;
        const firstName = request.decodedJwt.firstName;
        const lastName = request.decodedJwt.lastName;
        const email = request.decodedJwt.email;
        const imageUrl = request.decodedJwt.imageUrl;
        const orgName = body.orgName;
        const orgUrl = body.orgUrl;

        let user = null;
        let alreadyOrgExists = null;
        let organization = null;
        let team = null;
        let project = null;
        let workflow = null;

        await db.$transaction(
          async (tx) => {
            user = await tx.user.upsert({
              where: { id: userId },
              update: { firstName, lastName, email, imageUrl },
              create: { id: userId, firstName, lastName, email, imageUrl },
            });

            alreadyOrgExists = await tx.organization.findUnique({
              where: { slug: orgUrl },
            });

            if (alreadyOrgExists) {
              throw new TsRestResponseError(contract, {
                status: 400,
                body: {
                  status: "failed",
                  message: "Organization already exists",
                },
              });
            }

            organization = await tx.organization.create({
              data: {
                slug: orgUrl,
                name: orgName,
                createdBy: {
                  connect: {
                    id: user.id,
                  },
                },
              },
            });

            team = await tx.team.create({
              data: {
                name: `${firstName.split(" ")[0]}'s Team`,
                org: {
                  connect: {
                    id: organization.id,
                  },
                },
              },
            });

            project = await tx.project.create({
              data: {
                name: `${firstName.split(" ")[0]}'s Project`,
                team: {
                  connect: {
                    id: team.id,
                  },
                },
              },
            });

            workflow = await tx.workflow.create({
              data: {
                name: `${firstName.split(" ")[0]}'s Workflow`,
                project: {
                  connect: {
                    id: project.id,
                  },
                },
              },
            });
          },
          {
            timeout: 15000,
            maxWait: 15000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          }
        );

        if (!organization || !team || !project || !workflow || !user) {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: {
              status: "failed",
              message: "Internal server error",
            },
          });
        }

        return {
          status: 201,
          body: {
            orgId: (organization as Organization).id,
            teamId: (team as Team).id,
            projectId: (project as Project).id,
            workflowId: (workflow as Workflow).id,
            orgName: (organization as Organization).name,
            orgUrl: (organization as Organization).slug,
          },
        };
      } catch (err: unknown) {
        console.error(err);
        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Internal server error",
          },
        });
      }
    },
  }),
};

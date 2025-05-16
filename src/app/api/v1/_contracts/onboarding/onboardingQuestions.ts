import { initContract } from "@ts-rest/core";
import { ServerInferResponses, TsRestResponseError } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import {
  ErrorResponse,
  OnboardingVersion,
  OnboardingQuestion,
  OnboardingOption,
} from "../schema";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/onboarding/questions",
      responses: {
        200: OnboardingVersion,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Onboarding"],
      },
      summary: "Retrieve onboarding questions",
      description: "Retrieve onboarding questions",
    },
  },
  {
    strictStatusCodes: true,
  }
);

type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: async (): Promise<ContractResponse> => {
    "use server";
    const response = await fetch(
      `https://controls.tensorify.io/api/onboarding?tag=${process.env.NEXT_PUBLIC_ONBOARDING_TAG}`,
      {
        cache: "force-cache",
      }
    );
    if (!response.ok) {
      throw new TsRestResponseError(contract, {
        status: 500,
        body: {
          status: "failed",
          message: "Failed to fetch onboarding questions.",
        },
      });
    }
    const data = await response.json();
    if (data.version.tag !== process.env.NEXT_PUBLIC_ONBOARDING_TAG) {
      throw new TsRestResponseError(contract, {
        status: 500,
        body: {
          status: "failed",
          message: "Invalid onboarding tag.",
        },
      });
    }
    const result = {
      id: data.version.id,
      tag: data.version.tag,
      title: data.version.title,
      description: data.version.description,
      status: data.version.status,
      createdAt: data.version.createdAt,
      publishedAt: data.version.publishedAt,
      questions: data.version.questions.map(
        (question: z.infer<typeof OnboardingQuestion>) => ({
          id: question.id,
          versionId: question.versionId,
          slug: question.slug,
          type: question.type,
          title: question.title,
          iconSlug: question.iconSlug,
          isActive: question.isActive,
          sortOrder: question.sortOrder,
          allowOtherOption: question.allowOtherOption,
          createdAt: question.createdAt,
          options: question.options.map(
            (option: z.infer<typeof OnboardingOption>) => ({
              id: option.id,
              questionId: option.questionId,
              value: option.value,
              label: option.label,
              iconSlug: option.iconSlug,
              sortOrder: option.sortOrder,
            })
          ),
        })
      ),
    };
    return {
      status: 200,
      body: result,
    };
  },
};

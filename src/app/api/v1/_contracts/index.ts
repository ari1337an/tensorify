// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated on: 5/26/2025, 10:20:00 PM

import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";
import { JwtPayloadSchema } from "./schema";
import { z } from "zod";

import { contract as getaccountuseridContract, action as getaccountuseridAction } from "./account/getaccountuserid";
import { contract as onboardingQuestionsContract, action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";
import { contract as onboardingSetupContract, action as onboardingSetupAction } from "./onboarding/onboardingSetup";

const c = initContract();

export const contract = c.router({
  getaccountuserid: getaccountuseridContract,
  onboardingQuestions: onboardingQuestionsContract,
  onboardingSetup: onboardingSetupContract,
});

export const appRouter = tsr.routerWithMiddleware(contract)<{
  decodedJwt: z.infer<typeof JwtPayloadSchema>;
}>({
  getaccountuserid: getaccountuseridAction,
  onboardingQuestions: onboardingQuestionsAction,
  onboardingSetup: onboardingSetupAction,
});

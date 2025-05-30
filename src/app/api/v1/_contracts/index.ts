// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated on: 5/31/2025, 12:55:40 AM

import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";
import { JwtPayloadSchema } from "./schema";
import { z } from "zod";

import { contract as onboardingQuestionsContract, action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";
import { contract as onboardingSetupContract, action as onboardingSetupAction } from "./onboarding/onboardingSetup";
import { contract as getOrganizationContract, action as getOrganizationAction } from "./organization/getOrganization";
import { contract as getAccountUserIdContract, action as getAccountUserIdAction } from "./account/getAccountUserId";
import { contract as getTestJwtContract, action as getTestJwtAction } from "./account/getTestJwt";
import { contract as patchAccountContract, action as patchAccountAction } from "./account/patchAccount";
import { contract as uploadPortraitContract, action as uploadPortraitAction } from "./account/uploadPortrait";

const c = initContract();

export const contract = c.router({
  onboardingQuestions: onboardingQuestionsContract,
  onboardingSetup: onboardingSetupContract,
  getOrganization: getOrganizationContract,
  getAccountUserId: getAccountUserIdContract,
  getTestJwt: getTestJwtContract,
  patchAccount: patchAccountContract,
  uploadPortrait: uploadPortraitContract,
});

export const appRouter = tsr.routerWithMiddleware(contract)<{
  decodedJwt: z.infer<typeof JwtPayloadSchema>;
}>({
  onboardingQuestions: onboardingQuestionsAction,
  onboardingSetup: onboardingSetupAction,
  getOrganization: getOrganizationAction,
  getAccountUserId: getAccountUserIdAction,
  getTestJwt: getTestJwtAction,
  patchAccount: patchAccountAction,
  uploadPortrait: uploadPortraitAction,
});

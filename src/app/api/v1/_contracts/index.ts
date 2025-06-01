// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated on: 6/1/2025, 2:17:34 PM

import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";
import { JwtPayloadSchema } from "./schema";
import { z } from "zod";

import { contract as getAccountUserIdContract, action as getAccountUserIdAction } from "./account/getAccountUserId";
import { contract as getTestJwtContract, action as getTestJwtAction } from "./account/getTestJwt";
import { contract as patchAccountContract, action as patchAccountAction } from "./account/patchAccount";
import { contract as uploadPortraitContract, action as uploadPortraitAction } from "./account/uploadPortrait";
import { contract as onboardingQuestionsContract, action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";
import { contract as onboardingSetupContract, action as onboardingSetupAction } from "./onboarding/onboardingSetup";
import { contract as getOrganizationContract, action as getOrganizationAction } from "./organization/getOrganization";
import { contract as getPermissionsContract, action as getPermissionsAction } from "./permissions/getPermissions";
import { contract as postRolesContract, action as postRolesAction } from "./roles/postRoles";

const c = initContract();

export const contract = c.router({
  getAccountUserId: getAccountUserIdContract,
  getTestJwt: getTestJwtContract,
  patchAccount: patchAccountContract,
  uploadPortrait: uploadPortraitContract,
  onboardingQuestions: onboardingQuestionsContract,
  onboardingSetup: onboardingSetupContract,
  getOrganization: getOrganizationContract,
  getPermissions: getPermissionsContract,
  postRoles: postRolesContract,
});

export const appRouter = tsr.routerWithMiddleware(contract)<{
  decodedJwt: z.infer<typeof JwtPayloadSchema>;
}>({
  getAccountUserId: getAccountUserIdAction,
  getTestJwt: getTestJwtAction,
  patchAccount: patchAccountAction,
  uploadPortrait: uploadPortraitAction,
  onboardingQuestions: onboardingQuestionsAction,
  onboardingSetup: onboardingSetupAction,
  getOrganization: getOrganizationAction,
  getPermissions: getPermissionsAction,
  postRoles: postRolesAction,
});

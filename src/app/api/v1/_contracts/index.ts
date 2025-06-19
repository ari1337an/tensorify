// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated on: 6/19/2025, 8:26:57 PM

import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";
import { JwtPayloadSchema } from "./schema";
import { z } from "zod";

import { contract as getAccountUserIdContract, action as getAccountUserIdAction } from "./account/getAccountUserId";
import { contract as patchAccountContract, action as patchAccountAction } from "./account/patchAccount";
import { contract as uploadPortraitContract, action as uploadPortraitAction } from "./account/uploadPortrait";
import { contract as onboardingQuestionsContract, action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";
import { contract as onboardingSetupContract, action as onboardingSetupAction } from "./onboarding/onboardingSetup";
import { contract as getOrganizationContract, action as getOrganizationAction } from "./organization/getOrganization";
import { contract as getOrganizationUsersContract, action as getOrganizationUsersAction } from "./organization/getOrganizationUsers";
import { contract as getPermissionsContract, action as getPermissionsAction } from "./permissions/getPermissions";
import { contract as getRolesContract, action as getRolesAction } from "./roles/getRoles";
import { contract as patchRoleContract, action as patchRoleAction } from "./roles/patchRole";
import { contract as postRolesContract, action as postRolesAction } from "./roles/postRoles";
import { contract as getTeamContract, action as getTeamAction } from "./team/getTeam";
import { contract as postTeamContract, action as postTeamAction } from "./team/postTeam";
import { contract as getProjectContract, action as getProjectAction } from "./project/getProject";
import { contract as postProjectContract, action as postProjectAction } from "./project/postProject";
import { contract as getUserRoleContract, action as getUserRoleAction } from "./user-roles/getUserRole";
import { contract as postUserRoleContract, action as postUserRoleAction } from "./user-roles/postUserRole";

const c = initContract();

export const contract = c.router({
  getAccountUserId: getAccountUserIdContract,
  patchAccount: patchAccountContract,
  uploadPortrait: uploadPortraitContract,
  onboardingQuestions: onboardingQuestionsContract,
  onboardingSetup: onboardingSetupContract,
  getOrganization: getOrganizationContract,
  getOrganizationUsers: getOrganizationUsersContract,
  getPermissions: getPermissionsContract,
  getRoles: getRolesContract,
  patchRole: patchRoleContract,
  postRoles: postRolesContract,
  getTeam: getTeamContract,
  postTeam: postTeamContract,
  getProject: getProjectContract,
  postProject: postProjectContract,
  getUserRole: getUserRoleContract,
  postUserRole: postUserRoleContract,
});

export const appRouter = tsr.routerWithMiddleware(contract)<{
  decodedJwt: z.infer<typeof JwtPayloadSchema>;
}>({
  getAccountUserId: getAccountUserIdAction,
  patchAccount: patchAccountAction,
  uploadPortrait: uploadPortraitAction,
  onboardingQuestions: onboardingQuestionsAction,
  onboardingSetup: onboardingSetupAction,
  getOrganization: getOrganizationAction,
  getOrganizationUsers: getOrganizationUsersAction,
  getPermissions: getPermissionsAction,
  getRoles: getRolesAction,
  patchRole: patchRoleAction,
  postRoles: postRolesAction,
  getTeam: getTeamAction,
  postTeam: postTeamAction,
  getProject: getProjectAction,
  postProject: postProjectAction,
  getUserRole: getUserRoleAction,
  postUserRole: postUserRoleAction,
});

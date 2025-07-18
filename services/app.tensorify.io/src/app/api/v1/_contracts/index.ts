import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";
import { JwtPayloadSchema } from "./schema";
import { z } from "zod";

import { contract as getAccountUserIdContract, action as getAccountUserIdAction } from "./account/getAccountUserId";
import { contract as patchAccountContract, action as patchAccountAction } from "./account/patchAccount";
import { contract as uploadPortraitContract, action as uploadPortraitAction } from "./account/uploadPortrait";
import { contract as getOrganizationContract, action as getOrganizationAction } from "./organization/getOrganization";
import { contract as getOrganizationUsersContract, action as getOrganizationUsersAction } from "./organization/getOrganizationUsers";
import { contract as onboardingQuestionsContract, action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";
import { contract as onboardingSetupContract, action as onboardingSetupAction } from "./onboarding/onboardingSetup";
import { contract as getProjectContract, action as getProjectAction } from "./project/getProject";
import { contract as postProjectContract, action as postProjectAction } from "./project/postProject";
import { contract as getPermissionsContract, action as getPermissionsAction } from "./permissions/getPermissions";
import { contract as getRolesContract, action as getRolesAction } from "./roles/getRoles";
import { contract as patchRoleContract, action as patchRoleAction } from "./roles/patchRole";
import { contract as postRolesContract, action as postRolesAction } from "./roles/postRoles";
import { contract as getTeamContract, action as getTeamAction } from "./team/getTeam";
import { contract as postTeamContract, action as postTeamAction } from "./team/postTeam";
import { contract as getUserRoleContract, action as getUserRoleAction } from "./user-roles/getUserRole";
import { contract as postUserRoleContract, action as postUserRoleAction } from "./user-roles/postUserRole";
import { contract as getWorkflowContract, action as getWorkflowAction } from "./workflow/getWorkflow";
import { contract as getWorkflowPluginsContract, action as getWorkflowPluginsAction } from "./workflow/getWorkflowPlugins";
import { contract as postWorkflowContract, action as postWorkflowAction } from "./workflow/postWorkflow";
import { contract as postWorkflowPluginContract, action as postWorkflowPluginAction } from "./workflow/postWorkflowPlugin";
import { contract as postWorkflowVersionContract, action as postWorkflowVersionAction } from "./workflow/postWorkflowVersion";

const c = initContract();

export const contract = c.router({
  getAccountUserId: getAccountUserIdContract,
  patchAccount: patchAccountContract,
  uploadPortrait: uploadPortraitContract,
  getOrganization: getOrganizationContract,
  getOrganizationUsers: getOrganizationUsersContract,
  onboardingQuestions: onboardingQuestionsContract,
  onboardingSetup: onboardingSetupContract,
  getProject: getProjectContract,
  postProject: postProjectContract,
  getPermissions: getPermissionsContract,
  getRoles: getRolesContract,
  patchRole: patchRoleContract,
  postRoles: postRolesContract,
  getTeam: getTeamContract,
  postTeam: postTeamContract,
  getUserRole: getUserRoleContract,
  postUserRole: postUserRoleContract,
  getWorkflow: getWorkflowContract,
  getWorkflowPlugins: getWorkflowPluginsContract,
  postWorkflow: postWorkflowContract,
  postWorkflowPlugin: postWorkflowPluginContract,
  postWorkflowVersion: postWorkflowVersionContract,
});

export const appRouter = tsr.routerWithMiddleware(contract)<{
  decodedJwt: z.infer<typeof JwtPayloadSchema>;
}>({
  getAccountUserId: getAccountUserIdAction,
  patchAccount: patchAccountAction,
  uploadPortrait: uploadPortraitAction,
  getOrganization: getOrganizationAction,
  getOrganizationUsers: getOrganizationUsersAction,
  onboardingQuestions: onboardingQuestionsAction,
  onboardingSetup: onboardingSetupAction,
  getProject: getProjectAction,
  postProject: postProjectAction,
  getPermissions: getPermissionsAction,
  getRoles: getRolesAction,
  patchRole: patchRoleAction,
  postRoles: postRolesAction,
  getTeam: getTeamAction,
  postTeam: postTeamAction,
  getUserRole: getUserRoleAction,
  postUserRole: postUserRoleAction,
  getWorkflow: getWorkflowAction,
  getWorkflowPlugins: getWorkflowPluginsAction,
  postWorkflow: postWorkflowAction,
  postWorkflowPlugin: postWorkflowPluginAction,
  postWorkflowVersion: postWorkflowVersionAction,
});

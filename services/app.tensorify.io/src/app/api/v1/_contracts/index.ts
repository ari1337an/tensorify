import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";
import { JwtPayloadSchema } from "./schema";
import { z } from "zod";

import { contract as getaccountuseridContract, action as getaccountuseridAction } from "./account/getaccountuserid";
import { contract as patchAccountContract, action as patchAccountAction } from "./account/patchAccount";
import { contract as uploadPortraitContract, action as uploadPortraitAction } from "./account/uploadPortrait";
import { contract as getPermissionsContract, action as getPermissionsAction } from "./permissions/getPermissions";
import { contract as onboardingQuestionsContract, action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";
import { contract as onboardingSetupContract, action as onboardingSetupAction } from "./onboarding/onboardingSetup";
import { contract as getOrganizationContract, action as getOrganizationAction } from "./organization/getOrganization";
import { contract as getOrganizationUsersContract, action as getOrganizationUsersAction } from "./organization/getOrganizationUsers";
import { contract as getProjectContract, action as getProjectAction } from "./project/getProject";
import { contract as postProjectContract, action as postProjectAction } from "./project/postProject";
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
  getaccountuserid: getaccountuseridContract,
  patchAccount: patchAccountContract,
  uploadPortrait: uploadPortraitContract,
  getPermissions: getPermissionsContract,
  onboardingQuestions: onboardingQuestionsContract,
  onboardingSetup: onboardingSetupContract,
  getOrganization: getOrganizationContract,
  getOrganizationUsers: getOrganizationUsersContract,
  getProject: getProjectContract,
  postProject: postProjectContract,
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
  getaccountuserid: getaccountuseridAction,
  patchAccount: patchAccountAction,
  uploadPortrait: uploadPortraitAction,
  getPermissions: getPermissionsAction,
  onboardingQuestions: onboardingQuestionsAction,
  onboardingSetup: onboardingSetupAction,
  getOrganization: getOrganizationAction,
  getOrganizationUsers: getOrganizationUsersAction,
  getProject: getProjectAction,
  postProject: postProjectAction,
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

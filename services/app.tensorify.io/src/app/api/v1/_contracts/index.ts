import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";
import { JwtPayloadSchema } from "./schema";
import { z } from "zod";

import { contract as deleteWorkflowPluginContract, action as deleteWorkflowPluginAction } from "./workflow/deleteWorkflowPlugin";
import { contract as getOrganizationContract, action as getOrganizationAction } from "./organization/getOrganization";
import { contract as getOrganizationUsersContract, action as getOrganizationUsersAction } from "./organization/getOrganizationUsers";
import { contract as getPermissionsContract, action as getPermissionsAction } from "./permissions/getPermissions";
import { contract as getProjectContract, action as getProjectAction } from "./project/getProject";
import { contract as getRolesContract, action as getRolesAction } from "./roles/getRoles";
import { contract as getTeamContract, action as getTeamAction } from "./team/getTeam";
import { contract as getUserRoleContract, action as getUserRoleAction } from "./user-roles/getUserRole";
import { contract as getWorkflowContract, action as getWorkflowAction } from "./workflow/getWorkflow";
import { contract as getWorkflowPluginsContract, action as getWorkflowPluginsAction } from "./workflow/getWorkflowPlugins";
import { contract as getaccountuseridContract, action as getaccountuseridAction } from "./account/getaccountuserid";
import { contract as onboardingQuestionsContract, action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";
import { contract as onboardingSetupContract, action as onboardingSetupAction } from "./onboarding/onboardingSetup";
import { contract as patchAccountContract, action as patchAccountAction } from "./account/patchAccount";
import { contract as patchRoleContract, action as patchRoleAction } from "./roles/patchRole";
import { contract as patchWorkflowVersionCodeContract, action as patchWorkflowVersionCodeAction } from "./workflow/patchWorkflowVersionCode";
import { contract as postProjectContract, action as postProjectAction } from "./project/postProject";
import { contract as postRolesContract, action as postRolesAction } from "./roles/postRoles";
import { contract as postTeamContract, action as postTeamAction } from "./team/postTeam";
import { contract as postUserRoleContract, action as postUserRoleAction } from "./user-roles/postUserRole";
import { contract as postWorkflowContract, action as postWorkflowAction } from "./workflow/postWorkflow";
import { contract as postWorkflowPluginContract, action as postWorkflowPluginAction } from "./workflow/postWorkflowPlugin";
import { contract as postWorkflowVersionContract, action as postWorkflowVersionAction } from "./workflow/postWorkflowVersion";
import { contract as putWorkflowPluginContract, action as putWorkflowPluginAction } from "./workflow/putWorkflowPlugin";
import { contract as putWorkflowPluginManifestContract, action as putWorkflowPluginManifestAction } from "./workflow/putWorkflowPluginManifest";
import { contract as resetWorkflowPluginManifestContract, action as resetWorkflowPluginManifestAction } from "./workflow/resetWorkflowPluginManifest";
import { contract as uploadPortraitContract, action as uploadPortraitAction } from "./account/uploadPortrait";

const c = initContract();

export const contract = c.router({
  deleteWorkflowPlugin: deleteWorkflowPluginContract,
  getOrganization: getOrganizationContract,
  getOrganizationUsers: getOrganizationUsersContract,
  getPermissions: getPermissionsContract,
  getProject: getProjectContract,
  getRoles: getRolesContract,
  getTeam: getTeamContract,
  getUserRole: getUserRoleContract,
  getWorkflow: getWorkflowContract,
  getWorkflowPlugins: getWorkflowPluginsContract,
  getaccountuserid: getaccountuseridContract,
  onboardingQuestions: onboardingQuestionsContract,
  onboardingSetup: onboardingSetupContract,
  patchAccount: patchAccountContract,
  patchRole: patchRoleContract,
  patchWorkflowVersionCode: patchWorkflowVersionCodeContract,
  postProject: postProjectContract,
  postRoles: postRolesContract,
  postTeam: postTeamContract,
  postUserRole: postUserRoleContract,
  postWorkflow: postWorkflowContract,
  postWorkflowPlugin: postWorkflowPluginContract,
  postWorkflowVersion: postWorkflowVersionContract,
  putWorkflowPlugin: putWorkflowPluginContract,
  putWorkflowPluginManifest: putWorkflowPluginManifestContract,
  resetWorkflowPluginManifest: resetWorkflowPluginManifestContract,
  uploadPortrait: uploadPortraitContract,
});

export const appRouter = tsr.routerWithMiddleware(contract)<{
  decodedJwt: z.infer<typeof JwtPayloadSchema>;
}>({
  deleteWorkflowPlugin: deleteWorkflowPluginAction,
  getOrganization: getOrganizationAction,
  getOrganizationUsers: getOrganizationUsersAction,
  getPermissions: getPermissionsAction,
  getProject: getProjectAction,
  getRoles: getRolesAction,
  getTeam: getTeamAction,
  getUserRole: getUserRoleAction,
  getWorkflow: getWorkflowAction,
  getWorkflowPlugins: getWorkflowPluginsAction,
  getaccountuserid: getaccountuseridAction,
  onboardingQuestions: onboardingQuestionsAction,
  onboardingSetup: onboardingSetupAction,
  patchAccount: patchAccountAction,
  patchRole: patchRoleAction,
  patchWorkflowVersionCode: patchWorkflowVersionCodeAction,
  postProject: postProjectAction,
  postRoles: postRolesAction,
  postTeam: postTeamAction,
  postUserRole: postUserRoleAction,
  postWorkflow: postWorkflowAction,
  postWorkflowPlugin: postWorkflowPluginAction,
  postWorkflowVersion: postWorkflowVersionAction,
  putWorkflowPlugin: putWorkflowPluginAction,
  putWorkflowPluginManifest: putWorkflowPluginManifestAction,
  resetWorkflowPluginManifest: resetWorkflowPluginManifestAction,
  uploadPortrait: uploadPortraitAction,
});

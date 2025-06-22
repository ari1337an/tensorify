"use server";

import { initClient } from '@ts-rest/core';
import { contract } from '../_contracts';
import version from '../_contracts/version.json';
import { auth } from '@clerk/nextjs/server';

// Initialize client without baseUrl (or with a default)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = initClient(contract, {
  baseUrl: '', // Will override in each server action
  baseHeaders: {},
  credentials: "include",
});

// Function to get baseUrl dynamically
const getBaseUrl = () => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  if (process.env.NODE_ENV === "production") {
    return `${protocol}://app.tensorify.io/api/${version.apiVersion}`;
  } else {
    const port = process.env.PORT || "3000";
    return `${protocol}://localhost:${port}/api/${version.apiVersion}`;
  }
};

// Helper to create a client with dynamic baseUrl
const getClientWithBaseUrl = async () => {
  const {getToken} = await auth();
  const token = await getToken();
  return initClient(contract, {
    baseUrl: getBaseUrl(),
    baseHeaders: {
      authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
};

/**
 * ------------------------------------------------------------------------------------------------
 * HOW TO USE THE CLIENT
 * ------------------------------------------------------------------------------------------------
 * 
 * Import whatever the function you want to call and 
 * they will give out the proper API response in terms of 
 * the type of the response return and the arguments to 
 * pass in are also fully typed as we are using TS-REST.
 * 
 * The functions are server actions and can be called from the client side.
 * 
 * ------------------------------------------------------------------------------------------------
 * EXAMPLES
 * ------------------------------------------------------------------------------------------------
 * 
 * ### Example 1: For GET requests where no body is required:
 * 
 * In client side or server side:
 * 
 * ```ts
 * // As there is no body required, we pass an empty object. If we don't pass empty object, it will throw an error.
 * const response = await onboardingQuestions({}); 
 * if(response.status === 200){
 *  const questions = response.body; // This is the data that the API returns
 * } else {
 *  const error = response.body; // This is the error that the API returns
 * }
 * ```
 * 
 * Even if there is error, it is still typed properly.
 * 
 * ### Example 2: For POST requests where body is required:
 * 
 * In client side or server side:
 * 
 * ```ts
 * const response = await onboardingSetup({
 *  body: {
 *    name: "123",
 *    resourceType: "ORGANIZATION",
 *    resourceId: "123",
 *    permissions: [
 *      {
 *        type: "ALLOW",
 *        permissionId: "123",
 *      },
 *    ],
 *    description: "123",
 *  },
 * });
 * ```
 * 
 * The response will be a 201 Created response with the data that the API returns.
 * 
 * The body that needs to be send has type:
 * ```ts
 * { 
 *  name: string; 
 *  resourceType: "ORGANIZATION" | "TEAM" | "PROJECT" | "WORKFLOW"; 
 *  resourceId: string;
 *  permissions: {
 *    type: "ALLOW" | "DENY";
 *    permissionId: string;
 *  }[];
 *  description?: string | undefined;
 * }
 * ```
 * 
 * ```ts
 * if(response.status === 201){
 *  const setup = response.body; // This is the data that the API returns
 * } else {
 *  const error = response.body; // This is the error that the API returns
 * }
 * ```
 * 
 * Even if there is error, it is still typed properly.
 */

export async function getAccountUserId(args: Parameters<typeof client.getAccountUserId.contract>[0]): Promise<ReturnType<typeof client.getAccountUserId.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.getAccountUserId.contract(args);
}


export async function patchAccount(args: Parameters<typeof client.patchAccount.contract>[0]): Promise<ReturnType<typeof client.patchAccount.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.patchAccount.contract(args);
}


export async function uploadPortrait(args: Parameters<typeof client.uploadPortrait.contract>[0]): Promise<ReturnType<typeof client.uploadPortrait.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.uploadPortrait.contract(args);
}


export async function onboardingQuestions(args: Parameters<typeof client.onboardingQuestions.contract>[0]): Promise<ReturnType<typeof client.onboardingQuestions.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.onboardingQuestions.contract(args);
}


export async function onboardingSetup(args: Parameters<typeof client.onboardingSetup.contract>[0]): Promise<ReturnType<typeof client.onboardingSetup.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.onboardingSetup.contract(args);
}


export async function getPermissions(args: Parameters<typeof client.getPermissions.contract>[0]): Promise<ReturnType<typeof client.getPermissions.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.getPermissions.contract(args);
}


export async function getProject(args: Parameters<typeof client.getProject.contract>[0]): Promise<ReturnType<typeof client.getProject.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.getProject.contract(args);
}


export async function postProject(args: Parameters<typeof client.postProject.contract>[0]): Promise<ReturnType<typeof client.postProject.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.postProject.contract(args);
}


export async function getOrganization(args: Parameters<typeof client.getOrganization.contract>[0]): Promise<ReturnType<typeof client.getOrganization.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.getOrganization.contract(args);
}


export async function getOrganizationUsers(args: Parameters<typeof client.getOrganizationUsers.contract>[0]): Promise<ReturnType<typeof client.getOrganizationUsers.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.getOrganizationUsers.contract(args);
}


export async function getRoles(args: Parameters<typeof client.getRoles.contract>[0]): Promise<ReturnType<typeof client.getRoles.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.getRoles.contract(args);
}


export async function patchRole(args: Parameters<typeof client.patchRole.contract>[0]): Promise<ReturnType<typeof client.patchRole.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.patchRole.contract(args);
}


export async function postRoles(args: Parameters<typeof client.postRoles.contract>[0]): Promise<ReturnType<typeof client.postRoles.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.postRoles.contract(args);
}


export async function getTeam(args: Parameters<typeof client.getTeam.contract>[0]): Promise<ReturnType<typeof client.getTeam.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.getTeam.contract(args);
}


export async function postTeam(args: Parameters<typeof client.postTeam.contract>[0]): Promise<ReturnType<typeof client.postTeam.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.postTeam.contract(args);
}


export async function getUserRole(args: Parameters<typeof client.getUserRole.contract>[0]): Promise<ReturnType<typeof client.getUserRole.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.getUserRole.contract(args);
}


export async function postUserRole(args: Parameters<typeof client.postUserRole.contract>[0]): Promise<ReturnType<typeof client.postUserRole.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.postUserRole.contract(args);
}


export async function getWorkflow(args: Parameters<typeof client.getWorkflow.contract>[0]): Promise<ReturnType<typeof client.getWorkflow.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.getWorkflow.contract(args);
}


export async function postWorkflow(args: Parameters<typeof client.postWorkflow.contract>[0]): Promise<ReturnType<typeof client.postWorkflow.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.postWorkflow.contract(args);
}


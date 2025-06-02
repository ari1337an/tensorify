// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated on: 6/2/2025, 2:26:42 PM
"use server";

import { initClient } from '@ts-rest/core';
import { contract } from '../_contracts';

const client = initClient(contract, {
  baseUrl: 'http://localhost:3000/api/v1',
  baseHeaders: {},
  credentials: "include",
});

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
  return await client.getAccountUserId.contract(args);
}


export async function patchAccount(args: Parameters<typeof client.patchAccount.contract>[0]): Promise<ReturnType<typeof client.patchAccount.contract>> {
  return await client.patchAccount.contract(args);
}


export async function uploadPortrait(args: Parameters<typeof client.uploadPortrait.contract>[0]): Promise<ReturnType<typeof client.uploadPortrait.contract>> {
  return await client.uploadPortrait.contract(args);
}


export async function onboardingQuestions(args: Parameters<typeof client.onboardingQuestions.contract>[0]): Promise<ReturnType<typeof client.onboardingQuestions.contract>> {
  return await client.onboardingQuestions.contract(args);
}


export async function onboardingSetup(args: Parameters<typeof client.onboardingSetup.contract>[0]): Promise<ReturnType<typeof client.onboardingSetup.contract>> {
  return await client.onboardingSetup.contract(args);
}


export async function getOrganization(args: Parameters<typeof client.getOrganization.contract>[0]): Promise<ReturnType<typeof client.getOrganization.contract>> {
  return await client.getOrganization.contract(args);
}


export async function getRoles(args: Parameters<typeof client.getRoles.contract>[0]): Promise<ReturnType<typeof client.getRoles.contract>> {
  return await client.getRoles.contract(args);
}


export async function patchRole(args: Parameters<typeof client.patchRole.contract>[0]): Promise<ReturnType<typeof client.patchRole.contract>> {
  return await client.patchRole.contract(args);
}


export async function postRoles(args: Parameters<typeof client.postRoles.contract>[0]): Promise<ReturnType<typeof client.postRoles.contract>> {
  return await client.postRoles.contract(args);
}


export async function getPermissions(args: Parameters<typeof client.getPermissions.contract>[0]): Promise<ReturnType<typeof client.getPermissions.contract>> {
  return await client.getPermissions.contract(args);
}


export async function getUserRole(args: Parameters<typeof client.getUserRole.contract>[0]): Promise<ReturnType<typeof client.getUserRole.contract>> {
  return await client.getUserRole.contract(args);
}


export async function postUserRole(args: Parameters<typeof client.postUserRole.contract>[0]): Promise<ReturnType<typeof client.postUserRole.contract>> {
  return await client.postUserRole.contract(args);
}


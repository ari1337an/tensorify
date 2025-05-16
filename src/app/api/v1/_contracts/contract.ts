import { initContract } from "@ts-rest/core";
import { contract as onboardingContract } from "./onboarding/contract";
import { contract as accountContract } from "./account/contract";
const c = initContract();

export const contract = c.router({
  onboarding: onboardingContract,
  account: accountContract,
});

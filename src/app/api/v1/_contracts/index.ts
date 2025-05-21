// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated on: 5/20/2025, 2:06:51 PM

import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";

import { contract as accountContract, action as accountAction } from "./account/account";
import { contract as onboardingQuestionsContract, action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";
import { contract as onboardingSetupContract, action as onboardingSetupAction } from "./onboarding/onboardingSetup";

const c = initContract();

export const contract = c.router({
  account: accountContract,
  onboardingQuestions: onboardingQuestionsContract,
  onboardingSetup: onboardingSetupContract,
});

export const appRouter = tsr.router(contract, {
  account: accountAction,
  onboardingQuestions: onboardingQuestionsAction,
  onboardingSetup: onboardingSetupAction,
});

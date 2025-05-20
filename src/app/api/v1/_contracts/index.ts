// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated on: 5/20/2025, 7:00:44 AM

import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";

import { contract as accountContract, action as accountAction } from "./account/account";
import { contract as onboardingQuestionsContract, action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";

const c = initContract();

export const contract = c.router({
  account: accountContract,
  onboardingQuestions: onboardingQuestionsContract,
});

export const appRouter = tsr.router(contract, {
  account: accountAction,
  onboardingQuestions: onboardingQuestionsAction,
});

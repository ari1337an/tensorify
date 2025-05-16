import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";

// contracts
import { contract as onboardingQuestionsContract } from "./onboarding/onboardingQuestions";
import { contract as accountContract } from "./account/contract";

// actions
import { action as onboardingQuestionsAction } from "./onboarding/onboardingQuestions";
import { action as accountAction } from "./account/action";

const c = initContract();

// contract
export const contract = c.router({
  onboardingQuestions: onboardingQuestionsContract,
  account: accountContract,
});

// router
export const appRouter = tsr.router(contract, {
  onboardingQuestions: onboardingQuestionsAction,
  account: accountAction,
});

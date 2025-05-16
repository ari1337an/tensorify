import { contract } from './contract';
import { action as onboardingRouter } from './onboarding/action';
import { action as accountRouter } from './account/action';
import { tsr } from '@ts-rest/serverless/next';

export const appRouter = tsr.router(contract, {
  onboarding: onboardingRouter,
  account: accountRouter,
});

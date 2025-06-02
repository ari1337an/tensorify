"use server";

import { onboardingQuestions } from "@/app/api/v1/_client/client";

export default async function Page() {
  const res = await onboardingQuestions({});
  return <div>{JSON.stringify(res)}</div>;
}
